import { supabase } from '@/supabaseClient';
import type {
  ScriptData,
  PracticeLog,
  Mission,
  DialogueLine,
  SavedSentence,
} from '@/utils/types';
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

  // 조회 실패를 빈 목록으로 감추면 "데이터 없음"과 구분되지 않으므로 그대로 전파한다.
  if (error) {
    throw error;
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

  // 저장 실패를 삼키면 호출부가 성공으로 오인하므로 그대로 전파한다.
  if (error) {
    throw error;
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

  const { error } = await supabase.from('scripts').delete().eq('id', scriptId);

  if (error) {
    throw error;
  }
};

export const updateScriptLinesInDB = async (scriptId: string, updatedLines: DialogueLine[]) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    if (localData) {
      const scripts = JSON.parse(localData);
      const newScripts = scripts.map((s: ScriptData) =>
        s.id === scriptId ? { ...s, lines: updatedLines } : s
      );
      localStorage.setItem(SCRIPTS_KEY, JSON.stringify(newScripts));
    }
    return;
  }

  const { error } = await supabase
    .from('scripts')
    .update({ lines: updatedLines })
    .eq('id', scriptId)
    .eq('user_id', user.id);

  // 호출부(appStore)가 실패 시 낙관적 업데이트를 롤백할 수 있도록 전파한다.
  if (error) {
    console.error('Error updating script lines:', error);
    throw error;
  }
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

  if (error) {
    throw error;
  }

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
    throw error;
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

// --- 저장한 문장 관리 ---

const SAVED_SENTENCES_KEY = 'titas_saved_sentences';

const readLocalSaved = (): SavedSentence[] => {
  const raw = localStorage.getItem(SAVED_SENTENCES_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeLocalSaved = (items: SavedSentence[]) => {
  localStorage.setItem(SAVED_SENTENCES_KEY, JSON.stringify(items));
};

const mapSavedRow = (row: any): SavedSentence => ({
  id: row.id.toString(),
  text: row.text,
  speakerId: row.speaker_id,
  scriptId: row.script_id,
  scriptTitle: row.script_title,
  rate: row.rate,
  createdAt: new Date(row.created_at).getTime(),
});

export const fetchSavedSentences = async (): Promise<SavedSentence[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return readLocalSaved().sort((a, b) => b.createdAt - a.createdAt);
  }

  const { data, error } = await supabase
    .from('saved_sentences')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapSavedRow);
};

export const saveSentenceToDB = async (
  sentence: SavedSentence,
): Promise<SavedSentence> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const items = readLocalSaved();
    // 같은 문장을 중복으로 담지 않는다 (DB의 unique 인덱스와 동일한 규칙).
    if (items.some((s) => s.text === sentence.text)) {
      return sentence;
    }
    writeLocalSaved([sentence, ...items]);
    return sentence;
  }

  const { data, error } = await supabase
    .from('saved_sentences')
    .upsert(
      {
        user_id: user.id,
        text: sentence.text,
        speaker_id: sentence.speakerId,
        script_id: sentence.scriptId,
        script_title: sentence.scriptTitle,
        rate: sentence.rate,
      },
      { onConflict: 'user_id, text' },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapSavedRow(data);
};

export const deleteSavedSentenceFromDB = async (id: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    writeLocalSaved(readLocalSaved().filter((s) => s.id !== id));
    return;
  }

  const { error } = await supabase
    .from('saved_sentences')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};
