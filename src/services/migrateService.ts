import { supabase } from '@/supabaseClient';

const SCRIPTS_KEY = 'titas_scripts';
let migrationInProgress = false; // 중복 실행 방지 플래그

/**
 * 로컬 스토리지 스크립트 -> Supabase DB 마이그레이션
 * @param userId 사용자 ID
 * @returns 실제 마이그레이션 수행 여부 (boolean)
 */
export const migrateData = async (userId: string): Promise<boolean> => {
  if (migrationInProgress) {
    return false;
  }
  migrationInProgress = true;

  try {
    const localScriptsStr = localStorage.getItem(SCRIPTS_KEY);
    if (!localScriptsStr) {
      return false; // 마이그레이션 대상 데이터 없음
    }

    const localScripts = JSON.parse(localScriptsStr);
    if (!localScripts || localScripts.length === 0) {
      return false; // 데이터 배열 비어있음
    }

    // DB 업로드 형식으로 데이터 변환
    const scriptsToUpload = localScripts.map((s: any, index: number) => ({
      user_id: userId,
      title: s.title || `Untitled Script ${index + 1}`,
      lines: s.lines || [],
      characters: s.characters || [],
      tags: s.tags || [],
      created_at: s.createdAt
        ? new Date(s.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    // DB로 데이터 전송
    const { error } = await supabase
      .from('scripts')
      .upsert(scriptsToUpload, { onConflict: 'user_id, title' });

    if (error) {
      throw error; // DB 오류 시 예외 발생
    }

    localStorage.removeItem(SCRIPTS_KEY); // 성공 시 로컬 데이터 삭제
    return true; // 마이그레이션 성공
  } catch (error) {
    // 에러 감지를 위한 예외 전파
    throw error;
  } finally {
    migrationInProgress = false; // 작업 완료 후 플래그 리셋
  }
};
