import { supabase } from '@/supabaseClient';
import type { ScriptData, PracticeLog, Mission } from '@/utils/types';
import dayjs from 'dayjs';

const SCRIPTS_KEY = 'titas_scripts';
const PRACTICE_LOG_KEY = 'titas_practice_log';

// --- 스크립트 관리 ---

export const fetchScripts = async (): Promise<ScriptData[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인: 로컬 스토리지 조회
  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  // 로그인: DB 조회
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data.map((item: any) => ({
    id: item.id.toString(),
    title: item.title,
    lines: item.lines,
    characters: item.characters || [],
    tags: item.tags || [],
    createdAt: new Date(item.created_at).getTime(),
  }));
};

export const saveScriptToDB = async (script: ScriptData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인: 로컬 저장
  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    const scripts = localData ? JSON.parse(localData) : [];
    const newScripts = [
      script,
      ...scripts.filter((s: ScriptData) => s.id !== script.id),
    ];
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(newScripts));
    return;
  }

  // 로그인: DB 저장
  const { error } = await supabase.from('scripts').upsert(
    {
      user_id: user.id,
      title: script.title,
      lines: script.lines,
      characters: script.characters,
      tags: script.tags,
    },
    { onConflict: 'user_id, title' },
  );

  if (error) {
    // 에러 발생 시 처리 (필요시 추가)
  }
};

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

  await supabase.from('scripts').delete().eq('id', scriptId);
};

// --- 연습 기록 관리 ---

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

  return data.map((item: any) => ({
    id: item.id.toString(),
    scriptId: item.script_title,
    date: new Date(item.created_at).getTime(),
    accuracy: item.accuracy,
    timeSpent: item.time_spent || 0,
    errors: item.missed_words || [],
  }));
};

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
    time_spent: log.timeSpent,
    missed_words: log.errors,
  });

  if (error) {
    // 에러 발생 시 처리 (필요시 추가)
  }
};

// --- 미션 관리 ---

export const fetchMissions = async (
  dateTimestamp: number,
): Promise<Mission[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const startOfDay = dayjs(dateTimestamp).startOf('day').toISOString();
  const endOfDay = dayjs(dateTimestamp).endOf('day').toISOString();

  const { data } = await supabase
    .from('missions')
    .select('*')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .order('created_at', { ascending: true });

  return (data as Mission[]) || [];
};

export const addMissionToDB = async (
  text: string,
  date: Date,
): Promise<Mission | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const createdAt = dayjs(date).toISOString();

  const { data } = await supabase
    .from('missions')
    .insert({ user_id: user.id, text, completed: false, created_at: createdAt })
    .select()
    .single();

  return data as Mission;
};

export const toggleMissionInDB = async (id: string, completed: boolean) => {
  await supabase.from('missions').update({ completed }).eq('id', id);
};

export const deleteMissionFromDB = async (id: string) => {
  await supabase.from('missions').delete().eq('id', id);
};
