import { create } from 'zustand';
import type { DialogueLine, WeakSpot, PracticeLog } from '@/utils/types';
import { type DiffResult, calculateAccuracy } from '@/utils/diffChecker';
import { useAppStore } from './appStore';
import { addPracticeLog as addPracticeLogLocally } from '@/utils/storageService';
import { logPractice } from '@/services/fsrsService';
import toast from 'react-hot-toast';
import i18n from '@/i18n';

export type PracticeStatus = 'idle' | 'preparing' | 'active' | 'finished';

/**
 * 문장 정확도를 FSRS 점수(1~5)로 바꾼다.
 *
 * 예전에는 틀린 단어가 하나라도 있으면 무조건 1점(=10분 뒤 재복습)이었다.
 * 그러면 90% 맞힌 문장과 하나도 못 맞힌 문장이 똑같이 취급돼 2~4점이 아예
 * 나오지 않았고, 원문을 다 말한 뒤 말을 덧붙이기만 해도 1점이 됐다.
 * 정확도만 보고 나누면 복습 간격이 실력에 맞게 벌어진다.
 */
export function gradeFromAccuracy(ratio: number): number {
  if (ratio >= 0.95) return 5; // 완벽
  if (ratio >= 0.8) return 4; // 쉬움
  if (ratio >= 0.6) return 3; // 보통
  if (ratio >= 0.4) return 2; // 어려움
  return 1; // 실패
}

export interface PracticeState {
  // Core State
  status: PracticeStatus;
  lines: DialogueLine[];
  scriptId: string;
  title: string;
  currentLineIndex: number;
  userSpeakerId: string | null;
  startTime: number;
  practiceResult: { accuracy: number; timeSpent: number } | null;

  // Data State
  feedbackMap: Record<number, DiffResult[]>;
  userInputMap: Record<number, string>;
  userAudioMap: Record<number, string>;
  sessionErrors: WeakSpot[];

  // Actions
  preparePractice: (
    lines: DialogueLine[],
    scriptId: string,
    title: string,
  ) => void;
  startPractice: (userSpeakerId: string) => void;
  addUserInput: (
    lineIndex: number,
    userInput: string,
    diff: DiffResult[],
  ) => void;
  addUserAudio: (lineIndex: number, audioUrl: string) => void;
  advanceLine: () => void;
  /** 현재 문장의 결과를 지우고 다시 말할 수 있게 되돌린다. */
  retryCurrentLine: () => void;
  finishPractice: () => void;
  retryPractice: () => void;
  exitPractice: () => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  // Initial State
  status: 'idle',
  lines: [],
  scriptId: '',
  title: '',
  currentLineIndex: 0,
  userSpeakerId: null,
  startTime: 0,
  practiceResult: null,
  feedbackMap: {},
  userInputMap: {},
  userAudioMap: {},
  sessionErrors: [],

  // Actions
  preparePractice: (lines, scriptId, title) => {
    set({
      status: 'preparing',
      lines,
      scriptId,
      title,
      // 이전 상태 초기화
      currentLineIndex: 0,
      userSpeakerId: null,
      startTime: 0,
      practiceResult: null,
      feedbackMap: {},
      userInputMap: {},
      userAudioMap: {},
      sessionErrors: [],
    });
  },

  startPractice: (userSpeakerId) => {
    set({
      status: 'active',
      userSpeakerId,
      startTime: Date.now(),
    });
  },

  addUserInput: (lineIndex, userInput, diff) => {
    const newErrors: WeakSpot[] = diff
      .filter((p) => p.status === 'removed' || p.status === 'added')
      .map((p) => ({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        original: p.status === 'removed' ? p.value : '',
        spoken: p.status === 'added' ? p.value : '',
        scriptId: get().scriptId,
        lineIndex: lineIndex,
        lineContent: get().lines[lineIndex].originalLine,
      }));

    set((state) => ({
      userInputMap: { ...state.userInputMap, [lineIndex]: userInput },
      feedbackMap: { ...state.feedbackMap, [lineIndex]: diff },
      sessionErrors: [...state.sessionErrors, ...newErrors],
    }));
  },

  addUserAudio: (lineIndex, audioUrl) => {
    set((state) => ({
      userAudioMap: { ...state.userAudioMap, [lineIndex]: audioUrl },
    }));
  },

  retryCurrentLine: () => {
    const { currentLineIndex } = get();

    set((state) => {
      // 해당 라인의 결과만 걷어내고 나머지 진행 상황은 유지한다.
      const { [currentLineIndex]: _f, ...feedbackMap } = state.feedbackMap;
      const { [currentLineIndex]: _i, ...userInputMap } = state.userInputMap;
      const { [currentLineIndex]: _a, ...userAudioMap } = state.userAudioMap;

      return {
        feedbackMap,
        userInputMap,
        userAudioMap,
        // 이번 시도에서 기록된 오답도 함께 지워야 실수 목록에 중복으로 쌓이지 않는다.
        sessionErrors: state.sessionErrors.filter(
          (e) => e.lineIndex !== currentLineIndex,
        ),
      };
    });
  },

  advanceLine: () => {
    set((state) => ({ currentLineIndex: state.currentLineIndex + 1 }));
  },

  finishPractice: () => {
    const {
      startTime,
      feedbackMap,
      sessionErrors,
      scriptId,
      title,
      userInputMap,
    } = get();
    const user = useAppStore.getState().user;
    const addNewPracticeLog = useAppStore.getState().addNewPracticeLog;

    // 세션 전체 정확도: 모든 라인의 단어를 합산해 한 번에 계산한다.
    const sessionDiff = Object.values(feedbackMap).flat();
    const accuracy = Math.round(calculateAccuracy(sessionDiff).ratio * 100);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const newLog: PracticeLog = {
      id: crypto.randomUUID(),
      date: Date.now(),
      scriptId: scriptId,
      accuracy,
      timeSpent,
      errors: sessionErrors,
    };

    //  FSRS 로직: 연습한 모든 라인에 대해 한 번만 기록
    const practicedLineIndexes = Object.keys(userInputMap).map(Number);

    practicedLineIndexes.forEach((lineIndex) => {
      const feedback = feedbackMap[lineIndex];
      if (!feedback) return;

      const lineAccuracy = calculateAccuracy(feedback).ratio;

      logPractice(
        scriptId,
        lineIndex,
        Math.round(lineAccuracy * 100),
        gradeFromAccuracy(lineAccuracy),
      );
    });

    if (user) {
      addNewPracticeLog(newLog, title || 'Practice Session');
      toast.success(i18n.t('toast.savedToAccount'));
    } else {
      addPracticeLogLocally(newLog);
      toast.success(i18n.t('toast.savedToBrowser'));
    }

    set({ status: 'finished', practiceResult: { accuracy, timeSpent } });
  },

  retryPractice: () => {
    set({
      status: 'active',
      currentLineIndex: 0,
      startTime: Date.now(),
      feedbackMap: {},
      userInputMap: {},
      userAudioMap: {},
      sessionErrors: [],
      practiceResult: null,
    });
    toast.success(i18n.t('toast.restartPractice'));
  },

  exitPractice: () => {
    set({
      status: 'idle',
      lines: [],
      scriptId: '',
      title: '',
    });
  },
}));
