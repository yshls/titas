import { Link } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const practicedDays = [
  new Date(2025, 10, 10),
  new Date(2025, 10, 12),
  new Date(2025, 10, 13),
];

export function GrowthHubPage() {
  // 캘린더 스타일 정의
  const modifiers = {
    practiced: practicedDays, // 연습한 날
    today: new Date(),
  };

  const modifiersStyles = {
    practiced: {
      // 연습한 날에 적용할 스타일 (동그라미)
      backgroundColor: '#C0D5FF',
      color: 'white',
    },
    today: {
      fontWeight: 'bold',
      color: '#3A76F0',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-6">
        <img src="/titas_logo.png" alt="TiTaS Logo" className="h-10" />
      </header>
      {/* 영역 1: 캘린더 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">My Activity</h2>
        {/* 3. 캘린더 컴포넌트 렌더링 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-center">
          <DayPicker
            mode="single" // 날짜 하나만 선택 (기본값)
            modifiers={modifiers} // 데이터('practicedDays') 적용
            modifiersStyles={modifiersStyles} // '동그라미') 적용
          />
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
      {/* 영역 3: 핵심 버튼  */}
      <div className="flex flex-col space-y-4">
        <Link
          to="/create"
          className="w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          [ + Create New Script ]
        </Link>
        <Link
          to="#"
          className="w-full text-center bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          [ Load My Scripts ]
        </Link>
        <Link
          to="#"
          className="w-full text-center text-gray-600 py-2 hover:text-black transition"
        >
          [ Review My Weak Spots ]
        </Link>
      </div>
    </div>
  );
}
