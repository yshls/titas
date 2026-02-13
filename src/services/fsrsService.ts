import { supabase } from '@/supabaseClient';

//  복습 로그 타입 정의
export interface FSRSReviewLog {
  script_id: number; // 스크립트 ID
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
 *  FSRS 복습 일정 계산 함수
 */
export const schedule = (log: FSRSReviewLog, grade: number) => {
  const { stability, repetitions, ease_factor } = log;

  // 많이 틀렸을 때(Grade 1)는 10분 뒤에 바로 복습 (단기 기억 강화)
  if (grade === 1) {
    const nextReview = new Date();
    nextReview.setMinutes(nextReview.getMinutes() + 10);

    return {
      stability: 0.1,
      retrievability: 1.0,
      repetitions: 0,
      last_interval: 0,
      ease_factor: Math.max(1.3, ease_factor - 0.2),
      scheduled_days: 0,
      next_review: nextReview.toISOString(),
    };
  }

  // 첫 복습: 1일 후 재학습
  if (repetitions === 0) {
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1); // 1일 뒤

    return {
      stability: 1.0, // 초기 안정도
      retrievability: 0.9, // 초기 회상률
      repetitions: 1, // 첫 반복
      scheduled_days: 1, // 1일 후 복습
      ease_factor: 2.5, // 기본 난이도
      next_review: nextReview.toISOString(), // [수정] DB 저장을 위해 날짜 명시
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
 */
export const getDueReviews = async () => {
  const { data } = await supabase
    .from('study_logs') // 테이블 이름 변경
    .select('*')
    .lt('next_review', new Date().toISOString()) // 복습 시간이 지난 것만
    .order('next_review', { ascending: true }) // 오래된 순서대로
    .limit(20); // 최대 20개

  return data || [];
};

/**
 * 다음 복습 예정 시간 가져오기 (빈 화면에서 '언제 다시 올지' 알려주기 위함)
 */
export const getNextReviewTime = async () => {
  const { data } = await supabase
    .from('study_logs')
    .select('next_review')
    .gt('next_review', new Date().toISOString()) // 미래에 있는 것만
    .order('next_review', { ascending: true }) // 가장 가까운 순서
    .limit(1);

  return data?.[0]?.next_review || null;
};

/**
 * 학습 결과 기록
 */
export const logPractice = async (
  scriptId: string,
  lineIndex: number,
  accuracy: number,
  grade: number,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const numericScriptId = parseInt(scriptId, 10);
  if (isNaN(numericScriptId)) {
    console.error('Invalid scriptId for logPractice:', scriptId);
    return;
  }

  // 기존 학습 기록 찾기
  const { data: existing } = await supabase
    .from('study_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('script_id', numericScriptId)
    .eq('line_index', lineIndex)
    .single();

  // 기존 기록이 있으면 사용, 없으면 새로 생성
  const currentLog: FSRSReviewLog = existing || {
    script_id: numericScriptId,
    line_index: lineIndex,
    accuracy,
    stability: 1.0, // 초기 안정도
    retrievability: 0.9, // 초기 회상률
    repetitions: 0, // 첫 학습
    ease_factor: 2.5, // 기본 난이도
    last_interval: 0,
    scheduled_days: 1,
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString(),
  };

  // 다음 복습 일정 계산
  const updated = schedule(currentLog, grade);

  // 데이터베이스에 저장/업데이트
  const logToUpsert = {
    ...currentLog,
    user_id: user.id,
    script_id: numericScriptId,
    line_index: lineIndex,
    accuracy,
    ...updated,
    last_reviewed: new Date().toISOString(),
  };

  const { error } = await supabase.from('study_logs').upsert(logToUpsert);

  if (error) throw error;
};

/**
 * 우선순위 점수 계산
 */
export const getPriorityScore = (log: FSRSReviewLog) => {
  const daysOverdue = Math.max(
    0,
    Math.floor(
      (new Date().getTime() - new Date(log.next_review).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const stabilityFactor = 1 / log.stability;
  const retrievabilityFactor = 1 - log.retrievability;
  return daysOverdue * stabilityFactor * retrievabilityFactor;
};
