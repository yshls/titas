import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { schedule, getPriorityScore, type FSRSReviewLog } from './fsrsService';

const NOW = new Date('2026-03-01T09:00:00.000Z');

/** 복습 기록 기본값. 필요한 필드만 덮어써서 쓴다. */
const makeLog = (overrides: Partial<FSRSReviewLog> = {}): FSRSReviewLog => ({
  id: 'log-1',
  script_id: 1,
  line_index: 0,
  accuracy: 100,
  stability: 1,
  retrievability: 0.9,
  repetitions: 1,
  last_interval: 1,
  ease_factor: 2.5,
  scheduled_days: 1,
  last_reviewed: NOW.toISOString(),
  next_review: NOW.toISOString(),
  ...overrides,
});

/** 지금부터 다음 복습까지 몇 분 뒤인지 */
const minutesUntil = (iso: string) =>
  Math.round((new Date(iso).getTime() - NOW.getTime()) / 60000);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('schedule', () => {
  it('많이 틀리면(1점) 10분 뒤에 다시 복습한다', () => {
    const result = schedule(makeLog({ repetitions: 5, stability: 20 }), 1);

    expect(minutesUntil(result.next_review)).toBe(10);
    expect(result.repetitions).toBe(0); // 처음부터 다시
    expect(result.stability).toBe(0.1);
  });

  it('1점을 받으면 난이도 계수가 낮아지되 1.3 아래로는 안 내려간다', () => {
    expect(schedule(makeLog({ ease_factor: 2.5 }), 1).ease_factor).toBeCloseTo(2.3);
    expect(schedule(makeLog({ ease_factor: 1.3 }), 1).ease_factor).toBe(1.3);
    expect(schedule(makeLog({ ease_factor: 1.4 }), 1).ease_factor).toBe(1.3);
  });

  it('처음 보는 문장은 하루 뒤로 잡는다', () => {
    const result = schedule(makeLog({ repetitions: 0 }), 5);

    expect(result.repetitions).toBe(1);
    expect(result.scheduled_days).toBe(1);
    expect(minutesUntil(result.next_review)).toBe(24 * 60);
  });

  it('복습할수록 반복 횟수가 늘어난다', () => {
    expect(schedule(makeLog({ repetitions: 3 }), 4).repetitions).toBe(4);
  });

  it('간격은 최소 1일이다', () => {
    // 안정도가 낮으면 계산상 하루가 안 되지만 최소 1일로 올린다.
    const result = schedule(makeLog({ repetitions: 2, stability: 0.5 }), 3);
    expect(result.scheduled_days).toBe(1);
  });

  it('간격은 최대 60일을 넘지 않는다', () => {
    const result = schedule(makeLog({ repetitions: 10, stability: 10000 }), 5);
    expect(result.scheduled_days).toBe(60);
  });

  it('잘 맞히면(4점 이상) 난이도 계수가 올라가고, 아니면 내려간다', () => {
    const base = makeLog({ repetitions: 2, ease_factor: 2.5 });
    expect(schedule(base, 5).ease_factor).toBeCloseTo(2.65);
    expect(schedule(base, 3).ease_factor).toBeCloseTo(2.35);
  });

  it('점수가 높을수록 다음 복습 간격이 길어진다', () => {
    const base = makeLog({ repetitions: 2, stability: 30 });
    const easy = schedule(base, 5).scheduled_days;
    const hard = schedule(base, 2).scheduled_days;
    expect(easy).toBeGreaterThan(hard);
  });
});

describe('getPriorityScore', () => {
  it('아직 복습일이 안 됐으면 0점이다', () => {
    const future = new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1000);
    expect(getPriorityScore(makeLog({ next_review: future.toISOString() }))).toBe(0);
  });

  it('오래 밀릴수록 점수가 높다', () => {
    const daysAgo = (n: number) =>
      new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

    const recent = getPriorityScore(makeLog({ next_review: daysAgo(1) }));
    const stale = getPriorityScore(makeLog({ next_review: daysAgo(10) }));

    expect(stale).toBeGreaterThan(recent);
  });

  it('덜 외운 문장(안정도가 낮은 쪽)이 먼저 온다', () => {
    const twoDaysAgo = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const shaky = getPriorityScore(
      makeLog({ next_review: twoDaysAgo, stability: 1 }),
    );
    const solid = getPriorityScore(
      makeLog({ next_review: twoDaysAgo, stability: 50 }),
    );

    expect(shaky).toBeGreaterThan(solid);
  });
});
