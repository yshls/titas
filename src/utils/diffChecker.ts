import * as Diff from 'diff';

export interface DiffResult {
  value: string;
  status: 'correct' | 'added' | 'removed';
}

/**
 * 두 문장을 단어 단위로 비교하여 차이 분석
 * @param original - 정답 문장
 * @param spoken - 사용자 입력 문장
 * @returns 단어별 비교 결과 배열
 */

export function checkWordDiff(original: string, spoken: string): DiffResult[] {
  if (typeof Diff.diffWords !== 'function') {
    console.error('Diff.diffWords is NOT a function! Check import/library.');
    return [];
  }

  const diff = Diff.diffWords(original, spoken, { ignoreCase: true });

  return diff.map((part: Diff.Change) => {
    if (part.added) {
      return { value: part.value, status: 'added' };
    }
    if (part.removed) {
      return { value: part.value, status: 'removed' };
    }
    return { value: part.value, status: 'correct' };
  });
}
