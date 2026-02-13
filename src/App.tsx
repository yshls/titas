import DebugConsole from '@/components/common/DebugConsole';
import { TalkPage } from '@/pages/TalkPage';
import { useAppStore } from '@/store/appStore';
import { migrateData } from '@/services/migrateService';
import { supabase } from '@/supabaseClient';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  useEffect(() => {
    const runMigration = async () => {
      // 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        toast.success(
          `Welcome! We're syncing your data, ${session.user.email}`,
        );

        await migrateData(session.user.id);
        await loadInitialData();

        toast.success('Sync complete. Enjoy!');
      } else {
        loadInitialData();
      }
    };

    runMigration();

    // 실시간 로그인 감지 및 데이터 마이그레이션 실행
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setTimeout(() => runMigration(), 500);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadInitialData]);

  return (
    <>
      {import.meta.env.DEV && <DebugConsole />}
      <TalkPage />
      <Toaster />
    </>
  );
}

export default App;
