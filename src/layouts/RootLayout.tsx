import styled from '@emotion/styled';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  MdMenu,
  MdLightMode,
  MdDarkMode,
  MdLogout,
  MdDeleteForever,
} from 'react-icons/md';
import { useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAppStore } from '@/store/appStore';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from '@/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.modes.light.background};
  color: ${({ theme }) => theme.modes.light.text};
  font-family: 'Lato', 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.modes.light.background};
`;

const Header = styled.header`
  height: 52px;
  top: 0;
`;

const HeaderContent = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;

const NavItem = styled(Link)<{ active?: boolean; isDrawer?: boolean }>`
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: ${({ isDrawer }) => (isDrawer ? '8px 12px' : '8px 12px')};
  font-size: 15px;
  font-weight: ${({ active }) => (active ? 500 : 300)};
  color: ${({ active, theme }) =>
    active ? theme.colors.grey800 : theme.colors.grey500};

  &:hover {
    color: ${({ theme }) => theme.colors.grey700};
    font-weight: 500;
  }
`;

const PcNav = styled.nav`
  display: none;
  gap: 4px;
  align-items: center;
  justify-content: center;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

// PC에서 보여질 버튼들 래퍼
const DesktopWrapper = styled.div`
  display: none;
  align-items: center;
  gap: 8px;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  padding: 8px;
  font-size: 28px;
  color: ${({ theme }) => theme.colors.grey800};
  align-items: center;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const LoginButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
`;

// 테마 버튼 (PC 헤더용)
const ThemeToggleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.grey600};
  transition: all 0.2s ease-in-out;
  font-size: 20px;

  /* 호버 시 배경색을 넣어 버튼임을 명확히 함 */
  &:hover {
    background-color: ${({ theme }) => theme.colors.grey100};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProfileDropdown = styled(motion.div)`
  position: absolute;
  top: 50px;
  right: 0;
  width: 220px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 100;
  border: 1px solid #f2f4f6;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DropdownItem = styled.button<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ danger, theme }) =>
    danger ? theme.colors.grey300 : theme.colors.grey800};
  background-color: transparent;
  transition: background-color 0.2s;
  text-align: left;

  &:hover {
    background-color: ${({ danger }) => (danger ? '#f2f4f6' : '#f2f4f6')};
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 100;
`;

const DrawerSidebar = styled(motion.aside)`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 260px;
  background-color: white;
  padding: 24px;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const MobileDeleteButton = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.grey300};
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  align-self: center;
`;

const NAV_ITEMS = [
  { to: '/', text: 'Dashboard' },
  { to: '/create', text: 'Create' },
  { to: '/scripts', text: 'Scripts' },
  { to: '/review', text: 'Review' },
];

export function RootLayout() {
  const { user, setUser, loadInitialData } = useAppStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const isTalkPage = location.pathname.startsWith('/talk');
  const isScriptDetailPage = location.pathname.startsWith('/script');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast('Theme changed', { icon: isDarkMode ? '☀️' : '🌙' });
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    loadInitialData();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setDrawerOpen(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadInitialData, setUser]);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { queryParams: { access_type: 'offline', prompt: 'consent' } },
      });
      if (error) throw error;
    } catch (error) {
      console.error(error);
      toast.error('Login failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsProfileMenuOpen(false);
      toast.success('You have been logged out.');
    } catch (error) {
      toast.error('Logout failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account?\nThis action cannot be undone.',
      )
    ) {
      try {
        const { error } = await supabase.rpc('delete_user_account');
        if (error) throw error;

        await supabase.auth.signOut();
        setIsProfileMenuOpen(false);
        setDrawerOpen(false);
        toast.success('Your account has been deleted.');
        window.location.reload();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete account.');
      }
    }
  };

  return (
    <LayoutWrapper>
      <Toaster position="top-center" />
      <Analytics />

      <Container>
        <Header>
          <HeaderContent>
            {/* 로고 */}
            <LeftSection>
              <Link
                to="/"
                style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <img
                  src="/titas_logo.png"
                  alt="TiTaS"
                  style={{ height: '26px' }}
                />
                <span
                  style={{
                    fontWeight: '900',
                    fontSize: '22px',
                    color: '#333D4B',
                  }}
                >
                  TiTaS
                </span>
              </Link>
            </LeftSection>

            {/* PC 메뉴 */}
            <PcNav>
              {NAV_ITEMS.map(({ to, text }) => (
                <NavLink key={to} to={to} text={text} />
              ))}
            </PcNav>

            {/* 우측 영역 */}
            <RightSection>
              {/* PC 버전 (1024px 이상) */}
              <DesktopWrapper>
                {/* 1. 테마 버튼: 항상 헤더에 노출 (일관성 유지) */}
                <ThemeToggleBtn onClick={toggleTheme} aria-label="Toggle Theme">
                  {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
                </ThemeToggleBtn>

                {/* 2. 로그인 상태에 따른 UI */}
                {user ? (
                  // 로그인 됨: 프로필 사진 + 드롭다운
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <div
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                      {user.user_metadata.avatar_url ? (
                        <ProfileImage
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                        />
                      ) : (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#333D4B',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <ProfileDropdown
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* 사용자 이메일 표시 */}
                          <div
                            style={{
                              padding: '12px',
                              borderBottom: '1px solid #f2f4f6',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{ fontSize: '12px', color: '#8b95a1' }}
                            >
                              Signed in as
                            </span>
                            <div
                              style={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                color: '#333d4b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {user.email}
                            </div>
                          </div>

                          {/* 메뉴 항목 */}
                          <DropdownItem onClick={handleLogout}>
                            <MdLogout size={18} /> Sign out
                          </DropdownItem>

                          <div
                            style={{
                              borderTop: '1px solid #f2f4f6',
                              marginTop: '4px',
                              paddingTop: '4px',
                            }}
                          >
                            <DropdownItem onClick={handleDeleteAccount} danger>
                              <MdDeleteForever size={18} /> Delete Account
                            </DropdownItem>
                          </div>
                        </ProfileDropdown>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // 로그인 안됨: 로그인 버튼
                  <LoginButton onClick={handleLogin}>Login</LoginButton>
                )}
              </DesktopWrapper>

              {/* 모바일 햄버거 버튼 */}
              <MobileMenuButton onClick={() => setDrawerOpen(true)}>
                <MdMenu />
              </MobileMenuButton>
            </RightSection>
          </HeaderContent>

          {/* 모바일 드로어 (슬라이드 메뉴) */}
          <AnimatePresence>
            {drawerOpen && (
              <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
              >
                <DrawerSidebar
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 드로어 헤더 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      marginBottom: '32px',
                    }}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: '20px' }}>
                      {user
                        ? `👋🏻 Hello, ${user.user_metadata.full_name.split(' ')[0]}`
                        : '👋🏻 Welcome!'}
                    </span>
                    <ThemeToggleBtn
                      onClick={toggleTheme}
                      style={{ width: '36px', height: '36px' }}
                    >
                      {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
                    </ThemeToggleBtn>
                  </div>

                  {/* 네비게이션 */}
                  <nav
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      flex: 1,
                    }}
                  >
                    {NAV_ITEMS.map(({ to, text }) => (
                      <NavLink
                        key={to}
                        to={to}
                        text={text}
                        onClick={() => setDrawerOpen(false)}
                        isDrawer
                      />
                    ))}
                  </nav>

                  {/* 하단 액션 */}
                  <div
                    style={{
                      paddingBottom: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    {user ? (
                      <>
                        <LoginButton
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            marginLeft: 0,
                            backgroundColor: '#f2f4f6',
                            color: '#4e5968',
                            padding: '12px',
                          }}
                        >
                          Sign out
                        </LoginButton>

                        {/* 모바일 회원 탈퇴 링크 */}
                        <MobileDeleteButton onClick={handleDeleteAccount}>
                          Delete Account
                        </MobileDeleteButton>
                      </>
                    ) : (
                      <LoginButton
                        onClick={handleLogin}
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          marginLeft: 0,
                          padding: '12px',
                        }}
                      >
                        Login with Google
                      </LoginButton>
                    )}
                  </div>
                </DrawerSidebar>
              </Overlay>
            )}
          </AnimatePresence>
        </Header>

        <main
          style={{
            flex: 1,
            padding: isTalkPage || isScriptDetailPage ? '0' : '24px',
          }}
        >
          <Outlet />
        </main>

        <footer
          style={{ padding: '10px 24px', borderTop: '1px solid #E5E8EB' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#6B7684',
            }}
          >
            <p>© 2026 TiTaS. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/privacy">Privacy Policy</Link>
              <a
                href="https://forms.gle/ijjHBFn7TQ3FYico7"
                target="_blank"
                rel="noreferrer"
              >
                Feedback
              </a>
            </div>
          </div>
        </footer>
      </Container>
    </LayoutWrapper>
  );
}

function NavLink({
  to,
  text,
  onClick,
  isDrawer = false,
}: {
  to: string;
  text: string;
  onClick?: () => void;
  isDrawer?: boolean;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <NavItem to={to} onClick={onClick} active={isActive} isDrawer={isDrawer}>
      <span>{text}</span>
    </NavItem>
  );
}
