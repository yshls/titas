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

  // 초기 데이터
  useEffect(() => {
    const hasUsedApp = localStorage.getItem('titas-storage');

    if (allScripts.length === 0 && !hasUsedApp) {
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
    <div className="min-h-full pb-3" role="main" aria-label="Dashboard">
      {/* 헤더 */}
      <header className="mb-4 text-center md:text-left">
        <h1 className="font-display text-4xl font-black text-accent mb-2 uppercase tracking-tight">
          Welcome Back!
        </h1>
        <p className="font-sans text-sm font-bold text-text-secondary">
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
          <div className="flex flex-col gap-4">
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
            <div className="bg-white rounded-2xl border-2 border-border-default p-4 ">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <MdCheckCircle className="w-7 h-7 text-success" />
                </div>
                <h3 className="font-display text-xl font-black text-accent uppercase">
                  Recent Activity
                </h3>
              </div>
              <p className="font-sans text-lg font-medium text-text-primary mb-2">
                You've completed{' '}
                <strong className="font-display text-2xl font-bold text-accent">
                  {practiceLogs.length}
                </strong>
                practice sessions
              </p>
              <p className="font-sans text-sm font-medium text-secondary">
                Keep up the great work! 🎉
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-border-dashed border-dashed p-8 text-center ">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary border-2 border-border-default mb-4 ">
                <MdLibraryBooks className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display text-2xl font-black text-accent mb-3 uppercase">
                Start Your Practice Journey
              </h3>
              <p className="font-sans text-base text-text-secondary">
                Create your first script and begin practicing to see your
                progress here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden space-y-6">
        {/* 달력 */}
        <CompactCalendar
          practicedDays={practicedDays}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* 통계 */}
        <div className="flex flex-col gap-4">
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
          <div className="bg-accent/10 rounded-2xl border-2 border-border-default p-3 ">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-success/10 rounded-lg">
                <MdCheckCircle className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-display text-sm font-black text-accent uppercase">
                Recent Activity
              </h3>
            </div>
            <p className="font-sans text-sm font-medium text-text-primary">
              <span className="font-display text-lg font-bold text-accent">
                {practiceLogs.length}
              </span>{' '}
              practice sessions completed. Great work! 🎉
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-border-dashed p-6 text-center ">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary border-2 border-border-default mb-3 ">
              <MdLibraryBooks className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-lg font-black text-accent mb-2 uppercase">
              Get Started
            </h3>
            <p className="font-sans text-sm text-text-secondary">
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
    <article className="bg-white rounded-2xl border-2 border-border-default p-4 flex flex-row gap-4 items-center transition-transform duration-300">
      {/* 아이콘 */}
      <div className="shrink-0">
        <div className="p-3 bg-primary/10 rounded-xl border-2 border-border-default">
          <span className="text-primary text-2xl">{icon}</span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-black text-secondary uppercase">
            {title}
          </h3>
        </div>
        <p className="font-display text-2xl md:text-3xl font-black text-accent">
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

  return (
    <section className="bg-white rounded-2xl border-2 border-border-default overflow-hidden ">
      {/* 헤더 */}
      <div className="p-3 border-b-2 border-border-default bg-primary">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center justify-center active:scale-95"
            aria-label="Previous month"
          >
            <MdChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h3 className="font-display text-xl font-bold text-white uppercase">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center justify-center active:scale-95"
            aria-label="Next month"
          >
            <MdChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 border-b-2 border-border-subtle bg-primary/5 ">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-3 px-2 text-xs font-bold text-text-primary uppercase text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {/* 앞쪽 빈칸 */}
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, index) => (
            <div key={`empty-${index}`} className="h-10 w-full" />
          ))}

        {/* 날짜들 */}
        {Array.from({ length: daysInMonth }, (_, dayIndex) => {
          const dayOfMonth = dayIndex + 1;
          const isPracticed = isPracticedDay(dayOfMonth);
          const isTodayDay = isToday(dayOfMonth);

          return (
            <button
              key={dayOfMonth}
              className={`
                h-10 w-full flex items-center justify-center rounded-lg border-2 transition-all duration-300 text-sm font-bold
                focus:outline-none
                ${
                  isPracticed
                    ? 'bg-success text-white border-success '
                    : isTodayDay
                    ? 'bg-accent border-accent text-white font-bold '
                    : 'text-secondary border-transparent hover:bg-primary/5 hover:text-text-primary active:bg-primary/10'
                }
              `}
              onClick={() => console.log(`Selected: ${dayOfMonth}`)}
              aria-label={`Date ${dayOfMonth}, ${
                isPracticed ? 'practiced' : isTodayDay ? 'today' : 'regular day'
              }`}
            >
              {dayOfMonth}
            </button>
          );
        })}

        {/* 뒤쪽 빈칸 */}
        {Array(42 - (firstDayOfMonth + daysInMonth))
          .fill(null)
          .map((_, index) => (
            <div key={`fill-${index}`} className="h-10 w-full" />
          ))}
      </div>

      {/* 범례 */}
      <div className="p-3 border-t-2 border-border-subtle ">
        <div className="flex items-center justify-between text-xs">
          {/* 연습일 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-success border-2 border-success ">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span className="font-sans font-medium text-text-primary">
              Practice days
            </span>
          </div>

          {/* 오늘 */}
          <div className="flex items-center gap-3 font-display">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-accent border-2 border-accent ">
              <span className="text-white text-xs font-bold">•</span>
            </div>
            <span className="font-sans font-medium text-text-primary">
              Today
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
