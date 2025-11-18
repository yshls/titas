import { Link } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { useTitle } from '@/hooks/useTitle';

export function GrowthHubPage() {
  useTitle('Dashboard');

  const allScripts = useAppStore((state) => state.allScripts);
  const practiceLogs = useAppStore((state) => state.practiceLogs);
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  // 초기 데이터 로드
  useEffect(() => {
    if (allScripts.length === 0) {
      loadInitialData();
    }
  }, [loadInitialData, allScripts.length]);

  // 연습한 날짜 목록
  const practicedDays = useMemo(() => {
    return practiceLogs.map((log) => new Date(log.date));
  }, [practiceLogs]);

  // 평균 정확도 계산
  const avgAccuracy = useMemo(() => {
    if (practiceLogs.length === 0) return 0;
    const total = practiceLogs.reduce((acc, log) => acc + log.accuracy, 0);
    return total / practiceLogs.length;
  }, [practiceLogs]);

  // 캘린더 스타일
  const modifiers = { practiced: practicedDays, today: new Date() };
  const modifiersStyles = {
    practiced: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    today: { fontWeight: 'bold', color: '#f97316' },
  };

  return (
    <div className="pb-8 bg-gray-900 text-gray-200 min-h-full">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 캘린더 영역 */}
        <div className="lg:w-1/2 w-full">
          <h2 className="text-2xl font-bold mb-4 text-white">My Activity</h2>
          <div className="p-4 rounded-lg shadow-lg bg-white text-gray-900">
            <DayPicker
              mode="single"
              className="w-full"
              classNames={{
                table: 'w-full',
              }}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
            />
          </div>
        </div>

        {/* 통계 및 버튼 영역 */}
        <div className="lg:w-1/2 w-full flex flex-col gap-8">
          {/* 통계 */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-6">
              <StatCard
                title="Avg. Accuracy"
                value={avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : 'N/A'}
              />
              <StatCard title="Total Scripts" value={allScripts.length} />
              <StatCard
                title="Total Lines"
                value={allScripts.reduce(
                  (acc, script) => acc + script.lines.length,
                  0
                )}
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col space-y-4 mt-auto">
            <Link
              to="/create"
              className="w-full text-center bg-orange-600 text-white py-4 rounded-lg font-bold hover:bg-orange-700 transition duration-200 shadow-lg"
            >
              + Create New Script
            </Link>
            <Link
              to="#"
              className="w-full text-center text-gray-400 py-2 hover:text-white transition"
            >
              Review My Weak Spots (Coming Soon)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}
