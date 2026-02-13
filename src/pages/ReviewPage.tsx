import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/supabaseClient';
import toast from 'react-hot-toast';
import { ReviewEmptyState } from '@/utils/ReviewEmptyState';
import {
  getDueReviews,
  getPriorityScore,
  getNextReviewTime,
  getTotalLearningCount,
  getReviewForecastStats,
  type FSRSReviewLog,
} from '@/services/fsrsService';

const Container = styled.div`
  padding: 20px 12px;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  line-height: 1.5;
`;

// --- 로그인 게이트 스타일 ---
const LoginGateWrapper = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
`;

const LoginGateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const LoginGateTitle = styled.h4`
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin: 0;
`;

const LoginGateText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  margin: 0 0 8px;
  line-height: 1.5;
`;

const LoginGateButton = styled.button`
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
// --- 로그인 게이트 스타일 여기까지 ---

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReviewCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.background};
    border-color: ${({ theme }) => theme.textSub};
  }
`;

const PriorityIndicator = styled.div<{ level: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ level, theme }) =>
    level > 5
      ? theme.colors.error
      : level > 2
        ? theme.colors.orange500
        : theme.colors.success};
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 4px;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 500;
`;

const ReviewButton = styled.button<{ urgent?: boolean }>`
  padding: 8px 16px;
  background: ${({ urgent, theme }) =>
    urgent ? theme.colors.error : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 100px; /* Pill shape */
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${({ urgent, theme }) =>
      urgent ? theme.colors.red600 : theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// --- 통계 카드 스타일 ---
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ urgent?: boolean; onClick?: any }>`
  padding: 16px;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  text-align: center;
  transition: all 0.2s;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};

  ${({ urgent, theme }) =>
    urgent &&
    `
    background: ${theme.colors.red50};
    border-color: ${theme.colors.error}40;
    color: ${theme.colors.error};
  `}

  &:hover {
    ${({ onClick, theme }) => onClick && `background-color: ${theme.border};`}
  }
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: inherit; /* Inherit color from parent (for urgent state) */
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSub};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin: 32px 0 16px;
`;

const ForecastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ForecastCard = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  text-align: center;
`;

const ForecastTime = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSub};
  margin-bottom: 4px;
`;

const ForecastCount = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
`;


interface ReviewItem extends FSRSReviewLog {
  priority: number;
  overdueDays: number;
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const { user, allScripts } = useAppStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    today: 0,
  });
  const [forecast, setForecast] = useState({
    '10m': 0,
    '1d': 0,
    '1w': 0,
    '1mo': 0,
  });
  const [nextReviewTime, setNextReviewTime] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchReviews = async () => {
    // 1. 복습할 목록, 전체 개수, 다음 예정 시간, 미래 예측 통계를 병렬로 가져옴
    const [dueData, totalCount, nextTime, forecastStats] = await Promise.all([
      getDueReviews(),
      getTotalLearningCount(),
      getNextReviewTime(),
      getReviewForecastStats(),
    ]);

    const sorted = dueData
      .map((item: FSRSReviewLog) => ({
        ...item,
        script_id: item.script_id, 
        priority: getPriorityScore(item),
        overdueDays: Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(item.next_review).getTime()) / 86400000,
          ),
        ),
      }))
      .sort((a, b) => b.priority - a.priority);

    setReviews(sorted.slice(0, 10));
    setNextReviewTime(nextTime);

    setStats({
      total: totalCount, // 전체 학습 중인 카드 수 (이제 0이 아님!)
      urgent: dueData.filter(
        (item: FSRSReviewLog) => getPriorityScore(item) > 3,
      ).length,
      today: dueData.filter(
        (item: FSRSReviewLog) =>
          new Date(item.next_review) < new Date(Date.now() + 86400000),
      ).length,
    });
    setForecast(forecastStats);
  };

  const handleQuickReview = (item: ReviewItem) => {
    window.location.href = `/talk/${item.script_id}?review=${item.id}&line=${item.line_index}`;
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
    }
  };

  if (!user) {
    return (
      <Container>
        <Header>
          <Title>Smart Review</Title>
          <Subtitle>
            Master your mistakes with spaced repetition. Review at the perfect
            time.
          </Subtitle>
        </Header>
        <LoginGateWrapper>
          <LoginGateIcon>🔒</LoginGateIcon>
          <LoginGateTitle>Unlock Your Smart Review</LoginGateTitle>
          <LoginGateText>
            Log in to track your learning progress and get a personalized review
            schedule.
          </LoginGateText>
          <LoginGateButton onClick={handleLogin}>
            Login to Get Started
          </LoginGateButton>
        </LoginGateWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Smart Review</Title>
        <Subtitle>
          Master your mistakes with spaced repetition. Review at the perfect
          time.
        </Subtitle>
      </Header>

      <StatsGrid>
        <StatCard urgent={stats.urgent > 0}>
          <StatValue>{stats.urgent}</StatValue>
          <StatLabel>Urgent</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{stats.today}</StatValue>
          <StatLabel>Due Today</StatLabel>
        </StatCard>

        <StatCard onClick={() => navigate('/history')}>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Reviews</StatLabel>
        </StatCard>
      </StatsGrid>

      <SectionTitle>Upcoming Reviews</SectionTitle>
      <ForecastGrid>
        <ForecastCard>
          <ForecastTime>~15 Mins</ForecastTime>
          <ForecastCount>{forecast['10m']}</ForecastCount>
        </ForecastCard>
        <ForecastCard>
          <ForecastTime>~24 Hours</ForecastTime>
          <ForecastCount>{forecast['1d']}</ForecastCount>
        </ForecastCard>
        <ForecastCard>
          <ForecastTime>~7 Days</ForecastTime>
          <ForecastCount>{forecast['1w']}</ForecastCount>
        </ForecastCard>
        <ForecastCard>
          <ForecastTime>~30 Days</ForecastTime>
          <ForecastCount>{forecast['1mo']}</ForecastCount>
        </ForecastCard>
      </ForecastGrid>

      <SectionTitle>Due Now</SectionTitle>

      {reviews.length === 0 ? (
        <ReviewEmptyState nextReviewTime={nextReviewTime} />
      ) : (
        <ReviewList>
          {reviews.map((item) => (
            <ReviewCard key={item.id}>
              <PriorityIndicator level={item.priority} />
              
              <CardContent>
                <CardTitle>
                  {allScripts.find((s) => s.id === item.script_id.toString())
                    ?.title ||
                    item.script_title ||
                    `Script #${item.script_id}`}
                </CardTitle>
                <CardMeta>
                  <span>{item.accuracy}% Acc</span>
                  <span>•</span>
                  <span>
                    {item.overdueDays > 0
                      ? `${item.overdueDays}d overdue`
                      : `Due today`}
                  </span>
                </CardMeta>
              </CardContent>

              <ReviewButton
                urgent={item.priority > 5}
                onClick={() => handleQuickReview(item)}
              >
                Review
              </ReviewButton>
            </ReviewCard>
          ))}
        </ReviewList>
      )}
    </Container>
  );
}
