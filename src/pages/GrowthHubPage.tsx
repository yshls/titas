import { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';

import {
  fetchMissions,
  addMissionToDB,
  toggleMissionInDB,
  deleteMissionFromDB,
} from '@/services/dbService';
import type { Mission } from '@/utils/types';
import {
  MdLocalFireDepartment,
  MdCheck,
  MdDeleteOutline,
} from 'react-icons/md';

// 로직 헬퍼
const getTimeBasedGreeting = (userName: string) => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return {
      title: (
        <>
          ☀️ Start your day with a <b>clear voice</b>, {userName}.
        </>
      ),
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      title: (
        <>
          ⚡ Perfect time for a <b>quick session</b>, {userName}.
        </>
      ),
    };
  } else if (hour >= 18 && hour < 22) {
    return {
      title: (
        <>
          ✨ Shall we <b>review your progress</b>, {userName}?
        </>
      ),
    };
  } else {
    return {
      title: (
        <>
          🌙 End your day on a <b>high note</b>, {userName}.
        </>
      ),
    };
  }
};

// 스타일
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
  b {
    font-weight: 800;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  @media (min-width: 1024px) {
    grid-template-columns: 320px 1fr 240px;
  }
`;

// 캘린더 카드
const CalendarCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 24px 20px 20px;
  height: fit-content;

  display: flex;
  flex-direction: column;
  align-items: center;

  /* 캘린더 전체 */
  .react-calendar {
    width: 100%;
    max-width: 360px;
    border: none;
    font-family: 'Lato', 'Noto Sans KR', sans-serif;
    background-color: transparent;
  }

  /* 캘린더 네비게이션 */
  .react-calendar__navigation {
    margin-bottom: 24px;
  }
  .react-calendar__navigation button {
    font-size: 18px;
    font-weight: 800;
    color: ${({ theme }) => theme.textMain};

    background-color: transparent !important;
    border: none;
    outline: none;
    border-radius: 12px;
    padding: 8px 12px;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.border} !important;

      &:enabled:active,
      &:enabled:focus {
        background-color: transparent !important;
        border: none;
        outline: none;
      }
    }
  }

  .react-calendar__navigation button:disabled {
    background-color: transparent;
  }

  /* 캘린더 요일 */
  .react-calendar__month-view__weekdays {
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    color: ${({ theme }) => theme.textSub};
    text-transform: uppercase;
    text-decoration: none;

    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding-bottom: 12px;
    margin-bottom: 12px;

    abbr[title] {
      text-decoration: none;
    }
  }

  .react-calendar__month-view__weekdays__weekday:nth-of-type(1) {
    color: ${({ theme }) => theme.colors.red600};
  }

  .react-calendar__month-view__weekdays__weekday:nth-of-type(7) {
    color: ${({ theme }) => theme.colors.blue600};
  }

  /* 캘린더 날짜 타일 */
  .react-calendar__tile {
    /* 날짜 타일 너비 */
    flex: 0 0 calc(14.2857% - 4px) !important;
    max-width: calc(14.2857% - 4px) !important;

    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    border-radius: 50%;
    margin: 2px;
    color: ${({ theme }) => theme.textMain};

    transition: all 0.2s;

    &:hover {
      background-color: ${({ theme }) => theme.border};
    }
  }

  .react-calendar__month-view__days__day:nth-of-type(7n) {
    color: ${({ theme }) => theme.colors.blue600};
  }

  .react-calendar__month-view__days__day:nth-of-type(7n + 1) {
    color: ${({ theme }) => theme.colors.red600};
  }

  /* 오늘 날짜 타일 */
  .react-calendar__tile--now {
    background: transparent;
    color: ${({ theme }) => theme.textMain};
    border: 2px solid ${({ theme }) => theme.colors.primary};
    font-weight: 800;
  }

  .react-calendar__tile--active {
    background: ${({ theme }) => theme.colors.orange500} !important;
    color: white !important;
  }

  /* 히트맵 색상 */
  .color-scale-1 {
    background-color: ${({ theme }) => theme.colors.orange50} !important;
    color: ${({ theme }) => theme.colors.primary} !important;
  }
  .color-scale-2 {
    background-color: ${({ theme }) => theme.colors.orange100} !important;
    color: ${({ theme }) => theme.colors.orange900} !important;
  }
  .color-scale-3 {
    background-color: ${({ theme }) => theme.colors.orange300} !important;
    color: white !important;
  }
  .color-scale-4 {
    background-color: ${({ theme }) => theme.colors.primary} !important;
    color: white !important;
  }

  @media (max-width: 768px) {
    .react-calendar {
      max-width: 100%;
    }
    .react-calendar__tile {
      font-size: 12px;
      margin: 1px;
      flex: 0 0 calc(14.2857% - 2px) !important;
      max-width: calc(14.2857% - 2px) !important;
    }
  }
`;

// 연속 연습 정보
const StreakInfo = styled.div`
  width: 100%;
  max-width: 360px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const StreakItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  strong {
    font-size: 18px;
    font-weight: 800;
    color: ${({ theme }) => theme.textMain};
  }
  span {
    font-size: 11px;
    color: ${({ theme }) => theme.textSub};
  }
`;

// 일일 미션
const SectionTitle = styled.h3`
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 16px;
`;

const SectionDate = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 500;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyTask = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSub};
  font-size: 14px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  gap: 12px;
  position: relative;

  &:hover .delete-btn {
    opacity: 1;
  }
`;

const Checkbox = styled.button<{ checked?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid ${({ theme }) => theme.textSub};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ checked, theme }) =>
    checked ? theme.textMain : 'transparent'};
  border-color: ${({ checked, theme }) =>
    checked ? theme.textMain : theme.textSub};
  color: ${({ theme }) => theme.background};
  transition: all 0.2s;
  cursor: pointer;
`;

const TaskText = styled.span<{ checked?: boolean }>`
  font-size: 14px;
  color: ${({ theme }) => theme.textMain};
  text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
  flex: 1;
`;

const DeleteButton = styled.button`
  opacity: 0;
  color: ${({ theme }) => theme.colors.error};
  transition: opacity 0.2s;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.red50};
    border-radius: 4px;
  }
`;

const TaskInputWrapper = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 8px;
  background: ${({ theme }) => theme.border};
  padding: 8px;
  border-radius: 16px;
`;

const TaskInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 4px 12px;
  font-size: 14px;
  outline: none;
  color: ${({ theme }) => theme.textMain};
  &::placeholder {
    color: ${({ theme }) => theme.textSub};
  }
`;

const AddButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 10px;
  padding: 6px 18px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

// 전체 통계
const StatsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const StatLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 12px;
`;

const StatValue = styled.h2`
  font-family: 'Lato', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
`;

// Toast
const ToastContainer = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 12px;
  color: ${({ theme }) => theme.textMain};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 280px;
`;

const ToastMessage = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.textMain};
  font-size: 15px;
`;

const ToastActions = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const ToastButton = styled.button<{ variant?: 'danger' | 'cancel' }>`
  flex: 1;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  ${({ theme, variant }) =>
    variant === 'danger'
      ? `
    background: ${theme.colors.error};
    color: white;
  `
      : `
    background: ${theme.border};
    color: ${theme.textMain};
  `}
`;

import {
  loadAllScripts as loadAllScriptsFromLocal,
  loadPracticeLogs as loadPracticeLogsFromLocal,
} from '@/utils/storageService';
import type { PracticeLog, ScriptData } from '@/utils/types';





// GrowthHub 페이지
export function GrowthHubPage() {
  const theme = useTheme();

  // 데이터 소스 분기 처리
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

  // 시간에 따른 인사
  const userName = user?.user_metadata.full_name?.split(' ')[0] || 'User';
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);

  // 미션 상태
  const [tasks, setTasks] = useState<Mission[]>([]);
  const [newTask, setNewTask] = useState('');

  // 선택된 날짜
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 캘린더 표시 월
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // 날짜 변경시 미션 로드 (로그인 사용자만)
  useEffect(() => {
    const loadMissions = async () => {
      if (user) {
        const data = await fetchMissions(selectedDate.getTime());
        setTasks(data);
      } else {
        setTasks([]); // 비로그인 시 미션 초기화
      }
    };
    loadMissions();
  }, [user, selectedDate]);

  // 미션 추가
  const addTask = async () => {
    if (!newTask.trim()) return;
    if (!user) {
      toast.error('You need to be logged in to add a mission.');
      return;
    }
    const savedTask = await addMissionToDB(newTask, selectedDate);
    if (savedTask) {
      setTasks((prev) => [...prev, savedTask]);
      setNewTask('');
    }
  };

  // 미션 완료 토글
  const toggleTask = async (id: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t)),
    );
    await toggleMissionInDB(id, !currentStatus);
  };

  // 미션 삭제
  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteMissionFromDB(id);
    toast.success('Mission deleted.');
  };

  const confirmDelete = (id: string) => {
    toast.custom(
      (t) => (
        <ToastContainer>
          <ToastMessage>Are you sure you want to delete?</ToastMessage>
          <ToastActions>
            <ToastButton
              variant="danger"
              onClick={() => {
                deleteTask(id);
                toast.dismiss(t.id);
              }}
            >
              Delete
            </ToastButton>
            <ToastButton variant="cancel" onClick={() => toast.dismiss(t.id)}>
              Cancel
            </ToastButton>
          </ToastActions>
        </ToastContainer>
      ),
      {
        duration: 4000,
      },
    );
  };

  // 캘린더 히트맵 데이터
  const practiceFrequency = useMemo(() => {
    return practiceLogs.reduce(
      (acc, log) => {
        const dateKey = dayjs(log.date).format('YYYY-MM-DD');
        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [practiceLogs]);

  // 캘린더 타일 클래스
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateKey = dayjs(date).format('YYYY-MM-DD');
      const count = practiceFrequency[dateKey] || 0;
      if (count >= 6) return 'color-scale-4';
      if (count >= 4) return 'color-scale-3';
      if (count >= 2) return 'color-scale-2';
      if (count >= 1) return 'color-scale-1';
    }
    return null;
  };

  // 통계 데이터
  const totalSentences = useMemo(
    () => allScripts.reduce((acc, script) => acc + script.lines.length, 0),
    [allScripts],
  );

  const currentStreak = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return practiceFrequency[today] ? 1 : 0; // 오늘 연습 여부 확인
  }, [practiceFrequency]);

  const seoProps =
    language === 'en'
      ? {
          title: 'Dashboard - Your English Growth Hub',
          description:
            'Track your English learning progress, manage daily missions, and see your practice statistics all in one place.',
        }
      : {
          title: '대시보드 - 당신의 영어 성장 허브',
          description:
            '영어 학습 진행 상황을 추적하고, 일일 미션을 관리하며, 연습 통계를 한 곳에서 확인하세요.',
        };

  return (
    <DashboardContainer>
      <Seo {...seoProps} />
      <HeaderSection>
        <GreetingTitle>{greeting.title}</GreetingTitle>
      </HeaderSection>

      <GridContainer>
        {/* 왼쪽: 캘린더 */}
        <CalendarCard>
          <Calendar
            locale="en-US"
            formatDay={(_, date) => dayjs(date).format('D')}
            tileClassName={tileClassName}
            next2Label={null}
            prev2Label={null}
            value={selectedDate}
            onClickDay={setSelectedDate}
            activeStartDate={activeStartDate}
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveStartDate(activeStartDate!)
            }
          />
          <StreakInfo>
            <StreakItem>
              <strong>{currentStreak} Days</strong>
              <span>Current Streak</span>
            </StreakItem>
            <MdLocalFireDepartment size={32} color={theme.colors.orange700} />
            <StreakItem>
              <strong>{practiceLogs.length} Times</strong>
              <span>Total Practice</span>
            </StreakItem>
          </StreakInfo>
        </CalendarCard>

        {/* 중앙: 일일 미션 */}
        <Column>
          <SectionTitle>
            Daily Missions{' '}
            <SectionDate>({dayjs(selectedDate).format('MMM D')})</SectionDate>
          </SectionTitle>

          <TaskList>
            {tasks.length === 0 && (
              <EmptyTask>
                {user
                  ? 'No missions for this day. Plan ahead!'
                  : 'Log in to use Daily Missions.'}
              </EmptyTask>
            )}
            {tasks.map((task) => (
              <TaskItem key={task.id}>
                <Checkbox
                  checked={task.completed}
                  onClick={() => toggleTask(task.id, task.completed)}
                >
                  {task.completed && <MdCheck size={14} />}
                </Checkbox>
                <TaskText checked={task.completed}>{task.text}</TaskText>
                <DeleteButton
                  className="delete-btn"
                  onClick={() => confirmDelete(task.id)}
                >
                  <MdDeleteOutline size={18} />
                </DeleteButton>
              </TaskItem>
            ))}
          </TaskList>

          {/* 새 미션 입력 (로그인 시에만 렌더링) */}
          {user && (
            <TaskInputWrapper>
              <TaskInput
                placeholder="Add a new mission..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <AddButton onClick={addTask}>Add</AddButton>
            </TaskInputWrapper>
          )}
        </Column>

        {/* 오른쪽: 통계 */}
        <Column>
          <SectionTitle>Statistics</SectionTitle>
          <StatsStack>
            <StatCard>
              <StatLabel>Selected Date Practice</StatLabel>
              <StatValue>
                {practiceFrequency[dayjs(selectedDate).format('YYYY-MM-DD')] ||
                  0}
              </StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>Total Sentences</StatLabel>
              <StatValue>{totalSentences}</StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>Total Scripts</StatLabel>
              <StatValue>{allScripts.length}</StatValue>
            </StatCard>
          </StatsStack>
        </Column>
      </GridContainer>
    </DashboardContainer>
  );
}

