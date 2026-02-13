import {
  getDueReviews,
  logPractice,
  getPriorityScore,
  schedule,
} from '@/services/fsrsService';

/**
 * FSRS (Free Spaced Repetition Scheduler) 복습 시스템
 *
 * 망각곡선을 기반으로 최적의 복습 시점을 계산하는 Hook
 * Anki의 SM-2 알고리즘을 개선한 버전
 */
export function useFSRSRepetition() {
  // Hook이 제공하는 함수들
  return {
    getDueReviews, // 복습 대기 목록 조회
    logPractice, // 학습 결과 기록
    getPriorityScore, // 우선순위 계산
    schedule, // 일정 계산
  };
}

