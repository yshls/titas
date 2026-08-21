import { describe, it, expect, beforeEach, vi } from 'vitest';

// 실제 저장·알림은 이 테스트의 관심사가 아니라 전부 막아둔다.
const logPractice = vi.fn();
const addNewPracticeLog = vi.fn();

vi.mock('@/services/fsrsService', () => ({
  logPractice: (...args: unknown[]) => logPractice(...args),
}));
vi.mock('@/utils/storageService', () => ({ addPracticeLog: vi.fn() }));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }));
vi.mock('./appStore', () => ({
  useAppStore: { getState: () => ({ user: null, addNewPracticeLog }) },
}));

const { usePracticeStore, gradeFromAccuracy } = await import('./practiceStore');
const { checkWordDiff } = await import('@/utils/diffChecker');

const LINES = [
  { id: 'l1', speakerId: 'A', speakerColor: '#fff', originalLine: 'i am looking for a new job' },
  { id: 'l2', speakerId: 'A', speakerColor: '#fff', originalLine: 'thank you so much' },
];

/** 한 문장을 말한 것처럼 기록한다. */
const speak = (lineIndex: number, spoken: string) => {
  const original = LINES[lineIndex].originalLine;
  usePracticeStore
    .getState()
    .addUserInput(lineIndex, spoken, checkWordDiff(original, spoken));
};

beforeEach(() => {
  logPractice.mockClear();
  addNewPracticeLog.mockClear();
  usePracticeStore.getState().preparePractice(LINES, '1', '테스트');
  usePracticeStore.getState().startPractice('A');
});

describe('gradeFromAccuracy', () => {
  it('정확도 구간마다 다른 점수를 준다', () => {
    expect(gradeFromAccuracy(1)).toBe(5);
    expect(gradeFromAccuracy(0.95)).toBe(5);
    expect(gradeFromAccuracy(0.86)).toBe(4);
    expect(gradeFromAccuracy(0.7)).toBe(3);
    expect(gradeFromAccuracy(0.5)).toBe(2);
    expect(gradeFromAccuracy(0.2)).toBe(1);
    expect(gradeFromAccuracy(0)).toBe(1);
  });
});

describe('retryCurrentLine', () => {
  it('현재 문장의 결과·입력·오답만 지우고 나머지는 남긴다', () => {
    speak(0, 'i am looking for a new car');
    usePracticeStore.getState().advanceLine();
    speak(1, 'thank you very much');

    // 지금은 2번째 문장 차례
    usePracticeStore.getState().retryCurrentLine();

    const state = usePracticeStore.getState();
    expect(state.feedbackMap[1]).toBeUndefined();
    expect(state.userInputMap[1]).toBeUndefined();
    expect(state.feedbackMap[0]).toBeDefined(); // 첫 문장은 그대로
    expect(state.userInputMap[0]).toBe('i am looking for a new car');
    expect(state.sessionErrors.every((e) => e.lineIndex === 0)).toBe(true);
  });

  it('다시 말하면 오답이 중복으로 쌓이지 않는다', () => {
    speak(0, 'i am looking for a new car');
    const firstTry = usePracticeStore.getState().sessionErrors.length;

    usePracticeStore.getState().retryCurrentLine();
    speak(0, 'i am looking for a new car');

    expect(usePracticeStore.getState().sessionErrors).toHaveLength(firstTry);
  });

  it('문장 번호는 그대로 둔다 (다시 말하기지 되돌아가기가 아니다)', () => {
    usePracticeStore.getState().advanceLine();
    speak(1, 'thank you very much');

    usePracticeStore.getState().retryCurrentLine();

    expect(usePracticeStore.getState().currentLineIndex).toBe(1);
  });
});

describe('finishPractice', () => {
  it('세션 정확도는 문장별 평균이 아니라 전체 단어 기준이다', () => {
    speak(0, 'i am looking for a new car'); // 7단어 중 6개
    speak(1, 'thank you so much'); // 4단어 전부

    usePracticeStore.getState().finishPractice();

    // (6 + 4) / (7 + 4) = 90.9% → 91
    expect(usePracticeStore.getState().practiceResult?.accuracy).toBe(91);
  });

  it('한 단어만 틀린 문장은 1점이 아니라 부분 점수를 받는다', () => {
    speak(0, 'i am looking for a new car'); // 6/7 = 86%

    usePracticeStore.getState().finishPractice();

    const [, , accuracy, grade] = logPractice.mock.calls[0];
    expect(accuracy).toBe(86);
    expect(grade).toBe(4);
  });

  it('원문을 다 말한 뒤 덧붙이기만 하면 만점이다', () => {
    speak(1, 'thank you so much indeed');

    usePracticeStore.getState().finishPractice();

    const [, , accuracy, grade] = logPractice.mock.calls[0];
    expect(accuracy).toBe(100);
    expect(grade).toBe(5);
  });

  it('거의 못 맞힌 문장만 1점이다', () => {
    speak(1, 'hello');

    usePracticeStore.getState().finishPractice();

    expect(logPractice.mock.calls[0][3]).toBe(1);
  });

  it('말한 문장 수만큼만 기록한다', () => {
    speak(0, 'i am looking for a new job');

    usePracticeStore.getState().finishPractice();

    expect(logPractice).toHaveBeenCalledTimes(1);
    expect(usePracticeStore.getState().status).toBe('finished');
  });
});
