import { supabase } from '../supabaseClient';
import type { ScriptData, PracticeLog } from '@/utils/types';

const SCRIPTS_KEY = 'titas_scripts';
const PRACTICE_LOG_KEY = 'titas_practice_log';

// 1. 마이그레이션 (데이터 이사)
export const migrateData = async (userId: string) => {
  try {
    const localScripts = JSON.parse(localStorage.getItem(SCRIPTS_KEY) || '[]');
    if (localScripts.length === 0) return { success: true, count: 0 };

    // [중요] 중복 실행 방지를 위해 로컬 데이터를 변수에 담은 즉시 삭제
    localStorage.removeItem(SCRIPTS_KEY);
    localStorage.removeItem(PRACTICE_LOG_KEY);

    const scriptsToUpload = localScripts.map((s: any) => ({
      user_id: userId,
      title: s.title,
      lines: s.lines,
      created_at: new Date(s.createdAt).toISOString(),
    }));

    // upsert를 사용하여 제목이 중복될 경우 기존 데이터를 유지하거나 업데이트
    const { error } = await supabase
      .from('scripts')
      .upsert(scriptsToUpload, { onConflict: 'user_id, title' });

    if (error) throw error;

    return { success: true, count: scriptsToUpload.length };
  } catch (e) {
    console.error('Migration failed:', e);
    return { success: false, count: 0 };
  }
};

// 2. 스크립트 가져오기
export const fetchScripts = async (): Promise<ScriptData[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];

  return data.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    lines: item.lines,
    createdAt: new Date(item.created_at).getTime(),
  }));
};

// 3. 스크립트 저장하기
export const saveScriptToDB = async (script: ScriptData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    const scripts = localData ? JSON.parse(localData) : [];
    scripts.push(script);
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
    return;
  }

  // upsert 사용으로 중복 생성 방지
  const { error } = await supabase.from('scripts').upsert(
    {
      user_id: user.id,
      title: script.title,
      lines: script.lines,
    },
    { onConflict: 'user_id, title' }
  );

  if (error) console.error('DB 저장 실패:', error);
};

// 4. 스크립트 삭제하기
export const deleteScriptFromDB = async (scriptId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    if (localData) {
      const scripts = JSON.parse(localData);
      const newScripts = scripts.filter((s: ScriptData) => s.id !== scriptId);
      localStorage.setItem(SCRIPTS_KEY, JSON.stringify(newScripts));
    }
    return;
  }

  const { error } = await supabase.from('scripts').delete().eq('id', scriptId);
  if (error) console.error('DB 삭제 실패:', error);
};

// 5. 연습 기록 가져오기
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

// 6. 연습 기록 저장하기
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
