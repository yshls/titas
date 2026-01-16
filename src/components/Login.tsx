import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { migrateData } from '../services/migrateService';
import { useAppStore } from '@/store/appStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const loadInitialData = useAppStore((state) => state.loadInitialData);
  const isMigratingRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) handleAutoMigration(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) handleAutoMigration(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAutoMigration = async (userId: string) => {
    if (isMigratingRef.current) return;
    isMigratingRef.current = true;
    try {
      await migrateData(userId);
      await loadInitialData();
    } finally {
      isMigratingRef.current = false;
    }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { queryParams: { access_type: 'offline', prompt: 'consent' } },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '정말 탈퇴하시겠습니까?\n모든 기록이 삭제됩니다.'
    );
    if (confirmed) {
      try {
        const { error } = await supabase.rpc('delete_user_account');
        if (error) throw error;
        localStorage.clear();
        window.location.reload();
      } catch (error: any) {
        alert('오류: ' + error.message);
      }
    }
  };

  const handleTermsClick = () => {
    // 나중에 v2에서 정식 페이지로 연결할 예정이므로 일단 알림만!
    toast('서비스 이용약관은 준비 중입니다. ', { icon: 'ℹ️' });
  };

  const handlePrivacyClick = () => {
    // 나중에 v2에서 정식 페이지로 연결할 예정이므로 일단 알림만!
    toast('개인정보 처리방침은 준비 중입니다.', { icon: 'ℹ️' });
  };

  return (
    <div className="flex items-center">
      {user ? (
        <>
          {/* 이름 버튼: 텍스트만 깔끔하게 */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-bold text-gray-600 hover:text-[#D95F2B] transition-colors"
          >
            👋 {user.user_metadata.full_name}님
          </button>

          {/*  설정 모달 */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              {/* 배경 흐리게 */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
                onClick={() => setIsModalOpen(false)}
              />

              {/* 모달 박스 */}
              <div className="relative w-full max-w-sm bg-white rounded-[24px] shadow-2xl p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black text-gray-900">SETTINGS</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-black"
                  >
                    ✕
                  </button>
                </div>

                {/* 사용자 카드 */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-6">
                  <div className="w-10 h-10 bg-[#D95F2B] rounded-full flex items-center justify-center text-white font-bold">
                    {user.user_metadata.full_name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 truncate">
                      {user.user_metadata.full_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* 약관 및 메뉴 */}
                <div className="space-y-1 mb-8">
                  <button
                    onClick={handleTermsClick}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    서비스 이용약관
                  </button>
                  <button
                    onClick={handlePrivacyClick}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    개인정보 처리방침
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    로그아웃
                  </button>
                </div>

                {/* 탈퇴 버튼 (작고 연하게) */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <button
                    onClick={handleDeleteAccount}
                    className="text-[10px] text-gray-300 hover:text-red-400 transition-colors underline"
                  >
                    회원탈퇴
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="px-5 py-2 font-bold text-white bg-[#D95F2B] rounded-md"
        >
          구글 로그인
        </button>
      )}
    </div>
  );
}
