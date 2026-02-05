import { supabase } from '@/supabaseClient';

//  복습 로그 타입 정의
export interface PracticeLog {
  id: string;
  script_id: string; // 스크립트 ID
  line_index: number; // 문장 인덱스
  accuracy: number; // 정확도 (0~100)
  stability: number; // 안정도 (기억 강도)
  retrievability: number; // 회상 가능성 (0~1)
  repetitions: number; // 반복 횟수
  last_interval: number; // 마지막 복습 간격 (일)
  ease_factor: number; // 난이도 계수
  scheduled_days: number; // 다음 복습까지 일수
  last_reviewed: string; // 마지막 복습 시간
  next_review: string; // 다음 복습 예정 시간
}

//  목표 회상률 (90% 기억 유지)
const DESIRED_RETENTION = 0.9;

/**
 * FSRS (Free Spaced Repetition Scheduler) 복습 시스템
 *
 * 망각곡선을 기반으로 최적의 복습 시점을 계산하는 Hook
 * Anki의 SM-2 알고리즘을 개선한 버전
 */
export function useFSRSRepetition() {
  /**
   *  복습 일정 계산 함수
   *
   * @param log - 현재 학습 로그
   * @param grade - 평가 점수 (1~5)
   *   5: 완벽
   *   4: 좋음
   *   3: 보통
   *   2: 어려움
   *   1: 실패
   * @returns 업데이트된 학습 정보
   */
  const schedule = (log: PracticeLog, grade: number) => {
    const { stability, repetitions, ease_factor } = log;

    // 첫 복습: 1일 후 재학습
    if (repetitions === 0) {
      return {
        stability: 1.0, // 초기 안정도
        retrievability: 0.9, // 초기 회상률
        repetitions: 1, // 첫 반복
        scheduled_days: 1, // 1일 후 복습
        ease_factor: 2.5, // 기본 난이도
      };
    }

    // 난이도 계산 (성적이 좋을수록 낮아짐)
    const difficulty = 4 - (grade / 5) * 2;

    // 새로운 안정도 계산 (성적에 따라 증가/감소)
    const new_stability = stability * (1 + difficulty) * (grade / 5);

    // 다음 복습 간격 계산 (안정도 기반)
    let interval_days = new_stability * 0.1;

    // 최소 1일, 최대 60일로 제한
    interval_days = Math.max(1, Math.min(60, interval_days));

    // 다음 복습 날짜 계산
    const next_review = new Date();
    next_review.setDate(next_review.getDate() + interval_days);

    return {
      stability: new_stability, // 업데이트된 안정도
      retrievability: DESIRED_RETENTION, // 목표 회상률
      repetitions: repetitions + 1, // 반복 횟수 증가
      last_interval: interval_days, // 이번 복습 간격
      ease_factor: ease_factor + (grade > 3 ? 0.15 : -0.15), // 난이도 조정
      scheduled_days: interval_days, // 다음 복습까지 일수
      next_review: next_review.toISOString(), // 다음 복습 날짜
    };
  };

  /**
   * 복습 대기 목록 가져오기
   *
   * 다음 복습 시간이 지난 항목들을 우선순위대로 반환
   *
   * @returns 복습이 필요한 항목 목록 (최대 20개)
   */
  const getDueReviews = async () => {
    const { data } = await supabase
      .from('study_logs') // study_logs 테이블에서 조회
      .select('*')
      .lt('next_review', new Date().toISOString()) // 복습 시간이 지난 것만
      .order('next_review', { ascending: true }) // 오래된 순서대로
      .limit(20); // 최대 20개

    return data || [];
  };

  /**
   * 학습 결과 기록
   *
   * 문장 복습 결과를 기록하고 다음 복습 일정을 계산
   *
   * @param scriptId - 스크립트 ID
   * @param lineIndex - 문장 번호
   * @param accuracy - 정확도 (0~100)
   * @param grade - 평가 점수 (1~5)
   */
  const logPractice = async (
    scriptId: string,
    lineIndex: number,
    accuracy: number,
    grade: number,
  ) => {
    // 기존 학습 기록 찾기
    const { data: existing } = await supabase
      .from('study_logs')
      .select('*')
      .eq('script_id', scriptId)
      .eq('line_index', lineIndex)
      .single();

    // 기존 기록이 있으면 사용, 없으면 새로 생성
    const currentLog = existing || {
      script_id: scriptId,
      line_index: lineIndex,
      accuracy,
      stability: 1.0, // 초기 안정도
      retrievability: 0.9, // 초기 회상률
      repetitions: 0, // 첫 학습
      ease_factor: 2.5, // 기본 난이도
      last_interval: 0,
      scheduled_days: 1,
      last_reviewed: new Date().toISOString(),
    };

    // 다음 복습 일정 계산
    const updated = schedule(currentLog, grade);

    // 데이터베이스에 저장/업데이트
    const { error } = await supabase.from('study_logs').upsert({
      ...currentLog,
      accuracy,
      ...updated,
      last_reviewed: new Date().toISOString(), // 현재 시간으로 업데이트
    });

    if (error) throw error;
  };

  /**
   * 우선순위 점수 계산
   *
   * 복습 긴급도를 계산 (점수가 높을수록 급함)
   *
   * 계산 요소:
   * - 연체 일수 (오래될수록 높음)
   * - 안정도 (낮을수록 높음)
   * - 회상 가능성 (낮을수록 높음)
   *
   * @param log - 학습 로그
   * @returns 우선순위 점수 (높을수록 급함)
   */
  const getPriorityScore = (log: PracticeLog) => {
    // 연체 일수 계산 (음수면 0으로 처리)
    const daysOverdue = Math.max(
      0,
      Math.floor(
        (new Date().getTime() - new Date(log.next_review).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    // 안정도가 낮을수록 높은 점수
    const stabilityFactor = 1 / log.stability;

    // 회상 가능성이 낮을수록 높은 점수
    const retrievabilityFactor = 1 - log.retrievability;

    // 최종 우선순위 = 연체일수 × 안정도 역수 × 회상 불가능성
    return daysOverdue * stabilityFactor * retrievabilityFactor;
  };

  // Hook이 제공하는 함수들
  return {
    getDueReviews, // 복습 대기 목록 조회
    logPractice, // 학습 결과 기록
    getPriorityScore, // 우선순위 계산
    schedule, // 일정 계산
  };
}
