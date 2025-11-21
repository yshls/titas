import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdCreate,
  MdLibraryBooks,
  MdBarChart,
  MdMenu,
} from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store/appStore';

const NAV_ITEMS = [
  { to: '/', text: 'Dashboard', icon: <MdDashboard /> },
  { to: '/create', text: 'Create', icon: <MdCreate /> },
  { to: '/scripts', text: 'Scripts', icon: <MdLibraryBooks /> },
  { to: '/review', text: 'Review', icon: <MdBarChart /> },
];

export function RootLayout() {
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // 연습 페이지
  const isTalkPage = location.pathname.startsWith('/talk');

  return (
    <div className="min-h-screen bg-bg-main font-sans text-text-primary">
      <Toaster position="top-center" />
      <div className="w-full max-w-[1200px] mx-auto flex flex-col min-h-screen">
        <header className="border-border-default border-b-2 bg-bg-main">
          <div className="flex items-center justify-between px-3 py-2">
            {/* 로고 */}
            <Link
              to="/"
              className="flex items-center hover:scale-105 transition-all duration-200 focus:outline-none"
              aria-label="Go to dashboard"
            >
              <img src="/titas_logo.png" alt="TiTaS Logo" className="h-8" />
            </Link>

            {/* 데스크탑 메뉴 */}
            <nav
              className="hidden lg:flex items-center gap-3"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map(({ to, text, icon }) => (
                <NavLink key={to} to={to} text={text} icon={icon} />
              ))}
            </nav>

            {/* 모바일 메뉴 버튼 */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-primary/10 "
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              tabIndex={0}
            >
              <MdMenu className="w-7 h-7 text-primary" />
            </button>
          </div>

          {/* 모바일 메뉴 */}
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
          <p className="font-sans text-sm text-text-muted text-center py-2">
            © 2025 TiTaS. All rights reserved.
          </p>
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

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 rounded-lg
        transition-all duration-300
        font-display font-bold uppercase text-sm
        border-2
        focus:outline-none
        ${isDrawer ? 'px-4 py-3' : 'px-3 py-2'}
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
