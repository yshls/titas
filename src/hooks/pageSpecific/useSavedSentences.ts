import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/appStore';
import { generateUUID } from '@/utils/uuid';
import {
  fetchSavedSentences,
  saveSentenceToDB,
  deleteSavedSentenceFromDB,
} from '@/services/dbService';
import type { SavedSentence } from '@/utils/types';

const QUERY_KEY = 'savedSentences';

export function useSavedSentences() {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const queryClient = useQueryClient();

  // 비로그인 사용자는 localStorage에 담기므로 로그인 여부와 무관하게 조회한다.
  const { data: sentences = [], isLoading } = useQuery<SavedSentence[]>({
    queryKey: [QUERY_KEY, user?.id ?? 'local'],
    queryFn: fetchSavedSentences,
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    [queryClient],
  );

  const save = useCallback(
    async (input: Omit<SavedSentence, 'id' | 'createdAt'>) => {
      try {
        await saveSentenceToDB({
          ...input,
          id: generateUUID(),
          createdAt: Date.now(),
        });
        await invalidate();
        toast.success(t('saved.savedToast'));
      } catch (error) {
        console.error('Failed to save sentence:', error);
        toast.error(t('saved.saveFailed'));
      }
    },
    [invalidate, t],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteSavedSentenceFromDB(id);
        await invalidate();
      } catch (error) {
        console.error('Failed to delete saved sentence:', error);
        toast.error(t('saved.deleteFailed'));
      }
    },
    [invalidate, t],
  );

  // 같은 문장을 이미 담았는지 (저장 버튼 상태 표시용)
  const isSaved = useCallback(
    (text: string) => sentences.some((s) => s.text === text),
    [sentences],
  );

  const findByText = useCallback(
    (text: string) => sentences.find((s) => s.text === text),
    [sentences],
  );

  return { sentences, isLoading, save, remove, isSaved, findByText };
}
