import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/supabaseClient';
import type { DialogueLine, ScriptData, PracticeLog } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';

import {
  fetchScripts,
  saveScriptToDB,
  deleteScriptFromDB,
} from '@/services/dbService';

export interface AppState {
  // 상태 변수
  allScripts: ScriptData[];
  practiceLogs: PracticeLog[];
  currentScript: DialogueLine[];
  spokenText: string;
  lastDiffResult: DiffResult[];
  isLoading: boolean;
  user: User | null;

  // 동기 액션
  setUser: (user: User | null) => void;
  setSpokenText: (text: string) => void;
  recordDiffResult: (result: DiffResult[]) => void;
  loadScript: (script: DialogueLine[]) => void;

  // 비동기 액션
  loadInitialData: () => Promise<void>;

  // 스크립트 관련
  saveNewScript: (script: ScriptData) => Promise<void>;
  deleteScript: (scriptId: string) => Promise<void>;

  // 로그 관련 (Supabase 직접 연동)
  addNewPracticeLog: (
    logEntry: PracticeLog,
    scriptTitle: string,
  ) => Promise<void>;
  fetchPracticeLogs: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 초기 상태값 설정
  allScripts: [],
  practiceLogs: [],
  currentScript: [],
  spokenText: '',
  lastDiffResult: [],
  isLoading: false,
  user: null,

  // 동기 액션 구현
  setUser: (user) => set({ user }),
  setSpokenText: (text) => set({ spokenText: text }),
  recordDiffResult: (result) => set({ lastDiffResult: result }),
  loadScript: (script) => set({ currentScript: script }),

  // 비동기 액션 구현

  // 앱 시작 시 초기 데이터 로드 (스크립트 및 로그)
  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      // 기존 스크립트 데이터 로드
      const scripts = await fetchScripts();
      set({ allScripts: scripts });

      // 학습 기록 데이터 로드
      await get().fetchPracticeLogs();
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 새 스크립트 저장
  saveNewScript: async (script) => {
    try {
      await saveScriptToDB(script);
      const updatedScripts = await fetchScripts();
      set({ allScripts: updatedScripts });
    } catch (error) {
      console.error('Failed to save script:', error);
    }
  },

  // 스크립트 삭제
  deleteScript: async (scriptId) => {
    try {
      await deleteScriptFromDB(scriptId);
      set((state) => ({
        allScripts: state.allScripts.filter((s) => s.id !== scriptId),
      }));
    } catch (error) {
      console.error('Failed to delete script:', error);
    }
  },

  // 학습 기록 추가 (로컬 상태 업데이트 후 DB 저장)
  addNewPracticeLog: async (log, title) => {
    // 화면 갱신을 위해 로컬 상태에 먼저 반영
    set((state) => ({
      practiceLogs: [log, ...state.practiceLogs],
    }));

    try {
      // 현재 로그인한 사용자 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 비로그인 상태면 DB 저장 건너뜀
      if (!user) {
        console.warn('User not logged in. Log saved locally only.');
        return;
      }

      // Supabase DB에 기록 저장
      const { error } = await supabase.from('practice_logs').insert({
        id: log.id,
        user_id: user.id,
        script_id: log.scriptId,
        title: title,
        accuracy: log.accuracy,
        time_spent: log.timeSpent,
        errors: log.errors, // JSON 형태로 저장됨
        created_at: new Date(log.date).toISOString(),
      });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Failed to save practice log to DB:', err);
    }
  },

  // 학습 기록 불러오기
  fetchPracticeLogs: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('practice_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // DB 데이터를 앱 내부 타입으로 변환
        const formattedLogs: PracticeLog[] = data.map((row) => ({
          id: row.id,
          date: new Date(row.created_at).getTime(),
          scriptId: row.script_id,
          accuracy: row.accuracy,
          timeSpent: row.time_spent,
          errors: row.errors,
        }));

        set({ practiceLogs: formattedLogs });
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  },
}));
