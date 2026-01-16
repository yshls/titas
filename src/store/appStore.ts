import { create } from 'zustand';
import type { DialogueLine, ScriptData, PracticeLog } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker'; // 경로 확인 필요

// 방금 만든 DB 서비스 불러오기
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

  // 함수들이 async(비동기)로 바뀝니다
  loadInitialData: () => Promise<void>;
  saveNewScript: (script: ScriptData) => Promise<void>;
  addNewPracticeLog: (
    logEntry: PracticeLog,
    scriptTitle: string
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

  // 앱 켜지면 DB에서 가져오기
  loadInitialData: async () => {
    const [scripts, logs] = await Promise.all([fetchScripts(), fetchLogs()]);
    set({ allScripts: scripts, practiceLogs: logs });
  },

  // DB에 저장
  saveNewScript: async (script) => {
    await saveScriptToDB(script);
    const updatedScripts = await fetchScripts(); // 목록 갱신
    set({ allScripts: updatedScripts });
  },

  //  로그 저장
  addNewPracticeLog: async (logEntry, scriptTitle) => {
    await saveLogToDB(logEntry, scriptTitle);
    const updatedLogs = await fetchLogs(); // 목록 갱신
    set({ practiceLogs: updatedLogs });
  },

  //  삭제
  deleteScript: async (scriptId) => {
    await deleteScriptFromDB(scriptId);
    set((state) => ({
      allScripts: state.allScripts.filter((s) => s.id !== scriptId),
    }));
  },

  // 나머지는 그대로
  setSpokenText: (text) => set({ spokenText: text }),
  recordDiffResult: (result) => set({ lastDiffResult: result }),
  loadScript: (script) => set({ currentScript: script }),
}));
