import { Outlet, Link } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="min-h-screen font-sans bg-gray-100">
      <div className="w-full max-w-[1180px] mx-auto flex flex-col min-h-screen bg-white shadow-md">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 flex justify-between items-center px-6 py-3 bg-white border-b border-gray-200 ">
          <Link to="/" className="flex items-center">
            <img src="/titas_logo.png" alt="TiTaS Logo" className="h-9" />
          </Link>
          <nav className="flex space-x-4">
            <Link
              to="/"
              className="text-gray-600 font-medium hover:text-primary"
            >
              My Hub
            </Link>
            <Link
              to="/create"
              className="text-gray-600 font-medium hover:text-primary"
            >
              Create
            </Link>
            <Link
              to="/talk/test"
              className="text-gray-600 font-medium hover:text-primary"
            >
              Talk
            </Link>
          </nav>
        </header>

        <div className="grow">
          {/* 페이지 컨텐츠 */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>

        {/* 푸터 */}
        <footer className="px-6 py-3 border-t border-gray-200 text-center text-gray-500">
          © 2025 TiTaS. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
