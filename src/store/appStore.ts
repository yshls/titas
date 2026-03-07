import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/supabaseClient';
import type { DialogueLine, ScriptData, PracticeLog } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';
import toast from 'react-hot-toast';

// 마이그레이션 서비스
import { migrateData } from '@/services/migrateService';

// DB 서비스
import {
  fetchScripts,
  saveScriptToDB,
  deleteScriptFromDB,
  fetchLogs,
  saveLogToDB,
} from '@/services/dbService';

// 언어 타입 정의
export type Language = 'ko' | 'en';

export interface AppState {
  // 상태
  allScripts: ScriptData[];
  practiceLogs: PracticeLog[];
  currentScript: DialogueLine[];
  spokenText: string;
  lastDiffResult: DiffResult[];
  isLoading: boolean;
  user: User | null;
  language: Language;
  themeMode: 'light' | 'dark';

  // 동기 액션
  setUser: (user: User | null) => void;
  setSpokenText: (text: string) => void;
  recordDiffResult: (result: DiffResult[]) => void;
  loadScript: (script: DialogueLine[]) => void;
  setLanguage: (language: Language, updateUrl?: boolean) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;

  // 비동기 액션
  initialize: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  saveNewScript: (script: ScriptData) => Promise<void>;
  updateScriptLine: (scriptId: string, lineId: string, newText: string) => void;
  deleteScript: (scriptId: string) => Promise<void>;
  addNewPracticeLog: (
    logEntry: PracticeLog,
    scriptTitle: string,
  ) => Promise<void>;
  fetchPracticeLogs: () => Promise<void>;
}

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    // 1. URL 쿼리 파라미터 우선 확인 (SEO)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Language;
    if (urlLang && ['ko', 'en'].includes(urlLang)) {
      return urlLang;
    }
    
    // 2. localStorage 확인
    const storedLang = localStorage.getItem('titas_lang') as Language;
    if (storedLang && ['ko', 'en'].includes(storedLang)) {
      return storedLang;
    }
    
    // 3. 브라우저 언어 확인
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'ko' || browserLang === 'en') {
      return browserLang as Language;
    }
  }
  return 'ko';
};

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('titas_theme') as 'light' | 'dark';
    if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
      return storedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

export const useAppStore = create<AppState>((set, get) => ({
  // 초기값
  allScripts: [],
  practiceLogs: [],
  currentScript: [],
  spokenText: '',
  lastDiffResult: [],
  isLoading: false,
  user: null,
  language: getInitialLanguage(),
  themeMode: getInitialTheme(),

  setUser: (user) => set({ user }),
  setSpokenText: (text) => set({ spokenText: text }),
  recordDiffResult: (result) => set({ lastDiffResult: result }),
  loadScript: (script) => set({ currentScript: script }),
  setLanguage: (language, updateUrl = false) => {
    set({ language });
    localStorage.setItem('titas_lang', language);
    
    // URL 쿼리 파라미터 동기화 (SEO 및 공유용)
    if (updateUrl && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      window.history.replaceState({}, '', url.toString());
    }
  },
  setThemeMode: (mode) => {
    set({ themeMode: mode });
    localStorage.setItem('titas_theme', mode);
  },

  // 초기화 로직
  initialize: async () => {
    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      await migrateData(session.user.id);
    }

    // 초기 데이터 로드
    await get().loadInitialData();

    // 로그인 감지
    supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        // 마이그레이션 지연 실행
        setTimeout(async () => {
          await migrateData(session.user.id);
          await get().loadInitialData();
        }, 500);
      } else if (event === 'SIGNED_OUT') {
        await get().loadInitialData();
      }
    });
  },

  // 데이터 로드
  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      // 스크립트 및 로그 조회
      const scripts = await fetchScripts();
      set({ allScripts: scripts });
      await get().fetchPracticeLogs();
    } catch (error) {
      // 에러 발생 시 처리
    } finally {
      set({ isLoading: false });
    }
  },

  // 스크립트 저장
  saveNewScript: async (script) => {
    try {
      await saveScriptToDB(script);
      const updatedScripts = await fetchScripts(); // 상태 동기화
      set({ allScripts: updatedScripts });
    } catch (error) {
      // 에러 발생 시 처리
    }
  },

  // 스크립트 라인 수정 (낙관적 업데이트)
  updateScriptLine: (scriptId, lineId, newText) => {
    const originalScripts = get().allScripts;

    const newAllScripts = originalScripts.map((script) => {
      if (script.id === scriptId) {
        const updatedLines = script.lines.map((line) =>
          line.id === lineId ? { ...line, originalLine: newText } : line
        );
        return { ...script, lines: updatedLines };
      }
      return script;
    });

    const targetScript = newAllScripts.find((s) => s.id === scriptId);
    if (!targetScript) return;

    // 1. 낙관적 UI 업데이트
    set({ allScripts: newAllScripts });

    // 2. 백그라운드 DB 업데이트 및 실패 시 롤백
    import('@/services/dbService')
      .then(({ updateScriptLinesInDB }) => {
        updateScriptLinesInDB(scriptId, targetScript.lines).catch((err) => {
          console.error('Update failed, reverting state.', err);
          // 3. 실패 시 원본 상태로 되돌리기
          set({ allScripts: originalScripts });
          toast.error('저장에 실패했습니다. 다시 시도해주세요.');
        });
      });
  },

  // 스크립트 삭제
  deleteScript: async (scriptId) => {
    try {
      await deleteScriptFromDB(scriptId);
      set((state) => ({
        allScripts: state.allScripts.filter((s) => s.id !== scriptId),
      }));
    } catch (error) {
      // 에러 발생 시 처리
    }
  },

  // 학습 기록 추가
  addNewPracticeLog: async (log, title) => {
    // UI 선반영
    set((state) => ({ practiceLogs: [log, ...state.practiceLogs] }));

    // DB 저장
    try {
      await saveLogToDB(log, title);
    } catch (err) {
      // 에러 발생 시 처리
    }
  },

  // 학습 기록 조회
  fetchPracticeLogs: async () => {
    try {
      const logs = await fetchLogs();
      set({ practiceLogs: logs });
    } catch (err) {
      // 에러 발생 시 처리
    }
  },
}));
