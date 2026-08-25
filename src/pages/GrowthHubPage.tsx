import { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { Trans, useTranslation } from 'react-i18next';
import {
  MdWbSunny,
  MdBolt,
  MdAutoAwesome,
  MdNightlight,
} from 'react-icons/md';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';
import { useMissions } from '@/hooks/pageSpecific/useMissions';

import { MissionManager } from '@/components/GrowthHub/MissionManager';
import { ReviewPrompt } from '@/components/GrowthHub/ReviewPrompt';
import { CalendarSection, StatisticsColumn } from '@/components/GrowthHub/ProgressDashboard';

import {
  loadAllScripts as loadAllScriptsFromLocal,
  loadPracticeLogs as loadPracticeLogsFromLocal,
} from '@/utils/storageService';
import type { PracticeLog, ScriptData } from '@/utils/types';

// 시간대별 인사말: 번역 키와 아이콘을 함께 결정한다.
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12)
    return { key: 'dashboard.greeting.morning', Icon: MdWbSunny };
  if (hour >= 12 && hour < 18)
    return { key: 'dashboard.greeting.afternoon', Icon: MdBolt };
  if (hour >= 18 && hour < 22)
    return { key: 'dashboard.greeting.evening', Icon: MdAutoAwesome };
  return { key: 'dashboard.greeting.night', Icon: MdNightlight };
};

// 화면 가장자리 여백은 스크립트 목록(ScriptListPage)의 PageContainer를 기준으로 맞춘다.
const DashboardContainer = styled.div`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.background};

  @media (min-width: 1024px) {
    padding: 8px;
  }
`;

const HeaderSection = styled.header`
  margin-bottom: 24px;
`;

const GreetingTitle = styled.h1`
  font-family: 'Lato', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 8px;
  b { font-weight: 800; }
`;

const GreetingRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const GreetingIcon = styled.span`
  flex-shrink: 0;
  /* 첫 줄 글자 높이에 맞춰 아이콘을 정렬한다. */
  line-height: 1;
  padding-top: 4px;
  color: ${({ theme }) => theme.textSub};
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
  const { t } = useTranslation();
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

  const userName = user?.user_metadata.full_name?.split(' ')[0] || t('dashboard.defaultUserName');
  const { key: greetingKey, Icon: GreetingTimeIcon } = useMemo(
    () => getGreeting(),
    [],
  );

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
        <GreetingRow>
          <GreetingIcon aria-hidden="true">
            <GreetingTimeIcon size={26} />
          </GreetingIcon>
          <GreetingTitle>
            <Trans i18nKey={greetingKey} values={{ name: userName }} components={{ bold: <b /> }} />
          </GreetingTitle>
        </GreetingRow>
      </HeaderSection>

      <ReviewPrompt />

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
