import { useMemo, useState, useEffect } from 'react';
import { useAppStore, type AppState } from '@/store/appStore';
import { useTitle } from '@/hooks/useTitle';
import type { PracticeLog, ScriptData } from '@/utils/types';
import {
  MdTrendingUp,
  MdLibraryBooks,
  MdBarChart,
  MdEdit,
  MdMic,
  MdClose,
  MdFormatListBulleted,
  MdCheckCircle,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';

export function GrowthHubPage() {
  useTitle('Dashboard');

  // 상태 관리
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBanner, setShowBanner] = useState(false); // 배너 표시 여부 (useEffect에서 결정)

  const allScripts = useAppStore((state: AppState) => state.allScripts);
  const practiceLogs = useAppStore((state: AppState) => state.practiceLogs);

  // 달력 상태 (현재 보고 있는 연/월)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // 연습한 날짜 추출 (달력 표시용)
  const practicedDays = useMemo(() => {
    return practiceLogs.map((log: PracticeLog) => new Date(log.date));
  }, [practiceLogs]);

  // 방문 및 배너 상태 체크
  useEffect(() => {
    // 1. 온보딩 모달 체크 (첫 방문 시에만 표시)
    const hasVisited = localStorage.getItem('titas_has_visited');
    if (!hasVisited) {
      setShowOnboarding(true);
      localStorage.setItem('titas_has_visited', 'true');
    }

    // 2. 배너 닫기 기록 체크 (사용자가 닫은 적 없으면 표시)
    const isBannerClosed = localStorage.getItem('titas_v1_banner_closed');
    if (!isBannerClosed) {
      setShowBanner(true);
    }
  }, []);

  // 배너 닫기 핸들러 (로컬 스토리지에 기록하여 영구 숨김)
  const handleCloseBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBanner(false);
    localStorage.setItem('titas_v1_banner_closed', 'true');
  };

  // 평균 정확도 계산 (모든 연습 기록 기준)
  const avgAccuracy = useMemo(() => {
    if (practiceLogs.length === 0) return 0;
    const total = practiceLogs.reduce(
      (acc: number, log: PracticeLog) => acc + log.accuracy,
      0
    );
    return total / practiceLogs.length;
  }, [practiceLogs]);

  // 총 대사 라인 수 계산 (모든 스크립트 합산)
  const totalLines = useMemo(() => {
    return allScripts.reduce(
      (acc: number, script: ScriptData) => acc + script.lines.length,
      0
    );
  }, [allScripts]);

  // 달력 월 이동 핸들러
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
      {/* 온보딩 모달 */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3">
          <div className="relative bg-white rounded-2xl p-3 sm:p-8 text-center max-w-2xl w-full animate-enter">
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close Onboarding"
            >
              <MdClose className="w-6 h-6 text-text-secondary" />
            </button>
            <img
              src="/titas_logo.png"
              alt="TiTaS Logo"
              className="h-10 mx-auto mb-2"
            />
            <h2 className="font-display text-2xl sm:text-3xl font-black text-accent uppercase mb-2">
              Welcome to TiTaS!
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              TiTaS는 '실전 회화 근육'을 만드는 훈련장입니다. <br />
              아래 3단계로 말하기 실력을 키워보세요.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-8">
              <div className="bg-primary/5 p-3 rounded-xl border border-border-default">
                <MdEdit className="w-8 h-8 text-text-primary mx-auto mb-2" />
                <p className="font-display font-bold text-text-primary">
                  1. Create
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  연습할 대본을 직접 만드세요.
                </p>
              </div>
              <div className="bg-primary/5 p-3 rounded-xl border border-border-default">
                <MdMic className="w-8 h-8 text-text-primary mx-auto mb-2" />
                <p className="font-display font-bold text-text-primary">
                  2. Practice
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  역할을 골라 실전처럼 연습하세요.
                </p>
              </div>
              <div className="bg-primary/5 p-3 rounded-xl border border-border-default">
                <MdBarChart className="w-8 h-8 text-text-primary mx-auto mb-2" />
                <p className="font-display font-bold text-text-primary">
                  3. Review
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  자주 틀리는 단어를 확인하세요.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowOnboarding(false)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl border border-border-default font-bold uppercase text-sm hover:scale-105 transition-transform"
            >
              훈련 시작하기!
            </button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="mb-4 text-center md:text-left">
        <h1 className="font-display text-4xl font-black text-accent mb-2 uppercase tracking-tight">
          Welcome Back!
        </h1>
        <p className="font-sans text-sm font-bold text-text-secondary">
          Track your progress and keep practicing!
        </p>
      </header>

      {/* 상단 배너 (Cloud Sync 안내 - 닫기 전까지 표시) */}
      {showBanner && (
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl shadow-sm transition-all hover:border-gray-200">
            <div className="flex items-center gap-4">
              {/* 심플 아이콘 */}
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
                <MdLibraryBooks className="w-5 h-5 text-[#8D7B68]" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                <h4 className="text-sm font-bold text-gray-900 leading-none">
                  Cloud Sync
                </h4>
                <span className="hidden md:block w-1 h-1 bg-gray-300 rounded-full" />
                <p className="text-xs text-gray-500 font-medium leading-none">
                  PC와 모바일,{' '}
                  <span className="text-[#8D7B68] font-bold">어디서든</span>{' '}
                  끊김 없이 연습하세요.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-[11px] font-bold text-[#8D7B68] hover:text-accent px-3 py-1.5 transition-colors uppercase tracking-wider"
              >
                Details
              </button>
              <button
                onClick={handleCloseBanner}
                className="p-1.5 hover:bg-gray-200/50 rounded-full transition-colors text-gray-400"
                aria-label="Close"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [데스크탑 레이아웃] 2열 그리드 (달력 | 통계) */}
      <div className="hidden md:grid md:grid-cols-2 gap-8">
        <CompactCalendar
          practicedDays={practicedDays}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <div className="space-y-6">
          {/* 주요 지표 카드 3개 */}
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

          {/* 최근 활동 요약 또는 빈 상태 메시지 */}
          {practiceLogs.length > 0 ? (
            <div className="bg-white rounded-2xl border border-border-default p-4">
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
                </strong>{' '}
                practice sessions
              </p>
              <p className="font-sans text-sm font-medium text-secondary">
                Keep up the great work! 🎉
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border-dashed border-dashed p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary border border-border-default mb-4">
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

      {/* [모바일 레이아웃] 1열 스택 구조 */}
      <div className="md:hidden space-y-6">
        <CompactCalendar
          practicedDays={practicedDays}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

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

        {practiceLogs.length > 0 ? (
          <div className="bg-accent/10 rounded-2xl border border-border-default p-3">
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
          <div className="bg-white rounded-2xl border border-border-dashed p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary border border-border-default mb-3">
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

// 통계 카드 컴포넌트
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
    <article className="bg-white rounded-2xl border border-border-default p-4 flex flex-row gap-4 items-center">
      <div className="shrink-0">
        <div className="p-3 bg-primary/10 rounded-xl border border-border-default">
          <span className="text-primary text-2xl">{icon}</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-between">
        <h3 className="font-display text-base font-black text-secondary uppercase">
          {title}
        </h3>
        <p className="font-display text-2xl md:text-3xl font-black text-accent">
          {value}
        </p>
      </div>
    </article>
  );
}

// 달력 컴포넌트
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

  const isPracticedDay = (day: number) =>
    practicedDays.some(
      (practiced) =>
        practiced.getDate() === day &&
        practiced.getMonth() === currentMonth &&
        practiced.getFullYear() === currentYear
    );

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <section className="bg-white rounded-2xl border border-border-default overflow-hidden">
      <div className="p-3 border-b border-border-default bg-primary">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
            aria-label="Previous month"
          >
            <MdChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h3 className="font-display text-xl font-bold text-white uppercase">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
            aria-label="Next month"
          >
            <MdChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border-subtle bg-primary/5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-3 text-xs font-bold text-text-primary uppercase text-center"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-2">
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, i) => (
            <div key={`e-${i}`} className="h-10" />
          ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isPracticed = isPracticedDay(day);
          const isT = isToday(day);
          return (
            <button
              key={day}
              className={`h-10 w-full flex items-center justify-center rounded-lg border text-sm font-bold transition-all
                ${
                  isPracticed
                    ? 'bg-success text-white border-success'
                    : isT
                    ? 'bg-accent border-accent text-white'
                    : 'text-secondary border-transparent hover:bg-primary/5'
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-border-subtle">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
            <span className="font-medium text-text-primary">Practice days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent flex items-center justify-center text-white text-[10px]">
              •
            </div>
            <span className="font-medium text-text-primary">Today</span>
          </div>
        </div>
      </div>
    </section>
  );
}
