import { create } from 'zustand';
import type { DialogueLine, WeakSpot, PracticeLog } from '@/utils/types';
import { type DiffResult } from '@/utils/diffChecker';
import { useAppStore } from './appStore';
import { addPracticeLog as addPracticeLogLocally } from '@/utils/storageService';
import { logPractice } from '@/services/fsrsService';
import toast from 'react-hot-toast';

export type PracticeStatus = 'idle' | 'preparing' | 'active' | 'finished';

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

    let totalWords = 0;
    let correctWords = 0;
    Object.values(feedbackMap).forEach((diff) => {
      diff.forEach((part) => {
        if (part.status !== 'added') totalWords++;
        if (part.status === 'correct') correctWords++;
      });
    });
    const accuracy =
      totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;
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
    const uniqueErrorLineIndexes = [
      ...new Set(sessionErrors.map((e) => e.lineIndex)),
    ];

    practicedLineIndexes.forEach((lineIndex) => {
      const feedback = feedbackMap[lineIndex];
      if (!feedback) return;

      let lineTotalWords = 0;
      let lineCorrectWords = 0;
      feedback.forEach((part) => {
        if (part.status !== 'added') lineTotalWords++;
        if (part.status === 'correct') lineCorrectWords++;
      });

      const lineAccuracy =
        lineTotalWords > 0 ? lineCorrectWords / lineTotalWords : 1;
      const isErrorLine = uniqueErrorLineIndexes.includes(lineIndex);

      let grade = 1; // 실패
      if (!isErrorLine) {
        if (lineAccuracy >= 0.95) grade = 5; // 완벽
        else if (lineAccuracy >= 0.8) grade = 4; // 쉬움
        else if (lineAccuracy >= 0.6) grade = 3; // 보통
        else grade = 2; // 어려움
      }

      logPractice(scriptId, lineIndex, Math.round(lineAccuracy * 100), grade);
    });

    if (user) {
      addNewPracticeLog(newLog, title || 'Practice Session');
      toast.success('Practice complete! Progress saved to your account.');
    } else {
      addPracticeLogLocally(newLog);
      toast.success('Practice complete! Progress saved to this browser.');
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
    toast.success("Alright, let's go again! Round two.");
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
