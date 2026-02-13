import styled from '@emotion/styled';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MdMenu, MdLogout, MdDeleteForever } from 'react-icons/md';
import { useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAppStore } from '@/store/appStore';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from '@/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Seo } from '@/components/common/Seo';
import { migrateData } from '@/services/migrateService';
import { useTranslation } from 'react-i18next';

// --- [스타일 컴포넌트] ---

const LanguageSwitcher = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSub};
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.textMain};
  }
`;

const LayoutWrapper = styled.div`
  min-height: 100vh;
  /* 테마 변수 사용 */
  background-color: ${({ theme }) => theme.background || '#ffffff'};
  color: ${({ theme }) => theme.textMain || '#333d4b'};
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
  background-color: ${({ theme }) => theme.background || '#ffffff'};
`;

const Header = styled.header`
  height: 52px;
  top: 0;
  z-index: 50;
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

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 2px;
  text-decoration: none;
`;

const LogoImage = styled.img`
  height: 26px;
`;

const LogoText = styled.span`
  font-weight: 900;
  font-size: 22px;
  color: ${({ theme }) => theme.textMain || '#333d4b'};
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;

const NavItem = styled(Link, {
  shouldForwardProp: (prop) => prop !== '$active' && prop !== '$isDrawer',
})<{ $active?: boolean; $isDrawer?: boolean }>`
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: ${({ $isDrawer }) => ($isDrawer ? '8px 12px' : '8px 12px')};
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 500 : 300)};
  color: ${({ $active, theme }) => ($active ? theme.textMain : theme.textSub)};

  &:hover {
    color: ${({ theme }) => theme.textMain};
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
  color: ${({ theme }) => theme.textMain};
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;

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
  justify-content: center;
  gap: 6px;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.textMain};
  color: ${({ theme }) => theme.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
`;

const ProfileDropdown = styled(motion.div)`
  position: absolute;
  top: 50px;
  right: 0;
  width: 220px;
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 16px;
  padding: 8px;
  z-index: 100;
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DropdownHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 4px;
`;

const DropdownLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSub};
  display: block;
`;

const DropdownEmail = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: ${({ theme }) => theme.textMain};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
    danger ? theme.colors.error : theme.textMain};
  background-color: transparent;
  transition: background-color 0.2s;
  text-align: left;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

const Divider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border};
  margin-top: 4px;
  padding-top: 4px;
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
  background-color: ${({ theme }) => theme.cardBg};
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  margin-bottom: 32px;
`;

const WelcomeText = styled.span`
  font-weight: bold;
  font-size: 20px;
  color: ${({ theme }) => theme.textMain};
`;

const DrawerNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const DrawerFooter = styled.div`
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MobileLogoutButton = styled(LoginButton)`
  width: 100%;
  margin-left: 0;
  background-color: ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textMain};
  padding: 12px;

  &:hover {
    background-color: ${({ theme }) => theme.textDisabled};
  }
`;

const MobileLoginButton = styled(LoginButton)`
  width: 100%;
  margin-left: 0;
  padding: 12px;
`;

const MobileDeleteButton = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.textSub};
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  align-self: center;
`;

const MainContent = styled.main<{ noPadding?: boolean }>`
  flex: 1;
  padding: ${({ noPadding }) => (noPadding ? '0' : '12px')};
`;

const Footer = styled.footer`
  padding: 10px 24px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.textSub};
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const FooterLinkItem = styled(Link)`
  color: inherit;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const FooterAnchor = styled.a`
  color: inherit;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// --- [Toast 스타일 컴포넌트] ---
const ToastContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ToastMessage = styled.div`
  text-align: center;
`;

const ToastTitle = styled.p`
  font-weight: bold;
  margin-bottom: 4px;
`;

const ToastSub = styled.p`
  font-size: 14px;
`;

const ToastActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;

const CancelButton = styled.button`
  background: #e5e7eb;
  color: black;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;

// --- [컴포넌트 로직] ---

const NAV_ITEMS = [
  { to: '/', key: 'nav.dashboard' },
  { to: '/create', key: 'nav.create' },
  { to: '/scripts', key: 'nav.scripts' },
  { to: '/review', key: 'nav.review' },
];

export function RootLayout() {
  const { user, setUser, loadInitialData, language, setLanguage } =
    useAppStore();
  const { t } = useTranslation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const isTalkPage = location.pathname.startsWith('/talk');
  const isScriptDetailPage = location.pathname.startsWith('/script');

  // 외부 클릭 감지
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

  // 앱 초기화 및 데이터 로드
  useEffect(() => {
    const runMigration = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session) {
        await migrateData(session.user.id);
        await loadInitialData();
      } else {
        loadInitialData();
      }
    };

    runMigration();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session) {
        setTimeout(() => runMigration(), 500);
      }

      if (session?.user) {
        setDrawerOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, loadInitialData]);

  // 구글 로그인
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { queryParams: { access_type: 'offline', prompt: 'consent' } },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(t('toast.loginFailed'));
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsProfileMenuOpen(false);
      toast.success(t('toast.signedOut'));
    } catch (error) {
      toast.error(t('toast.logoutFailed'));
    }
  };

  // 계정 삭제 실행
  const executeDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;

      await supabase.auth.signOut();
      toast.success(t('toast.accountDeleted'));
      window.location.href = '/';
    } catch (error) {
      toast.error(t('toast.deleteFailed'));
    }
  };

  // 계정 삭제 확인 모달
  const confirmDeleteAccount = () => {
    setIsProfileMenuOpen(false);
    setDrawerOpen(false);

    toast(
      (toastInstance) => (
        <ToastContainer>
          <ToastMessage>
            <ToastTitle>{t('toast.deleteConfirm')}</ToastTitle>
            <ToastSub>{t('toast.deleteWarning')}</ToastSub>
          </ToastMessage>
          <ToastActions>
            <ConfirmButton
              onClick={() => {
                toast.dismiss(toastInstance.id);
                executeDeleteAccount();
              }}
            >
              {t('toast.yesDelete')}
            </ConfirmButton>
            <CancelButton onClick={() => toast.dismiss(toastInstance.id)}>
              Cancel
            </CancelButton>
          </ToastActions>
        </ToastContainer>
      ),
      { duration: 10000 },
    );
  };

  return (
    <LayoutWrapper>
      <Seo lang={language} />
      <Toaster position="top-center" />
      <Analytics />

      <Container>
        <Header>
          <HeaderContent>
            <LeftSection>
              <LogoLink to="/">
                <LogoImage src="/titas_logo.png" alt="TiTaS" />
                <LogoText>TiTaS</LogoText>
              </LogoLink>
            </LeftSection>

            {/* PC 메뉴 */}
            <PcNav>
              {NAV_ITEMS.map(({ to, key }) => (
                <NavLink key={to} to={to} text={t(key)} />
              ))}
            </PcNav>

            <RightSection>
              <DesktopWrapper>
                <LanguageSwitcher
                  onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                >
                  {language === 'ko' ? 'EN' : 'KO'}
                </LanguageSwitcher>
                {user ? (
                  <AvatarWrapper ref={dropdownRef}>
                    <div
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                      {user.user_metadata.avatar_url ? (
                        <ProfileImage
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                        />
                      ) : (
                        <AvatarPlaceholder>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarPlaceholder>
                      )}
                    </div>

                    {/* 프로필 메뉴 */}
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <ProfileDropdown
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <DropdownHeader>
                            <DropdownLabel>{t('auth.signedInAs')}</DropdownLabel>
                            <DropdownEmail>{user.email}</DropdownEmail>
                          </DropdownHeader>

                          <DropdownItem onClick={handleLogout}>
                            <MdLogout size={18} /> {t('auth.signOut')}
                          </DropdownItem>

                          <Divider>
                            <DropdownItem onClick={confirmDeleteAccount} danger>
                              <MdDeleteForever size={18} /> {t('auth.deleteAccount')}
                            </DropdownItem>
                          </Divider>
                        </ProfileDropdown>
                      )}
                    </AnimatePresence>
                  </AvatarWrapper>
                ) : (
                  <LoginButton onClick={handleLogin}>{t('auth.signIn')}</LoginButton>
                )}
              </DesktopWrapper>

              <MobileMenuButton onClick={() => setDrawerOpen(true)}>
                <MdMenu />
              </MobileMenuButton>
            </RightSection>
          </HeaderContent>

          {/* 모바일 메뉴 */}
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
                  <DrawerHeader>
                    <WelcomeText>
                      {user
                        ? t('auth.hello', { name: user.user_metadata.full_name.split(' ')[0] })
                        : t('auth.welcome')}
                    </WelcomeText>
                  </DrawerHeader>

                  <DrawerNav>
                    {NAV_ITEMS.map(({ to, key }) => (
                      <NavLink
                        key={to}
                        to={to}
                        text={t(key)}
                        onClick={() => setDrawerOpen(false)}
                        isDrawer
                      />
                    ))}
                  </DrawerNav>

                  <DrawerFooter>
                    {user ? (
                      <>
                        <MobileLogoutButton onClick={handleLogout}>
                          {t('auth.signOut')}
                        </MobileLogoutButton>
                        <MobileDeleteButton onClick={confirmDeleteAccount}>
                          {t('auth.deleteAccount')}
                        </MobileDeleteButton>
                      </>
                    ) : (
                      <MobileLoginButton onClick={handleLogin}>
                        {t('auth.loginWith')}
                      </MobileLoginButton>
                    )}
                  </DrawerFooter>
                </DrawerSidebar>
              </Overlay>
            )}
          </AnimatePresence>
        </Header>

        {/* 메인 컨텐츠 */}
        <MainContent noPadding={isTalkPage || isScriptDetailPage}>
          <Outlet />
        </MainContent>

        {/* 푸터 */}
        <Footer>
          <FooterContent>
            <p>© 2026 TiTaS. All rights reserved.</p>
            <FooterLinks>
              <FooterLinkItem to="/terms">Terms of Service</FooterLinkItem>
              <FooterLinkItem to="/privacy">Privacy Policy</FooterLinkItem>
              <FooterAnchor
                href="https://forms.gle/ijjHBFn7TQ3FYico7"
                target="_blank"
                rel="noopener noreferrer"
              >
                Feedback
              </FooterAnchor>
            </FooterLinks>
          </FooterContent>
        </Footer>
      </Container>
    </LayoutWrapper>
  );
}

// NavLink 헬퍼
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
    <NavItem to={to} onClick={onClick} $active={isActive} $isDrawer={isDrawer}>
      <span>{text}</span>
    </NavItem>
  );
}
