import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { DialogueLine, ScriptData, PracticeLog } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';

// DB 서비스 (Supabase/Local)
import {
  fetchScripts,
  saveScriptToDB,
  deleteScriptFromDB,
  fetchLogs,
  saveLogToDB,
} from '@/services/dbService';

export interface AppState {
  allScripts: ScriptData[];
  practiceLogs: PracticeLog[];
  currentScript: DialogueLine[];
  spokenText: string;
  lastDiffResult: DiffResult[];

  user: User | null;
  setUser: (user: User | null) => void;

  // 비동기 액션 (DB 연동)
  loadInitialData: () => Promise<void>;
  saveNewScript: (script: ScriptData) => Promise<void>;
  addNewPracticeLog: (
    logEntry: PracticeLog,
    scriptTitle: string,
  ) => Promise<void>;
  deleteScript: (scriptId: string) => Promise<void>;

  setSpokenText: (text: string) => void;
  recordDiffResult: (result: DiffResult[]) => void;
  loadScript: (script: DialogueLine[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  allScripts: [],
  practiceLogs: [],
  currentScript: [],
  spokenText: '',
  lastDiffResult: [],

  user: null,
  setUser: (user) => set({ user }),

  // 초기 데이터 로드 (앱 시작 시 실행)
  loadInitialData: async () => {
    const [scripts, logs] = await Promise.all([fetchScripts(), fetchLogs()]);
    set({ allScripts: scripts, practiceLogs: logs });
  },

  // 스크립트 저장 (DB 저장 후 목록 갱신)
  saveNewScript: async (script) => {
    await saveScriptToDB(script);
    const updatedScripts = await fetchScripts(); // 최신 목록 불러오기
    set({ allScripts: updatedScripts });
  },

  // 연습 기록 저장 (DB 저장 후 로그 갱신)
  addNewPracticeLog: async (logEntry, scriptTitle) => {
    await saveLogToDB(logEntry, scriptTitle);
    const updatedLogs = await fetchLogs(); // 최신 로그 불러오기
    set({ practiceLogs: updatedLogs });
  },

  // 스크립트 삭제
  deleteScript: async (scriptId) => {
    await deleteScriptFromDB(scriptId);
    set((state) => ({
      allScripts: state.allScripts.filter((s) => s.id !== scriptId),
    }));
  },

  // UI 상태 업데이트 (동기)
  setSpokenText: (text) => set({ spokenText: text }),
  recordDiffResult: (result) => set({ lastDiffResult: result }),
  loadScript: (script) => set({ currentScript: script }),
}));
