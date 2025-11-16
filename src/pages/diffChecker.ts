import { diffWords } from 'jsdiff';

// 피드백 카드 데이터 모델
export interface DiffResult {
  value: string; // 단어
  status: 'correct' | 'added' | 'removed'; // 상태
}

/**
 * [Algo 2: The Diff Engine]
 * jsdiff 라이브러리를 사용하여 두 문장을 단어 단위로 비교하고,
 * 피드백 UI가 이해할 수 있는 자료구조로 변환
 */
export function checkWordDiff(original: string, spoken: string): DiffResult[] {
  const diff = diffWords(original, spoken, { ignoreCase: true });

  const results: DiffResult[] = [];

  diff.forEach((part) => {
    if (part.added) {
      results.push({ value: part.value, status: 'added' });
    } else if (part.removed) {
      results.push({ value: part.value, status: 'removed' });
    } else {
      results.push({ value: part.value, status: 'correct' });
    }
  });

  return results;
}
