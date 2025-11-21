import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdCreate,
  MdLibraryBooks,
  MdBarChart,
  MdMenu,
  MdOutlineEmail,
} from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore, type AppState } from '@/store/appStore';

const NAV_ITEMS = [
  { to: '/', text: 'Dashboard', icon: <MdDashboard /> },
  { to: '/create', text: 'Create', icon: <MdCreate /> },
  { to: '/scripts', text: 'Scripts', icon: <MdLibraryBooks /> },
  { to: '/review', text: 'Review', icon: <MdBarChart /> },
];
export function RootLayout() {
  const loadInitialData = useAppStore(
    (state: AppState) => state.loadInitialData
  );

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isTalkPage = location.pathname.startsWith('/talk');

  return (
    <div className="min-h-screen bg-bg-main font-sans text-text-primary">
      <Toaster position="top-center" />
      <div className="w-full max-w-6xl mx-auto flex flex-col min-h-dvh">
        <header className="border-border-default border-b bg-bg-main">
          <div className="flex items-center justify-between px-3 py-2">
            <Link
              to="/"
              className="flex items-center hover:scale-105 transition-all duration-200 focus:outline-none"
              aria-label="Go to dashboard"
            >
              <img src="/titas_logo.png" alt="TiTaS Logo" className="h-8" />
            </Link>

            <nav
              className="hidden lg:flex items-center gap-3"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map(({ to, text, icon }) => (
                <NavLink key={to} to={to} text={text} icon={icon} />
              ))}
            </nav>

            <button
              className="lg:hidden p-2 rounded-md hover:bg-primary/10 "
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              tabIndex={0}
            >
              <MdMenu className="w-7 h-7 text-primary" />
            </button>
          </div>

          {drawerOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setDrawerOpen(false)}
            >
              <aside
                className="absolute top-0 left-0 w-64 h-full bg-white border-r border-border-default p-6 z-60"
                onClick={(e) => e.stopPropagation()}
              >
                <nav
                  className="flex flex-col gap-3"
                  aria-label="Mobile main menu"
                >
                  {NAV_ITEMS.map(({ to, text, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      text={text}
                      icon={icon}
                      onClick={() => setDrawerOpen(false)}
                      isDrawer
                    />
                  ))}
                </nav>
              </aside>
            </div>
          )}
        </header>

        <main className={`flex-1 ${isTalkPage ? '' : 'p-2'}`}>
          <Outlet />
        </main>

        <footer>
          <div className="font-sans text-xs text-text-muted text-center py-6 space-y-2">
            <p>© 2025 TiTaS. All rights reserved.</p>
            <a
              href="mailto:shluxnsal01@gmail.com"
              className="inline-flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors group"
            >
              <MdOutlineEmail className="w-4 h-4" />
              <span className="font-bold group-hover:underline">
                피드백 보내기
              </span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

// 네비게이션
function NavLink({
  to,
  text,
  icon,
  onClick,
  isDrawer = false,
}: {
  to: string;
  text: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isDrawer?: boolean;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  // 피드백 이메일 링크
  const subject = encodeURIComponent('[TiTaS 피드백/문의]');
  const body = encodeURIComponent(
    `안녕하세요, TiTaS 팀.\n서비스에 대한 소중한 의견을 남겨주셔서 감사합니다.\n\n\n- 피드백 유형: (예: 버그 리포트, 기능 제안, 칭찬, 기타)\n\n- 내용:\n\n\n`
  );
  const mailtoLink = `mailto:shluxnsal01@gmail.com?subject=${subject}&body=${body}`;

  if (to === 'feedback') {
    return (
      <a
        href={mailtoLink}
        className={`
          flex items-center gap-3 rounded-lg
          transition-all duration-300
          font-display font-bold uppercase text-sm
          border
          focus:outline-none
          ${isDrawer ? 'px-3 py-3' : 'px-3 py-2'}
          bg-white text-primary border-border-default hover:bg-primary/10
        `}
        tabIndex={0}
      >
        <span className="text-primary">{icon}</span>
        <span>{text}</span>
      </a>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 rounded-lg
        transition-all duration-300
        font-display font-bold uppercase text-sm
        border
        focus:outline-none
        ${isDrawer ? 'px-3 py-3' : 'px-3 py-2'}
        ${
          isActive
            ? 'bg-primary/50 text-white border-primary'
            : 'bg-white text-primary border-border-default hover:bg-primary/10'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
      tabIndex={0}
    >
      <span className={isActive ? 'text-white' : 'text-primary'}>{icon}</span>
      <span>{text}</span>
    </Link>
  );
}
