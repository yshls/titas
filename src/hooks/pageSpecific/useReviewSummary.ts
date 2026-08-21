import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/appStore';
import {
  getDueReviewCount,
  getTotalLearningCount,
  getNextReviewTime,
} from '@/services/fsrsService';

export interface ReviewSummary {
  dueCount: number;
  totalCount: number;
  nextReviewTime: string | null;
}

/**
 * 대시보드의 스마트 복습 안내에 필요한 요약 정보.
 * 복습 데이터는 로그인 사용자에게만 존재하므로 비로그인 시에는 조회하지 않는다.
 */
export function useReviewSummary() {
  const user = useAppStore((state) => state.user);

  const { data, isLoading } = useQuery<ReviewSummary>({
    queryKey: ['reviewSummary', user?.id],
    queryFn: async () => {
      const [dueCount, totalCount, nextReviewTime] = await Promise.all([
        getDueReviewCount(),
        getTotalLearningCount(),
        getNextReviewTime(),
      ]);
      return { dueCount, totalCount, nextReviewTime };
    },
    enabled: !!user,
    // 복습 예정 시각은 시간이 지나면 바뀌므로 대시보드 재방문 시 비교적 자주 갱신한다.
    staleTime: 1000 * 60,
  });

  return {
    isLoading,
    dueCount: data?.dueCount ?? 0,
    totalCount: data?.totalCount ?? 0,
    nextReviewTime: data?.nextReviewTime ?? null,
  };
}
