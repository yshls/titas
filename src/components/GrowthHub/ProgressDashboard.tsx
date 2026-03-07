import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { useTheme } from '@emotion/react';
import { MdLocalFireDepartment, MdPlayArrow, MdDescription, MdBarChart } from 'react-icons/md';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

const CalendarCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 24px 20px 20px;
  height: fit-content;
  box-shadow: none;

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

  .react-calendar__navigation { margin-bottom: 24px; }
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
      &:enabled:active, &:enabled:focus {
        background-color: transparent !important;
      }
    }
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
  }

  .react-calendar__month-view__weekdays__weekday:nth-of-type(1) { color: ${({ theme }) => theme.colors.red600}; }
  .react-calendar__month-view__weekdays__weekday:nth-of-type(7) { color: ${({ theme }) => theme.colors.blue600}; }

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

    &:hover { background-color: ${({ theme }) => theme.border}; }
  }

  .react-calendar__month-view__days__day:nth-of-type(7n) { color: ${({ theme }) => theme.colors.blue600}; }
  .react-calendar__month-view__days__day:nth-of-type(7n + 1) { color: ${({ theme }) => theme.colors.red600}; }

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

  /* Heatmap Colors */
  .color-scale-1 { background-color: ${({ theme }) => theme.colors.orange50} !important; color: ${({ theme }) => theme.colors.primary} !important; }
  .color-scale-2 { background-color: ${({ theme }) => theme.colors.orange100} !important; color: ${({ theme }) => theme.colors.orange900} !important; }
  .color-scale-3 { background-color: ${({ theme }) => theme.colors.orange300} !important; color: white !important; }
  .color-scale-4 { background-color: ${({ theme }) => theme.colors.primary} !important; color: white !important; }
`;

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
  strong { font-size: 18px; font-weight: 800; color: ${({ theme }) => theme.textMain}; }
  span { font-size: 11px; color: ${({ theme }) => theme.textSub}; }
`;

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

const GlowEffect = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

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

const StatLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSub};
  margin: 12px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.h2`
  font-family: 'Lato', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  line-height: 1;
`;

const IconContainer = styled.div`
  position: relative;
  z-index: 1;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 16px;
`;

const StatsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export function CalendarSection({
  selectedDate,
  setSelectedDate,
  activeStartDate,
  setActiveStartDate,
  tileClassName,
  currentStreak,
  totalPractice,
}: any) {
  const theme = useTheme();

  return (
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
        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate!)}
      />

      <StreakInfo>
        <StreakItem>
          <strong>{currentStreak} Days</strong>
          <span>Current Streak</span>
        </StreakItem>
        <motion.div
          animate={currentStreak > 0 ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <MdLocalFireDepartment size={32} color={currentStreak > 0 ? theme.colors.orange700 : theme.colors.grey400} />
        </motion.div>
        <StreakItem>
          <strong>{totalPractice} Times</strong>
          <span>Total Practice</span>
        </StreakItem>
      </StreakInfo>
    </CalendarCard>
  );
}

export function StatisticsColumn({ selectedDateFreq, totalSentences, totalScripts }: any) {
  return (
    <Column>
      <SectionTitle>Statistics</SectionTitle>
      <StatsStack>
        <StatCard
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }}
        >
          <GlowEffect animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
          <IconContainer>
            <StatIconWrapper bgColor="#FF6B6B" whileHover={{ rotate: [0, -10, 10, 0] }}>
              <MdPlayArrow size={20} />
            </StatIconWrapper>
          </IconContainer>
          <StatLabel>Selected Date Practice</StatLabel>
          <StatValue><AnimatedCounter value={selectedDateFreq} /></StatValue>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }}
        >
          <GlowEffect
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{ background: 'radial-gradient(circle, rgba(78, 205, 196, 0.3) 0%, transparent 100%)' }}
          />
          <IconContainer>
            <StatIconWrapper bgColor="#4ECDC4" whileHover={{ rotate: [0, -10, 10, 0] }}>
              <MdDescription size={20} />
            </StatIconWrapper>
          </IconContainer>
          <StatLabel>Total Sentences</StatLabel>
          <StatValue><AnimatedCounter value={totalSentences} /></StatValue>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }}
        >
          <GlowEffect
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ background: 'radial-gradient(circle, rgba(255, 230, 109, 0.3) 0%, transparent 100%)' }}
          />
          <IconContainer>
            <StatIconWrapper bgColor="#FFE66D" whileHover={{ rotate: [0, -10, 10, 0] }}>
              <MdBarChart size={20} />
            </StatIconWrapper>
          </IconContainer>
          <StatLabel>Total Scripts</StatLabel>
          <StatValue><AnimatedCounter value={totalScripts} /></StatValue>
        </StatCard>
      </StatsStack>
    </Column>
  );
}
