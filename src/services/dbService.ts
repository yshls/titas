import { supabase } from '../supabaseClient';
import type { ScriptData, PracticeLog } from '@/utils/types';

// 로컬 스토리지 키 (게스트 모드용)
const SCRIPTS_KEY = 'titas_scripts';
const PRACTICE_LOG_KEY = 'titas_practice_log';

// ---------------------------
// 1. 스크립트 가져오기
// ---------------------------
export const fetchScripts = async (): Promise<ScriptData[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [Case A] 로그인 안 함 -> 로컬
  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  // [Case B] 로그인 함 -> DB
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('DB 로드 실패:', error);
    return [];
  }

  return data.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    lines: item.lines,
    createdAt: new Date(item.created_at).getTime(),
  }));
};

// ---------------------------
// 2. 스크립트 저장하기
// ---------------------------
export const saveScriptToDB = async (script: ScriptData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [Case A] 로그인 안 함 -> 로컬
  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    const scripts = localData ? JSON.parse(localData) : [];
    scripts.push(script);
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
    return;
  }

  // [Case B] 로그인 함 -> DB
  const { error } = await supabase.from('scripts').insert({
    user_id: user.id,
    title: script.title,
    lines: script.lines,
  });

  if (error) console.error('DB 저장 실패:', error);
};

// ---------------------------
// 3. 스크립트 삭제하기
// ---------------------------
export const deleteScriptFromDB = async (scriptId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [Case A] 로그인 안 함 -> 로컬에서 삭제
  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    if (localData) {
      const scripts = JSON.parse(localData);
      const newScripts = scripts.filter((s: ScriptData) => s.id !== scriptId);
      localStorage.setItem(SCRIPTS_KEY, JSON.stringify(newScripts));
    }
    return;
  }

  // [Case B] 로그인 함 -> DB에서 삭제
  const { error } = await supabase.from('scripts').delete().eq('id', scriptId);
  if (error) console.error('DB 삭제 실패:', error);
};

// ---------------------------
// 4. 연습 기록 가져오기
// ---------------------------
export const fetchLogs = async (): Promise<PracticeLog[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const localData = localStorage.getItem(PRACTICE_LOG_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  const { data, error } = await supabase
    .from('study_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];

  return data.map((item) => ({
    id: item.id.toString(),
    scriptId: item.script_title,
    date: new Date(item.created_at).getTime(),
    accuracy: item.accuracy,
    timeSpent: 0,
    errors: item.missed_words,
  }));
};

// ---------------------------
// 5. 연습 기록 저장하기
// ---------------------------
export const saveLogToDB = async (log: PracticeLog, scriptTitle: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const localData = localStorage.getItem(PRACTICE_LOG_KEY);
    const logs = localData ? JSON.parse(localData) : [];
    logs.push(log);
    localStorage.setItem(PRACTICE_LOG_KEY, JSON.stringify(logs));
    return;
  }

  const { error } = await supabase.from('study_logs').insert({
    user_id: user.id,
    script_title: scriptTitle,
    accuracy: log.accuracy,
    missed_words: log.errors,
  });

  if (error) console.error('DB 로그 저장 실패:', error);
};
