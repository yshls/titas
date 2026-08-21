import { describe, it, expect } from 'vitest';
import { checkWordDiff, calculateAccuracy } from './diffChecker';

/** 실제 연습 흐름과 동일하게 비교 후 정확도(%)를 낸다. */
const accuracyOf = (original: string, spoken: string) =>
  Math.round(calculateAccuracy(checkWordDiff(original, spoken)).ratio * 100);

describe('calculateAccuracy', () => {
  it('완전히 똑같이 말하면 100%', () => {
    expect(accuracyOf('i am looking for a new job', 'i am looking for a new job')).toBe(100);
  });

  it('7단어 중 1단어만 틀리면 86% (덩어리가 아니라 단어를 센다)', () => {
    // diffWords는 앞의 6단어를 "i am looking for a new "라는 한 덩어리로 묶어 돌려준다.
    // 덩어리 개수를 세면 1/2 = 50%가 되어 실제 실력보다 훨씬 낮게 나온다.
    expect(accuracyOf('i am looking for a new job', 'i am looking for a new car')).toBe(86);
  });

  it('완전히 다르게 말하면 0%', () => {
    expect(accuracyOf('hello there', 'completely different words')).toBe(0);
  });

  it('원문을 다 말하고 덧붙이기만 하면 100% (덧붙인 말은 분모에서 제외)', () => {
    expect(accuracyOf('thank you', 'thank you so much')).toBe(100);
  });

  it('일부를 빠뜨리면 그만큼 낮아진다', () => {
    // 4단어 중 2단어만 말함
    expect(accuracyOf('one two three four', 'one two')).toBe(50);
  });

  it('빈 비교 결과는 100%로 둔다 (0으로 나누지 않음)', () => {
    expect(calculateAccuracy([]).ratio).toBe(1);
  });

  it('덩어리 안의 단어 수를 합산한다', () => {
    const result = calculateAccuracy([
      { value: 'i am looking for a new ', status: 'correct' },
      { value: 'job', status: 'removed' },
      { value: 'car', status: 'added' },
    ]);
    // correct 6단어 + removed 1단어 = 분모 7, 분자 6
    expect(result).toEqual({ total: 7, correct: 6, ratio: 6 / 7 });
  });
});

describe('checkWordDiff', () => {
  it('대소문자는 무시한다', () => {
    const diff = checkWordDiff('Hello World', 'hello world');
    expect(diff.every((p) => p.status === 'correct')).toBe(true);
  });

  it('틀린 단어는 removed, 대신 말한 단어는 added로 표시한다', () => {
    const diff = checkWordDiff('i want a job', 'i want a car');
    expect(diff.find((p) => p.status === 'removed')?.value.trim()).toBe('job');
    expect(diff.find((p) => p.status === 'added')?.value.trim()).toBe('car');
  });
});
