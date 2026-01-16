import { supabase } from '../supabaseClient';
import type { ScriptData, PracticeLog } from '@/utils/types';

const SCRIPTS_KEY = 'titas_scripts';
const PRACTICE_LOG_KEY = 'titas_practice_log';

export const migrateData = async (userId: string) => {
  console.log('[1단계] 이사 서비스 시작! 사용자 ID:', userId);

  try {
    // ---------------------------------------------------
    // 📦 스크립트 확인
    // ---------------------------------------------------
    const localScriptsString = localStorage.getItem(SCRIPTS_KEY);

    if (!localScriptsString) {
      console.log(
        '[결과] 로컬 스토리지에 스크립트가 하나도 없습니다. (키 이름 확인 필요)'
      );
    } else {
      const localScripts: ScriptData[] = JSON.parse(localScriptsString);
      console.log(`[2단계] 로컬에서 스크립트 ${localScripts.length}개 발견!`);

      // DB 목록 조회
      const { data: dbHeaders, error: dbError } = await supabase
        .from('scripts')
        .select('title, created_at')
        .eq('user_id', userId);

      if (dbError) {
        console.error('[에러] DB 목록을 가져오는데 실패했습니다:', dbError);
        return;
      }

      console.log(
        `[3단계] DB에 이미 저장된 스크립트: ${dbHeaders?.length || 0}개`
      );

      // 비교 로직 (key = 제목_시간)
      const dbSet = new Set(
        dbHeaders?.map((s) => `${s.title}_${new Date(s.created_at).getTime()}`)
      );

      const scriptsToUpload = [];

      for (const script of localScripts) {
        // 시간 포맷 보정 (문자열이면 숫자로 변환)
        const timeKey = new Date(script.createdAt).getTime();
        const key = `${script.title}_${timeKey}`;

        // DB에 없으면 추가
        if (!dbSet.has(key)) {
          console.log(`[발견] 업로드 대상: ${script.title} (시간: ${timeKey})`);
          scriptsToUpload.push({
            user_id: userId,
            title: script.title,
            lines: script.lines,
            created_at: new Date(script.createdAt).toISOString(),
          });
        } else {
          console.log(`[패스] 이미 있음: ${script.title}`);
        }
      }

      // 업로드 실행
      if (scriptsToUpload.length > 0) {
        console.log(`[4단계] ${scriptsToUpload.length}개 업로드 시도 중...`);
        const { error, data } = await supabase
          .from('scripts')
          .insert(scriptsToUpload)
          .select();

        if (error) {
          console.error(
            '[최종 실패] 업로드 중 에러 발생:',
            error.message,
            error.details
          );
        } else {
          console.log(
            `[성공] 스크립트 ${scriptsToUpload.length}개 저장 완료!`,
            data
          );
        }
      } else {
        console.log('[완료] 옮길 스크립트가 없습니다. (모두 동기화됨)');
      }
    }

    // (로그 부분은 스크립트 해결되면 봐도 되니 일단 생략하거나 동일한 방식으로 처리)
  } catch (e) {
    console.error('[치명적 에러] 코드 실행 중 멈춤:', e);
  }
};
