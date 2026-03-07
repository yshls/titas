import { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';
import { useMissions } from '@/hooks/pageSpecific/useMissions';

import { MissionManager } from '@/components/GrowthHub/MissionManager';
import { CalendarSection, StatisticsColumn } from '@/components/GrowthHub/ProgressDashboard';

import {
  loadAllScripts as loadAllScriptsFromLocal,
  loadPracticeLogs as loadPracticeLogsFromLocal,
} from '@/utils/storageService';
import type { PracticeLog, ScriptData } from '@/utils/types';

// 시간대별 인사말 생성 함수
const getTimeBasedGreeting = (userName: string) => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { title: <>☀️ Start your day with a <b>clear voice</b>, {userName}.</> };
  if (hour >= 12 && hour < 18) return { title: <>⚡ Perfect time for a <b>quick session</b>, {userName}.</> };
  if (hour >= 18 && hour < 22) return { title: <>✨ Shall we <b>review your progress</b>, {userName}?</> };
  return { title: <>🌙 End your day on a <b>high note</b>, {userName}.</> };
};

const DashboardContainer = styled.div`
  width: 100%;
  padding-bottom: 40px;
  background-color: ${({ theme }) => theme.background};
`;

const HeaderSection = styled.header`
  margin-bottom: 32px;
`;

const GreetingTitle = styled.h1`
  font-family: 'Lato', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 8px;
  b { font-weight: 800; }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  @media (min-width: 1024px) {
    grid-template-columns: 320px 1fr 240px;
  }
`;

export function GrowthHubPage() {
  const user = useAppStore((state) => state.user);
  const storeScripts = useAppStore((state) => state.allScripts);
  const storeLogs = useAppStore((state) => state.practiceLogs);
  const language = useAppStore((state) => state.language);

  const [localScripts, setLocalScripts] = useState<ScriptData[]>([]);
  const [localLogs, setLocalLogs] = useState<PracticeLog[]>([]);

  useEffect(() => {
    if (!user) {
      setLocalScripts(loadAllScriptsFromLocal());
      setLocalLogs(loadPracticeLogsFromLocal());
    }
  }, [user]);

  const allScripts = user ? storeScripts : localScripts;
  const practiceLogs = user ? storeLogs : localLogs;

  const userName = user?.user_metadata.full_name?.split(' ')[0] || 'User';
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // 미션 커스텀 훅 로드
  const { tasks, newTask, setNewTask, addTask, toggleTask, deleteTask } = useMissions(selectedDate);

  const practiceFrequency = useMemo(() => {
    return practiceLogs.reduce((acc, log) => {
      const dateKey = dayjs(log.date).format('YYYY-MM-DD');
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [practiceLogs]);

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const count = practiceFrequency[dayjs(date).format('YYYY-MM-DD')] || 0;
      if (count >= 6) return 'color-scale-4';
      if (count >= 4) return 'color-scale-3';
      if (count >= 2) return 'color-scale-2';
      if (count >= 1) return 'color-scale-1';
    }
    return null;
  };

  const totalSentences = useMemo(
    () => allScripts.reduce((acc, script) => acc + script.lines.length, 0),
    [allScripts]
  );

  const currentStreak = useMemo(() => {
    let streak = 0;
    let date = dayjs();
    while (practiceFrequency[date.format('YYYY-MM-DD')]) {
      streak++;
      date = date.subtract(1, 'day');
    }
    return streak;
  }, [practiceFrequency]);

  const seoProps = language === 'en'
    ? { title: 'Dashboard', description: 'Track your English learning progress and daily missions.' }
    : { title: '대시보드', description: '학습 진행 상황과 일일 미션을 확인하세요.' };

  const dateStr = dayjs(selectedDate).format('MMM D');

  return (
    <DashboardContainer>
      <Seo {...seoProps} />
      <HeaderSection>
        <GreetingTitle>{greeting.title}</GreetingTitle>
      </HeaderSection>

      <GridContainer>
        {/* 왼쪽: 커스텀 분리된 달력 컴포넌트 */}
        <CalendarSection 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          activeStartDate={activeStartDate}
          setActiveStartDate={setActiveStartDate}
          tileClassName={tileClassName}
          currentStreak={currentStreak}
          totalPractice={practiceLogs.length}
        />

        {/* 중앙: 커스텀 분리된 미션 관리자 컴포넌트 */}
        <MissionManager 
          user={user}
          dateStr={dateStr}
          tasks={tasks}
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
        />

        {/* 오른쪽: 커스텀 분리된 통계 컴포넌트 */}
        <StatisticsColumn 
          selectedDateFreq={practiceFrequency[dayjs(selectedDate).format('YYYY-MM-DD')] || 0}
          totalSentences={totalSentences}
          totalScripts={allScripts.length}
        />
      </GridContainer>
    </DashboardContainer>
  );
}
