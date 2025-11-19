import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useTitle } from '@/hooks/useTitle';
import {
  MdTrendingUp,
  MdLibraryBooks,
  MdFormatListBulleted,
  MdCheckCircle,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';

export function GrowthHubPage() {
  useTitle('Dashboard');

  const allScripts = useAppStore((state) => state.allScripts);
  const practiceLogs = useAppStore((state) => state.practiceLogs);
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (allScripts.length === 0) {
      loadInitialData();
    }
  }, [loadInitialData, allScripts.length]);

  const practicedDays = useMemo(() => {
    return practiceLogs.map((log) => new Date(log.date));
  }, [practiceLogs]);

  const avgAccuracy = useMemo(() => {
    if (practiceLogs.length === 0) return 0;
    const total = practiceLogs.reduce((acc, log) => acc + log.accuracy, 0);
    return total / practiceLogs.length;
  }, [practiceLogs]);

  const totalLines = useMemo(() => {
    return allScripts.reduce((acc, script) => acc + script.lines.length, 0);
  }, [allScripts]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="min-h-full pb-8" role="main" aria-label="Dashboard">
      {/* 헤더 */}
      <header className="mb-8">
        <h1 className="font-display text-5xl font-black text-primary mb-4 uppercase tracking-tight">
          Welcome Back!
        </h1>
        <p className="font-sans text-base font-medium text-textPrimary">
          Track your progress and keep practicing!
        </p>
      </header>

      {/* 데스크탑 */}
      <div className="hidden md:grid md:grid-cols-2 gap-8">
        {/* 달력 */}
        <CompactCalendar
          practicedDays={practicedDays}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <div className="space-y-6">
          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <SquareStatCard
              title="Avg. Accuracy"
              value={avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : '0%'}
              icon={<MdTrendingUp />}
            />
            <SquareStatCard
              title="Total Scripts"
              value={allScripts.length}
              icon={<MdLibraryBooks />}
            />
            <SquareStatCard
              title="Total Lines"
              value={totalLines}
              icon={<MdFormatListBulleted />}
            />
          </div>

          {/* 최근 활동 */}
          {practiceLogs.length > 0 ? (
            <div className="bg-speaker2 rounded-2xl border-3 border-textPrimary p-6">
              <div className="flex items-center gap-3 mb-3">
                <MdCheckCircle className="w-7 h-7 text-textPrimary" />
                <h3 className="font-display text-xl font-black text-textPrimary uppercase">
                  Recent Activity
                </h3>
              </div>
              <p className="font-sans text-lg font-medium text-textPrimary mb-2">
                You've completed{' '}
                <strong className="font-display text-2xl font-bold">
                  {practiceLogs.length}
                </strong>{' '}
                practice sessions
              </p>
              <p className="font-sans text-sm font-medium text-textPrimary">
                Keep up the great work! 🎉
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-3 border-dashed border-textPrimary p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary border-3 border-textPrimary mb-4">
                <MdLibraryBooks className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display text-2xl font-black text-primary mb-3 uppercase">
                Start Your Practice Journey
              </h3>
              <p className="font-sans text-base text-textPrimary">
                Create your first script and begin practicing to see your
                progress here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden space-y-6">
        {/* 통계 */}
        <div className="grid grid-cols-1 gap-4">
          <SquareStatCard
            title="Avg. Accuracy"
            value={avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : '0%'}
            icon={<MdTrendingUp />}
          />
          <SquareStatCard
            title="Total Scripts"
            value={allScripts.length}
            icon={<MdLibraryBooks />}
          />
          <SquareStatCard
            title="Total Lines"
            value={totalLines}
            icon={<MdFormatListBulleted />}
          />
        </div>

        {/* 달력 */}
        <CompactCalendar
          practicedDays={practicedDays}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* 최근 활동 */}
        {practiceLogs.length > 0 ? (
          <div className="bg-speaker2 rounded-2xl border-3 border-textPrimary p-4">
            <div className="flex items-center gap-2 mb-2">
              <MdCheckCircle className="w-5 h-5 text-textPrimary" />
              <h3 className="font-display text-sm font-black text-textPrimary uppercase">
                Recent Activity
              </h3>
            </div>
            <p className="font-sans text-sm font-medium text-textPrimary">
              {practiceLogs.length} practice sessions completed. Great work! 🎉
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-3 border-dashed border-textPrimary p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary border-3 border-textPrimary mb-3">
              <MdLibraryBooks className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-lg font-black text-primary mb-2 uppercase">
              Get Started
            </h3>
            <p className="font-sans text-sm text-textPrimary">
              Create your first script to begin your learning journey!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 통계 카드
function SquareStatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <article className="bg-white rounded-2xl border-3 border-textPrimary p-4 md:aspect-square flex flex-row md:flex-col gap-4 md:gap-0 items-center md:items-start md:justify-between">
      {/* 아이콘 */}
      <div className="shrink-0">
        <div className="p-4 bg-primary rounded-xl border-3 border-textPrimary">
          <span className="text-white text-lg">{icon}</span>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 flex flex-col justify-center md:justify-end">
        <h3 className="font-display text-xs font-black text-textPrimary uppercase mb-1">
          {title}
        </h3>
        <p className="font-display text-2xl md:text-3xl font-black text-textPrimary">
          {value}
        </p>
      </div>
    </article>
  );
}

// 달력
function CompactCalendar({
  practicedDays,
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
}: {
  practicedDays: Date[];
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const today = new Date();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const isPracticedDay = (day: number) => {
    return practicedDays.some(
      (practiced) =>
        practiced.getDate() === day &&
        practiced.getMonth() === currentMonth &&
        practiced.getFullYear() === currentYear
    );
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // 연습 횟수
  const practiceCount = practicedDays.filter(
    (date) =>
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
  ).length;

  return (
    <section className="bg-white rounded-2xl border-3 border-textPrimary overflow-hidden">
      {/* 헤더 */}
      <div className="p-3 border-b-3 border-textPrimary bg-primary">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevMonth}
            className="p-1.5 hover:bg-white/20 rounded"
            aria-label="Previous month"
          >
            <MdChevronLeft className="w-4 h-4 text-white" />
          </button>
          <h3 className="font-display text-xl font-bold text-white uppercase">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={onNextMonth}
            className="p-1.5 hover:bg-white/20 rounded"
            aria-label="Next month"
          >
            <MdChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-textPrimary/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <th
                key={day}
                className="py-2 text-base font-bold text-textPrimary uppercase"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {Array.from({ length: 7 }, (_, dayOfWeek) => {
                const dayOfMonth = week * 7 + dayOfWeek - firstDayOfMonth + 1;

                if (dayOfMonth < 1 || dayOfMonth > daysInMonth) {
                  return (
                    <td key={dayOfWeek} className="p-0.5">
                      <div className="h-9" />
                    </td>
                  );
                }

                const isPracticed = isPracticedDay(dayOfMonth);
                const isTodayDay = isToday(dayOfMonth);

                return (
                  <td key={dayOfWeek} className="p-0.5">
                    <button
                      className={`
                        w-full h-9 rounded border-2 transition-all duration-200 text-sm font-bold
                        ${
                          isPracticed
                            ? 'bg-primary text-white border-textPrimary'
                            : isTodayDay
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'text-textSecondary border-transparent hover:border-primary/50 hover:bg-primary/5'
                        }
                      `}
                      onClick={() => console.log(`Selected: ${dayOfMonth}`)}
                      aria-label={`Date ${dayOfMonth}`}
                    >
                      {dayOfMonth}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 범례 */}
      <div className="px-4 py-3 border-t-2 border-textPrimary/10 bg-white">
        <div className="flex items-center justify-between text-xs">
          {/* 연습일 */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-textPrimary bg-primary" />
            <span className="font-sans font-medium text-textPrimary">
              Practice days ({practiceCount})
            </span>
          </div>

          {/* 오늘 */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-primary bg-primary/10" />
            <span className="font-sans font-medium text-textPrimary">
              Today
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
