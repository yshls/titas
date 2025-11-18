import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function RootLayout() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'light'
  );

  // 테마 적용
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 테마 토글
  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen font-sans bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-[1180px] mx-auto flex flex-col min-h-screen bg-white dark:bg-gray-900 shadow-lg">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 flex justify-between items-center px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center">
            <img src="/titas_logo.png" alt="TiTaS Logo" className="h-9" />
          </Link>

          <div className="flex items-center space-x-6">
            {/* 내비게이션 */}
            <nav className="flex space-x-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/create">Create Script</NavLink>
              <NavLink to="/scripts">My Scripts</NavLink>
              <NavLink to="/review">Review</NavLink>
            </nav>

            {/* 테마 토글 버튼 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title={`Current: ${theme}`}
            >
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="grow">
          <main className="p-8">
            <Outlet />
          </main>
        </div>

        {/* 푸터 */}
        <footer className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 shrink-0">
          © 2025 TiTaS. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

// 내비게이션 링크 컴포넌트
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-gray-600 dark:text-gray-300 font-medium hover:text-orange-500 dark:hover:text-orange-400 transition"
    >
      {children}
    </Link>
  );
}
