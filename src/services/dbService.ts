import { supabase } from '@/supabaseClient';
import type { ScriptData, PracticeLog } from '@/utils/types';
import type { Mission } from '@/utils/types';
import dayjs from 'dayjs';

// 로컬 스토리지 키 (게스트 모드용)
const SCRIPTS_KEY = 'titas_scripts';
const PRACTICE_LOG_KEY = 'titas_practice_log';

// 1. 스크립트 목록 가져오기 (Read)
export const fetchScripts = async (): Promise<ScriptData[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [비로그인] 로컬 스토리지 반환
  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  // [로그인] Supabase DB 반환
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('DB 스크립트 로드 실패:', error);
    return [];
  }

  // DB 데이터를 앱 타입(ScriptData)으로 변환
  return data.map((item: any) => ({
    id: item.id.toString(),
    title: item.title,
    lines: item.lines, // DB 컬럼명 확인 필요 (content 또는 lines)
    tags: item.tags || [],
    createdAt: new Date(item.created_at).getTime(),
  }));
};

// 2. 스크립트 저장 (Create)
export const saveScriptToDB = async (script: ScriptData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [비로그인] 로컬 스토리지 저장
  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    const scripts = localData ? JSON.parse(localData) : [];
    // 중복 방지 로직 (선택사항)
    const updatedScripts = [script, ...scripts];
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(updatedScripts));
    return;
  }

  // [로그인] DB 저장
  const { error } = await supabase.from('scripts').insert({
    user_id: user.id,
    title: script.title,
    lines: script.lines, // ScriptData의 lines를 DB의 lines 컬럼에 저장
    tags: script.tags, // 태그도 저장
  });

  if (error) console.error('DB 스크립트 저장 실패:', error);
};

// 3. 스크립트 삭제 (Delete)
export const deleteScriptFromDB = async (scriptId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [비로그인] 로컬 스토리지 삭제
  if (!user) {
    const localData = localStorage.getItem(SCRIPTS_KEY);
    if (localData) {
      const scripts = JSON.parse(localData);
      const newScripts = scripts.filter((s: ScriptData) => s.id !== scriptId);
      localStorage.setItem(SCRIPTS_KEY, JSON.stringify(newScripts));
    }
    return;
  }

  // [로그인] DB 삭제
  const { error } = await supabase.from('scripts').delete().eq('id', scriptId);

  if (error) console.error('DB 스크립트 삭제 실패:', error);
};

// 4. 연습 기록 가져오기 (Read) -  잔디 심기용 핵심 데이터
export const fetchLogs = async (): Promise<PracticeLog[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [비로그인] 로컬 스토리지
  if (!user) {
    const localData = localStorage.getItem(PRACTICE_LOG_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  // [로그인] DB (오름차순 정렬로 가져와야 그래프 그리기 좋음)
  const { data, error } = await supabase
    .from('study_logs') // 테이블 이름 확인 (practice_logs 인지 study_logs 인지)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('DB 로그 로드 실패:', error);
    return [];
  }

  // DB 데이터를 앱 타입(PracticeLog)으로 변환
  return data.map((item: any) => ({
    id: item.id.toString(),
    date: new Date(item.created_at).getTime(), // 타임스탬프로 변환 (중요!)
    scriptId: item.script_title, // script_id 대신 title을 쓰는 경우 매핑
    accuracy: item.accuracy,
    timeSpent: 0, // DB에 없으면 0 처리
    errors: item.missed_words || [],
  }));
};

// 5. 연습 기록 저장 (Create)
export const saveLogToDB = async (log: PracticeLog, scriptTitle: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [비로그인] 로컬 스토리지
  if (!user) {
    const localData = localStorage.getItem(PRACTICE_LOG_KEY);
    const logs = localData ? JSON.parse(localData) : [];
    logs.push(log);
    localStorage.setItem(PRACTICE_LOG_KEY, JSON.stringify(logs));
    return;
  }

  // [로그인] DB 저장
  const { error } = await supabase.from('study_logs').insert({
    user_id: user.id,
    script_title: scriptTitle,
    accuracy: log.accuracy,
    missed_words: log.errors,
    // created_at은 DB에서 자동 생성됨
  });

  if (error) console.error('DB 로그 저장 실패:', error);
};

export const fetchMissions = async (
  dateTimestamp: number,
): Promise<Mission[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 선택된 날짜의 00:00:00 ~ 23:59:59 범위 설정
  const startOfDay = dayjs(dateTimestamp).startOf('day').toISOString();
  const endOfDay = dayjs(dateTimestamp).endOf('day').toISOString();

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .gte('created_at', startOfDay) // 시작 시간 이상
    .lte('created_at', endOfDay) // 종료 시간 이하
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Mission load error:', error);
    return [];
  }
  return data as Mission[];
};

// [미션] 추가하기 (수정됨: 날짜를 인자로 받음)
export const addMissionToDB = async (
  text: string,
  date: Date,
): Promise<Mission | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 선택된 날짜의 연/월/일 + 현재 시간의 시/분/초를 합침 (정렬 순서 유지용)
  const createdAt = dayjs(date)
    .hour(dayjs().hour())
    .minute(dayjs().minute())
    .second(dayjs().second())
    .toISOString();

  const { data, error } = await supabase
    .from('missions')
    .insert({
      user_id: user.id,
      text,
      completed: false,
      created_at: createdAt,
    })
    .select()
    .single();

  if (error) {
    console.error('Mission add error:', error);
    return null;
  }
  return data as Mission;
};
// [미션] 상태 토글
export const toggleMissionInDB = async (id: string, completed: boolean) => {
  const { error } = await supabase
    .from('missions')
    .update({ completed })
    .eq('id', id);
  if (error) console.error('Mission update error:', error);
};

// [미션] 삭제
export const deleteMissionFromDB = async (id: string) => {
  const { error } = await supabase.from('missions').delete().eq('id', id);
  if (error) console.error('Mission delete error:', error);
};
