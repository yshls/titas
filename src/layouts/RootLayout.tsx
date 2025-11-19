import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdCreate,
  MdLibraryBooks,
  MdBarChart,
  MdMenu,
} from 'react-icons/md';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', text: 'Dashboard', icon: <MdDashboard /> },
  { to: '/create', text: 'Create', icon: <MdCreate /> },
  { to: '/scripts', text: 'Scripts', icon: <MdLibraryBooks /> },
  { to: '/review', text: 'Review', icon: <MdBarChart /> },
];

export function RootLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bgPrimary font-sans text-textPrimary">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <header className="border-b-3 border-textPrimary">
          <div className="flex items-center justify-between px-4 py-4">
            {/* 모바일 메뉴 */}
            <button
              className="lg:hidden p-2 rounded hover:bg-primary/10 focus:outline-none"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <MdMenu className="w-7 h-7 text-primary" />
            </button>

            {/* 로고 */}
            <Link
              to="/"
              className="flex items-center hover:scale-105 transition-all duration-200 focus:outline-none"
              aria-label="Go to dashboard"
            >
              <img src="/public/titas_logo.png" alt="" className="w-14" />
            </Link>

            {/* 데스크톱 메뉴 */}
            <nav
              className="hidden lg:flex items-center gap-4"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map(({ to, text, icon }) => (
                <NavLink key={to} to={to} text={text} icon={icon} />
              ))}
            </nav>
          </div>

          {/* 모바일 드로어 */}
          {drawerOpen && (
            <div
              className="fixed inset-0 bg-black/25 z-40"
              onClick={() => setDrawerOpen(false)}
            >
              <aside
                className="absolute top-0 left-0 w-64 h-full bg-white border-r-3 border-textPrimary p-6 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <nav
                  className="flex flex-col gap-2"
                  aria-label="Mobile main menu"
                >
                  {NAV_ITEMS.map(({ to, text, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      text={text}
                      icon={icon}
                      onClick={() => setDrawerOpen(false)}
                    />
                  ))}
                </nav>
              </aside>
            </div>
          )}
        </header>

        {/* 메인 */}
        <div className="flex-1 p-4">
          <main>
            <Outlet />
          </main>
        </div>

        {/* 푸터 */}
        <footer>
          <p className="font-sans text-sm font-sm text-textDisabled text-center py-4">
            © 2025 TiTaS. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

// 내비게이션 링크
function NavLink({
  to,
  text,
  icon,
  onClick,
}: {
  to: string;
  text: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg border-3 border-textPrimary
        font-display font-medium uppercase text-sm
        transition-all duration-200 focus:outline-none
        ${
          isActive
            ? 'bg-primary text-white scale-105 '
            : 'bg-bgCard text-primary hover:bg-primary/10 hover:scale-105 '
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="text-base" aria-hidden="true">
        {icon}
      </span>
      <span>{text}</span>
    </Link>
  );
}
