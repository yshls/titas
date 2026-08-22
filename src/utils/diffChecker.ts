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

/** 공백 기준 실제 단어 수 (빈 문자열은 0) */
function countWords(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * 비교 결과에서 정확도를 계산한다.
 *
 * diffWords는 연속으로 일치한 구간을 한 덩어리로 묶어 돌려주므로
 * (예: ["i am looking for a new ", "job", "car"]) 덩어리 개수를 세면
 * 6단어를 맞혀도 1로 계산돼 정확도가 실제보다 크게 낮아진다.
 * 반드시 덩어리 안의 단어 수를 세어야 한다.
 *
 * 사용자가 덧붙인 말(added)은 분모에서 제외해 원문을 얼마나 재현했는지를 본다.
 */
export function calculateAccuracy(diff: DiffResult[]): {
  total: number;
  correct: number;
  ratio: number;
} {
  let total = 0;
  let correct = 0;

  diff.forEach((part) => {
    const words = countWords(part.value);
    if (part.status !== 'added') total += words;
    if (part.status === 'correct') correct += words;
  });

  return { total, correct, ratio: total > 0 ? correct / total : 1 };
}

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
