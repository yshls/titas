import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { DialogueLine, ScriptData, PracticeLog } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';

import {
  loadAllScripts,
  saveScript,
  loadPracticeLogs,
  addPracticeLog,
  deleteScript as deleteScriptStorage,
} from '@/utils/storageService';

// 상태 타입 정의
export interface AppState {
  // --- 기존 데이터 상태 ---
  allScripts: ScriptData[];
  practiceLogs: PracticeLog[];

  // --- 임시 상태 (연습 중) ---
  currentScript: DialogueLine[];
  spokenText: string;
  lastDiffResult: DiffResult[];

  // --- 유저(로그인) 상태 ---
  user: User | null; // 로그인 안 했으면 null, 했으면 유저 정보
  setUser: (user: User | null) => void; // 유저 정보 업데이트 함수

  // --- 액션 (기능) ---
  loadInitialData: () => void;
  saveNewScript: (script: ScriptData) => void;
  addNewPracticeLog: (logEntry: PracticeLog) => void;

  setSpokenText: (text: string) => void;
  recordDiffResult: (result: DiffResult[]) => void;
  loadScript: (script: DialogueLine[]) => void;
  deleteScript: (scriptId: string) => void;
}

// 스토어 생성
export const useAppStore = create<AppState>((set) => ({
  // 초기값 설정
  allScripts: [],
  practiceLogs: [],
  currentScript: [],
  spokenText: '',
  lastDiffResult: [],

  //  유저 초기값 (로그인 전이니까 null)
  user: null,

  // 로드
  loadInitialData: () => {
    const scripts = loadAllScripts();
    const logs = loadPracticeLogs();
    set({
      allScripts: scripts,
      practiceLogs: logs,
    });
    console.log(
      `[Store] Initial Data Loaded: ${scripts.length} scripts, ${logs.length} logs`,
    );
  },

  // 유저 정보 업데이트 함수
  setUser: (user) => set({ user }),

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
