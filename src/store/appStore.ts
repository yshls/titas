import { create } from 'zustand';

import type { DialogueLine, ScriptData, PracticeLog } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';

import {
  loadAllScripts,
  saveScript,
  loadPracticeLogs,
  addPracticeLog,
  deleteScript as deleteScriptStorage,
} from '@/utils/storageService';

// 상태
export interface AppState {
  // 상태
  allScripts: ScriptData[];
  practiceLogs: PracticeLog[];

  // 임시 상태
  currentScript: DialogueLine[];
  spokenText: string;
  lastDiffResult: DiffResult[];

  // 액션
  loadInitialData: () => void;
  saveNewScript: (script: ScriptData) => void;
  addNewPracticeLog: (logEntry: PracticeLog) => void;

  // 업데이트
  setSpokenText: (text: string) => void;
  recordDiffResult: (result: DiffResult[]) => void;
  loadScript: (script: DialogueLine[]) => void;
  deleteScript: (scriptId: string) => void;
}

// 스토어
export const useAppStore = create<AppState>((set) => ({
  // 초기화
  allScripts: [],
  practiceLogs: [],

  currentScript: [],
  spokenText: '',
  lastDiffResult: [],

  // 로드
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

  // 저장
  saveNewScript: (script) => {
    saveScript(script);
    set((state) => ({
      allScripts: [...state.allScripts, script],
    }));
  },

  // 기록
  addNewPracticeLog: (logEntry) => {
    addPracticeLog(logEntry);
    set((state) => ({
      practiceLogs: [...state.practiceLogs, logEntry],
    }));
  },

  // 업데이트
  setSpokenText: (text) => set({ spokenText: text }),
  recordDiffResult: (result) => set({ lastDiffResult: result }),
  loadScript: (script) => set({ currentScript: script }),

  deleteScript: (scriptId: string) => {
    deleteScriptStorage(scriptId);
    set((state) => ({
      allScripts: state.allScripts.filter((script) => script.id !== scriptId),
    }));
  },
}));
