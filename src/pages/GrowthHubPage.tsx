import { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { supabase } from '@/supabaseClient';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

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
  MdPlayArrow,
  MdDescription,
  MdBarChart,
} from 'react-icons/md';

import {
  loadAllScripts as loadAllScriptsFromLocal,
  loadPracticeLogs as loadPracticeLogsFromLocal,
} from '@/utils/storageService';
import type { PracticeLog, ScriptData } from '@/utils/types';

// 시간대별 인사말 생성 함수
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

// 메인 컨테이너
const DashboardContainer = styled.div`
  width: 100%;
  padding-bottom: 40px;
  background-color: ${({ theme }) => theme.background};
`;

// 헤더 영역
const HeaderSection = styled.header`
  margin-bottom: 32px;
`;

// 인사말 타이틀
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

// 그리드 레이아웃 컨테이너
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

  .react-calendar {
    width: 100%;
    max-width: 360px;
    border: none;
    font-family: 'Lato', 'Noto Sans KR', sans-serif;
    background-color: transparent;
  }

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

  .react-calendar__tile {
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

// 통계 카드 (애니메이션 적용)
const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  cursor: pointer;
`;

// 배경 글로우 효과
const GlowEffect = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: radial-gradient(
    circle,
    rgba(255, 107, 107, 0.3) 0%,
    transparent 70%
  );
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

// 아이콘 래퍼 (애니메이션 적용)
const StatIconWrapper = styled(motion.div)<{ bgColor: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ bgColor }) => bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

// 통계 라벨
const StatLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSub};
  margin: 12px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// 통계 값
const StatValue = styled.h2`
  font-family: 'Lato', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  line-height: 1;
`;

// 연속 연습 정보 영역
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

// 연속 연습 개별 항목
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

// 섹션 제목
const SectionTitle = styled.h3`
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 16px;
`;

// 날짜 표시
const SectionDate = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 500;
`;

// 미션 목록 컨테이너
const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 빈 미션 표시
const EmptyTask = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSub};
  font-size: 14px;
`;

// 미션 개별 항목
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

// 체크박스 버튼
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

// 미션 텍스트
const TaskText = styled.span<{ checked?: boolean }>`
  font-size: 14px;
  color: ${({ theme }) => theme.textMain};
  text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
  flex: 1;
`;

// 삭제 버튼
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

// 미션 입력 영역
const TaskInputWrapper = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 8px;
  background: ${({ theme }) => theme.border};
  padding: 8px;
  border-radius: 16px;
`;

// 미션 입력 필드
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

// 추가 버튼
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

// 통계 스택 컨테이너
const StatsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// 칼럼 컨테이너
const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

// 토스트 컨테이너
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

// 토스트 메시지
const ToastMessage = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.textMain};
  font-size: 15px;
`;

// 토스트 액션 버튼 영역
const ToastActions = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

// 토스트 버튼
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

// 아이콘 컨테이너
const IconContainer = styled.div`
  position: relative;
  z-index: 1;
`;

// 비로그인 시 빈 상태 카드
const EmptyStateCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

// 빈 상태 아이콘
const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

// 빈 상태 제목
const EmptyTitle = styled.h4`
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin: 0;
`;

// 빈 상태 설명
const EmptyText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  margin: 0 0 8px;
  line-height: 1.5;
`;

// 로그인 버튼
const LoginButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

// 메인 컴포넌트
export function GrowthHubPage() {
  const theme = useTheme();

  // 스토어에서 데이터 가져오기
  const user = useAppStore((state) => state.user);
  const storeScripts = useAppStore((state) => state.allScripts);
  const storeLogs = useAppStore((state) => state.practiceLogs);
  const language = useAppStore((state) => state.language);

  // 로컬 데이터 상태
  const [localScripts, setLocalScripts] = useState<ScriptData[]>([]);
  const [localLogs, setLocalLogs] = useState<PracticeLog[]>([]);

  // 비로그인 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    if (!user) {
      setLocalScripts(loadAllScriptsFromLocal());
      setLocalLogs(loadPracticeLogsFromLocal());
    }
  }, [user]);

  // 로그인 여부에 따라 데이터 소스 결정
  const allScripts = user ? storeScripts : localScripts;
  const practiceLogs = user ? storeLogs : localLogs;

  // 사용자 이름 및 인사말
  const userName = user?.user_metadata.full_name?.split(' ')[0] || 'User';
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);

  // 미션 상태
  const [tasks, setTasks] = useState<Mission[]>([]);
  const [newTask, setNewTask] = useState('');

  // 캘린더 날짜 상태
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // 선택된 날짜의 미션 로드
  useEffect(() => {
    const loadMissions = async () => {
      if (user) {
        const data = await fetchMissions(selectedDate.getTime());
        setTasks(data);
      } else {
        setTasks([]);
      }
    };
    loadMissions();
  }, [user, selectedDate]);

  // 미션 추가 핸들러
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

  // 미션 완료/미완료 토글
  const toggleTask = async (id: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t)),
    );
    await toggleMissionInDB(id, !currentStatus);

    // 완료 시 축하 효과
    if (!currentStatus) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success('Mission completed!');
    }
  };

  // 미션 삭제
  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteMissionFromDB(id);
    toast.success('Mission deleted.');
  };

  // 삭제 확인 토스트
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

  // 로그인 핸들러
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
    }
  };

  // 날짜별 연습 횟수 계산
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

  // 캘린더 타일 색상 클래스 결정
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

  // 전체 문장 수 계산
  const totalSentences = useMemo(
    () => allScripts.reduce((acc, script) => acc + script.lines.length, 0),
    [allScripts],
  );

  // 연속 연습 일수 계산
  const currentStreak = useMemo(() => {
    let streak = 0;
    let date = dayjs();

    // 오늘부터 거슬러 올라가며 연속 일수 체크
    while (practiceFrequency[date.format('YYYY-MM-DD')]) {
      streak++;
      date = date.subtract(1, 'day');
    }

    return streak;
  }, [practiceFrequency]);

  // SEO 설정
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

      {/* 헤더 */}
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

          {/* 연속 연습 정보 */}
          <StreakInfo>
            <StreakItem>
              <strong>{currentStreak} Days</strong>
              <span>Current Streak</span>
            </StreakItem>

            {/* 불꽃 아이콘 (연속 연습 시 애니메이션) */}
            <motion.div
              animate={
                currentStreak > 0
                  ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <MdLocalFireDepartment
                size={32}
                color={
                  currentStreak > 0
                    ? theme.colors.orange700
                    : theme.colors.grey400
                }
              />
            </motion.div>

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

          {/* 비로그인 시 로그인 유도 카드 표시 */}
          {!user ? (
            <EmptyStateCard>
              <EmptyIcon>🎯</EmptyIcon>
              <EmptyTitle>Daily Missions Available</EmptyTitle>
              <EmptyText>
                Track your daily goals and stay motivated with personalized
                missions
              </EmptyText>
              <LoginButton onClick={handleLogin}>Login to Start</LoginButton>
            </EmptyStateCard>
          ) : (
            <>
              {/* 미션 목록 */}
              <TaskList>
                {tasks.length === 0 && (
                  <EmptyTask>No missions for this day. Plan ahead!</EmptyTask>
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

              {/* 미션 추가 입력 */}
              <TaskInputWrapper>
                <TaskInput
                  placeholder="Add a new mission..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <AddButton onClick={addTask}>Add</AddButton>
              </TaskInputWrapper>
            </>
          )}
        </Column>

        {/* 오른쪽: 통계 */}
        <Column>
          <SectionTitle>Statistics</SectionTitle>
          <StatsStack>
            {/* 통계 카드 1: 선택된 날짜 연습 횟수 */}
            <StatCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <GlowEffect
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <IconContainer>
                <StatIconWrapper
                  bgColor="#FF6B6B"
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  <MdPlayArrow size={20} />
                </StatIconWrapper>
              </IconContainer>

              <StatLabel>Selected Date Practice</StatLabel>
              <StatValue>
                <AnimatedCounter
                  value={
                    practiceFrequency[
                      dayjs(selectedDate).format('YYYY-MM-DD')
                    ] || 0
                  }
                />
              </StatValue>
            </StatCard>

            {/* 통계 카드 2: 전체 문장 수 */}
            <StatCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <GlowEffect
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                style={{
                  background:
                    'radial-gradient(circle, rgba(78, 205, 196, 0.3) 0%, transparent 100%)',
                }}
              />

              <IconContainer>
                <StatIconWrapper
                  bgColor="#4ECDC4"
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  <MdDescription size={20} />
                </StatIconWrapper>
              </IconContainer>

              <StatLabel>Total Sentences</StatLabel>
              <StatValue>
                <AnimatedCounter value={totalSentences} />
              </StatValue>
            </StatCard>

            {/* 통계 카드 3: 전체 스크립트 수 */}
            <StatCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <GlowEffect
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 230, 109, 0.3) 0%, transparent 100%)',
                }}
              />

              <IconContainer>
                <StatIconWrapper
                  bgColor="#FFE66D"
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  <MdBarChart size={20} />
                </StatIconWrapper>
              </IconContainer>

              <StatLabel>Total Scripts</StatLabel>
              <StatValue>
                <AnimatedCounter value={allScripts.length} />
              </StatValue>
            </StatCard>
          </StatsStack>
        </Column>
      </GridContainer>
    </DashboardContainer>
  );
}
