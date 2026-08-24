import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { MdLocalFireDepartment, MdPlayArrow, MdDescription, MdBarChart } from 'react-icons/md';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { useAppStore } from '@/store/appStore';

const CalendarCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 24px;
  padding: clamp(14px, 2.5vh, 24px) 14px;
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

  .react-calendar__navigation { margin-bottom: clamp(10px, 2vh, 24px); }
  .react-calendar__navigation button {
    font-size: 18px;
    font-weight: 800;
    color: ${({ theme }) => theme.textMain};
    background-color: transparent !important;
    border: none;
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
    background: ${({ theme }) => theme.colors.brand500} !important;
    color: ${({ theme }) => theme.colors.onPrimary} !important;
  }

  /* Heatmap Colors (Green Grass Scale) */
  .color-scale-1 { background-color: ${({ theme }) => theme.colors.green100} !important; color: ${({ theme }) => theme.colors.green700} !important; }
  .color-scale-2 { background-color: ${({ theme }) => theme.colors.green200} !important; color: ${({ theme }) => theme.colors.green800} !important; }
  .color-scale-3 { background-color: ${({ theme }) => theme.colors.green300} !important; color: ${({ theme }) => theme.colors.green900} !important; }
  .color-scale-4 { background-color: ${({ theme }) => theme.colors.green500} !important; color: ${({ theme }) => theme.colors.onSuccess} !important; }
`;

const StreakInfo = styled.div`
  width: 100%;
  max-width: 360px;
  margin-top: clamp(10px, 2vh, 24px);
  padding-top: clamp(10px, 2vh, 24px);
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
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIconWrapper = styled(motion.div)<{ primaryColor: string }>`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 14px;
  background-color: ${({ primaryColor }) => primaryColor}20; /* ~12% opacity hex */
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ primaryColor }) => primaryColor};
`;

const StatTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StatLabel = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.textSub};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  margin-bottom: 2px;
`;

const StatValue = styled.h2`
  font-family: 'Lato', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  line-height: 1;
  margin: 0;
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
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);

  return (
    <CalendarCard>
      <Calendar
        locale={language === 'ko' ? 'ko-KR' : 'en-US'}
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
          <strong>{t('dashboard.streakDays', { count: currentStreak })}</strong>
          <span>{t('dashboard.currentStreak')}</span>
        </StreakItem>
        <motion.div
          animate={currentStreak > 0 ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <MdLocalFireDepartment size={32} color={currentStreak > 0 ? theme.colors.accent : theme.colors.grey400} />
        </motion.div>
        <StreakItem>
          <strong>{t('dashboard.practiceTimes', { count: totalPractice })}</strong>
          <span>{t('dashboard.totalPractice')}</span>
        </StreakItem>
      </StreakInfo>
    </CalendarCard>
  );
}

export function StatisticsColumn({ selectedDateFreq, totalSentences, totalScripts }: any) {
  const { t } = useTranslation();

  return (
    <Column>
      <SectionTitle>{t('dashboard.statisticsTitle')}</SectionTitle>
      <StatsStack>
        <StatCard
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
        >
          <StatIconWrapper primaryColor="#FF6B6B" whileHover={{ rotate: [0, -10, 10, 0] }}>
            <MdPlayArrow size={26} />
          </StatIconWrapper>
          <StatTextContainer>
            <StatLabel>{t('dashboard.selectedDatePractice')}</StatLabel>
            <StatValue><AnimatedCounter value={selectedDateFreq} /></StatValue>
          </StatTextContainer>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
        >
          <StatIconWrapper primaryColor="#4ECDC4" whileHover={{ rotate: [0, -10, 10, 0] }}>
            <MdDescription size={22} />
          </StatIconWrapper>
          <StatTextContainer>
            <StatLabel>{t('dashboard.totalSentences')}</StatLabel>
            <StatValue><AnimatedCounter value={totalSentences} /></StatValue>
          </StatTextContainer>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
        >
          <StatIconWrapper primaryColor="#FFE66D" whileHover={{ rotate: [0, -10, 10, 0] }}>
            <MdBarChart size={24} />
          </StatIconWrapper>
          <StatTextContainer>
            <StatLabel>{t('dashboard.totalScripts')}</StatLabel>
            <StatValue><AnimatedCounter value={totalScripts} /></StatValue>
          </StatTextContainer>
        </StatCard>
      </StatsStack>
    </Column>
  );
}
