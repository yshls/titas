import React, { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { useTitle } from '@/hooks/useTitle';
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
          Start your day with a <b>clear voice</b>, {userName}.
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

// 스타일 컴포넌트

const DashboardContainer = styled.div`
  width: 100%;
  padding-bottom: 40px;
  background-color: ${({ theme }) => theme.modes.light.background};
`;

const HeaderSection = styled.header`
  margin-bottom: 32px;
`;

const GreetingTitle = styled.h1`
  font-family: 'Lato', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textMain};
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

// 왼쪽 열: 캘린더 래퍼
const CalendarCard = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.grey100};
  padding: 20px;
  height: fit-content;

  .react-calendar {
    width: 100%;
    border: none;
    font-family: 'Lato', 'Noto Sans KR', sans-serif;
  }
  .react-calendar__navigation {
    margin-bottom: 20px;
  }
  .react-calendar__navigation button {
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.grey700};
  }
  .react-calendar__month-view__weekdays {
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.grey500};
    text-transform: uppercase;
    text-decoration: none;
  }
  abbr[title] {
    text-decoration: none;
  }
  .react-calendar__tile {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    border-radius: 50%;
    &:hover {
      background-color: ${({ theme }) => theme.colors.grey100};
    }
  }
  /* 오늘 날짜 */
  .react-calendar__tile--now {
    background: transparent;
    color: ${({ theme }) => theme.colors.textMain};
    border: 2px solid ${({ theme }) => theme.colors.primary};
    font-weight: 700;
  }
  /* 선택된 날짜 */
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
`;

const StreakInfo = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey100};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StreakItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  strong {
    font-size: 18px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.textMain};
  }
  span {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.grey500};
  }
`;

// 중간 열: 미션
const SectionTitle = styled.h3`
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
  margin-bottom: 16px;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid ${({ theme }) => theme.colors.grey100};
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
  border: 2px solid ${({ theme }) => theme.colors.grey400};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ checked, theme }) =>
    checked ? theme.colors.grey700 : 'transparent'};
  border-color: ${({ checked, theme }) =>
    checked ? theme.colors.grey700 : theme.colors.grey400};
  color: white;
  transition: all 0.2s;
  cursor: pointer;
`;

const TaskText = styled.span<{ checked?: boolean }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.grey700};
  text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
  flex: 1;
`;

const DeleteButton = styled.button`
  opacity: 0;
  color: ${({ theme }) => theme.colors.error};
  transition: opacity 0.2s;
  padding: 4px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.red50};
    border-radius: 4px;
  }
`;

const TaskInputWrapper = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 8px;
  background: ${({ theme }) => theme.colors.grey100};
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
  &::placeholder {
    color: ${({ theme }) => theme.colors.grey500};
  }
`;

const AddButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 10px;
  padding: 6px 18px;
  font-size: 14px;
  font-weight: 700;
  &:hover {
    opacity: 0.9;
  }
`;

// 오른쪽 열: 통계
const StatsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.grey100};
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
  color: ${({ theme }) => theme.colors.textMain};
  margin-bottom: 12px;
`;

const StatValue = styled.h2`
  font-family: 'Lato', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMain};
`;

// 컴포넌트 구현

export function GrowthHubPage() {
  useTitle('Dashboard');
  const theme = useTheme();
  const { user, allScripts, practiceLogs } = useAppStore();

  // 인사말 로직
  const userName = user?.user_metadata.full_name?.split(' ')[0] || 'User';
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);

  // 미션 상태 (DB)
  const [tasks, setTasks] = useState<Mission[]>([]);
  const [newTask, setNewTask] = useState('');

  // 선택된 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 달력 월 이동 상태
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // 선택된 날짜 변경 시 미션 로드
  useEffect(() => {
    const loadMissions = async () => {
      // 타임스탬프 전달 (dbService에서 범위 계산)
      const data = await fetchMissions(selectedDate.getTime());
      setTasks(data);
    };
    loadMissions();
  }, [user, selectedDate]);

  // 미션 추가 (선택된 날짜에 저장)
  const addTask = async () => {
    if (!newTask.trim()) return;

    if (!user) {
      toast.error('Please log in to add missions.');
      return;
    }

    // 선택된 날짜 전달
    const savedTask = await addMissionToDB(newTask, selectedDate);

    if (savedTask) {
      setTasks((prev) => [...prev, savedTask]);
      setNewTask('');
    }
  };

  // 미션 토글
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

  // 캘린더 타일 클래스 (히트맵 색상)
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

  return (
    <DashboardContainer>
      <HeaderSection>
        <GreetingTitle>{greeting.title}</GreetingTitle>
      </HeaderSection>

      <GridContainer>
        {/* Left Column: Calendar */}
        <CalendarCard>
          <Calendar
            locale="en-US"
            formatDay={(locale, date) => dayjs(date).format('D')}
            tileClassName={tileClassName}
            next2Label={null}
            prev2Label={null}
            // 달력 상태 연결
            value={selectedDate}
            onClickDay={setSelectedDate} // 날짜 클릭 시 업데이트
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

        {/* Middle Column: Daily Missions */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle>
            Daily Missions {/* 선택된 날짜 표시 */}
            <span
              style={{
                fontSize: '14px',
                color: theme.colors.grey500,
                fontWeight: 500,
              }}
            >
              ({dayjs(selectedDate).format('MMM D')})
            </span>
          </SectionTitle>

          <TaskList>
            {tasks.length === 0 && (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: theme.colors.grey500,
                  fontSize: '14px',
                }}
              >
                No missions for this day. Plan ahead!
              </div>
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
                  onClick={() => deleteTask(task.id)}
                >
                  <MdDeleteOutline size={18} />
                </DeleteButton>
              </TaskItem>
            ))}
          </TaskList>

          {/* 입력창 항상 표시 */}
          <TaskInputWrapper>
            <TaskInput
              placeholder="Add a new mission..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <AddButton onClick={addTask}>Add</AddButton>
          </TaskInputWrapper>
        </div>

        {/* Right Column: Stats */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
        </div>
      </GridContainer>
    </DashboardContainer>
  );
}
