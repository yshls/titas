import { Link } from 'react-router-dom';

export function GrowthHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-6">
        <img src="/logo.png" alt="TiTaS Logo" className="h-10" />
      </header>

      {/* 영역 1: 캘린더 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">My Activity</h2>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-h-[200px]">
          <p className="text-gray-400">(Calendar placeholder)</p>
        </div>
      </div>

      {/* 영역 2: 통계 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Avg. Accuracy</h3>
            <p className="text-2xl font-bold">N/A</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Scripts</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Lines</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      {/* 영역 3: 핵심 버튼 (라우터 연결) */}
      <div className="flex flex-col space-y-4">
        <Link
          to="/create" // 2페이지(CreatorPage)로 이동
          className="w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          [ + Create New Script ]
        </Link>
        <Link
          to="#" // TODO: 구현하기
          className="w-full text-center bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          [ Load My Scripts ]
        </Link>
        <Link
          to="#" // TODO: 구현하기
          className="w-full text-center text-gray-600 py-2 hover:text-black transition"
        >
          [ Review My Weak Spots ]
        </Link>
      </div>
    </div>
  );
}
