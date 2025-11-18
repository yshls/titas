import { create } from 'zustand';

import type { DialogueLine, ScriptData, PracticeLog } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';

import {
  loadAllScripts,
  saveScript,
  loadPracticeLogs,
  addPracticeLog,
} from '@/utils/storageService';

// 앱 전역 상태 타입 정의
export interface AppState {
  // 전역 상태
  allScripts: ScriptData[];
  practiceLogs: PracticeLog[];

  // 대화 훈련 임시 상태
  currentScript: DialogueLine[];
  spokenText: string;
  lastDiffResult: DiffResult[];

  // 상태 관리 액션
  loadInitialData: () => void;
  saveNewScript: (script: ScriptData) => void;
  addNewPracticeLog: (logEntry: PracticeLog) => void;

  // 대화 상태 업데이트
  setSpokenText: (text: string) => void;
  recordDiffResult: (result: DiffResult[]) => void;
  loadScript: (script: DialogueLine[]) => void;
}

// Zustand 스토어 생성
export const useAppStore = create<AppState>((set) => ({
  // 초기 상태
  allScripts: [],
  practiceLogs: [],

  currentScript: [],
  spokenText: '',
  lastDiffResult: [],

  // 초기 데이터 로드
  loadInitialData: () => {
    const scripts = loadAllScripts();
    const logs = loadPracticeLogs();
    set({
      allScripts: scripts,
      practiceLogs: logs,
    });
    console.log(
      `[Store] Initial Data Loaded: ${scripts.length} scripts, ${logs.length} logs`
    );
  },

  // 새 스크립트 저장
  saveNewScript: (script) => {
    saveScript(script);
    set((state) => ({
      allScripts: [...state.allScripts, script],
    }));
  },

  // 새 연습 기록 추가
  addNewPracticeLog: (logEntry) => {
    addPracticeLog(logEntry);
    set((state) => ({
      practiceLogs: [...state.practiceLogs, logEntry],
    }));
  },

  // 대화 상태 업데이트
  setSpokenText: (text) => set({ spokenText: text }),
  recordDiffResult: (result) => set({ lastDiffResult: result }),
  loadScript: (script) => set({ currentScript: script }),
}));
