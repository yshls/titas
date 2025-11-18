import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdCreate,
  MdLibraryBooks,
  MdBarChart,
} from 'react-icons/md';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-bgPrimary font-sans text-textPrimary">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <header className=" border-b-4 border-textPrimary">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center  hover:scale-105 transition-all duration-200 focus:outline-none "
              aria-label="Go to dashboard"
            >
              <img src="/public/titas_logo.png" alt="" className="w-14" />
            </Link>

            {/* 데스크탑 네비게이션 */}
            <nav
              className="hidden lg:flex items-center gap-4 "
              aria-label="Main navigation"
            >
              <NavLink to="/" text="Dashboard" icon={<MdDashboard />} />
              <NavLink to="/create" text="Create" icon={<MdCreate />} />
              <NavLink to="/scripts" text="Scripts" icon={<MdLibraryBooks />} />
              <NavLink to="/review" text="Review" icon={<MdBarChart />} />
            </nav>
          </div>

          {/* 모바일/태블릿: 컴팩트 네비게이션 */}
          <div className="lg:hidden border-t border-textPrimary">
            <div className="flex items-center justify-center p-3">
              <TabletNavLink to="/" text="Dashboard" icon={<MdDashboard />} />
              <TabletNavLink to="/create" text="Create" icon={<MdCreate />} />
              <TabletNavLink
                to="/scripts"
                text="Scripts"
                icon={<MdLibraryBooks />}
              />
              <TabletNavLink to="/review" text="Review" icon={<MdBarChart />} />
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 p-4">
          <main>
            <Outlet />
          </main>
        </div>

        {/* 푸터 */}
        <footer className="">
          <p className="font-sans text-sm font-sm text-textDisabled text-center py-4">
            © 2025 TiTaS. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

// 데스크탑 네비게이션 링크
function NavLink({
  to,
  text,
  icon,
}: {
  to: string;
  text: string;
  icon: React.ReactNode;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
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

// 모바일/태블릿 네비게이션
function TabletNavLink({
  to,
  text,
  icon,
}: {
  to: string;
  text: string;
  icon: React.ReactNode;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 border-textPrimary
        transition-all duration-200 focus:outline-none focus:ring-2 
        ${
          isActive
            ? 'bg-primary text-white scale-105 '
            : 'bg-bgCard text-primary  hover:scale-105 shadow-sm'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="text-lg" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs font-medium uppercase mt-1">{text}</span>
    </Link>
  );
}

// 푸터 링크 컴포넌트 (중복 제거)
// function FooterLink({
//   to,
//   children,
// }: {
//   to: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <Link
//       to={to}
//       className="font-sans text-sm font-medium text-textSecondary hover:text-primary transition-colors duration-200"
//     >
//       {children}
//     </Link>
//   );
// }
