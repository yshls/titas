import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useFSRSRepetition } from '@/hooks/useFSRSRepetition';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/supabaseClient';
import toast from 'react-hot-toast';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ urgent?: boolean }>`
  padding: 16px;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  text-align: center;
  transition: all 0.2s;

  ${({ urgent, theme }) =>
    urgent &&
    `
    border-color: ${theme.colors.error};
    background: ${theme.colors.red50};
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSub};
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReviewCard = styled.div<{ priority: number }>`
  padding: 16px;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-left: 4px solid
    ${({ priority, theme }) =>
      priority > 5
        ? theme.colors.error
        : priority > 2
          ? theme.colors.orange500
          : theme.colors.success};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 6px;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 500;
`;

const CardPriority = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const PriorityValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.orange500};
  line-height: 1;
  margin-bottom: 2px;
`;

const PriorityLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.background};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ReviewButton = styled.button<{ urgent?: boolean }>`
  width: 100%;
  padding: 10px 16px;
  background: ${({ urgent, theme }) =>
    urgent ? theme.colors.error : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ urgent, theme }) =>
      urgent ? theme.colors.red600 : theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoggedInEmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const LoggedInEmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const LoggedInEmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 8px;
`;

const LoggedInEmptyText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  line-height: 1.6;
`;

interface ReviewItem {
  id: string;
  script_id: string;
  script_title?: string;
  line_index: number;
  accuracy: number;
  retrievability: number;
  scheduled_days: number;
  next_review: string;
  priority: number;
  overdueDays: number;
}

export default function ReviewPage() {
  const user = useAppStore((state) => state.user);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    today: 0,
  });
  const { getDueReviews, getPriorityScore } = useFSRSRepetition();

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchReviews = async () => {
    const data = await getDueReviews();
    const sorted = data
      .map((item: any) => ({
        ...item,
        script_id: String(item.script_id),
        priority: getPriorityScore(item),
        overdueDays: Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(item.next_review).getTime()) / 86400000,
          ),
        ),
      }))
      .sort((a: ReviewItem, b: ReviewItem) => b.priority - a.priority);

    setReviews(sorted.slice(0, 10));

    setStats({
      total: data.length,
      urgent: data.filter((item: any) => getPriorityScore(item) > 3).length,
      today: data.filter(
        (item: any) =>
          new Date(item.next_review) < new Date(Date.now() + 86400000),
      ).length,
    });
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

        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Reviews</StatLabel>
        </StatCard>
      </StatsGrid>

      {reviews.length === 0 ? (
        <LoggedInEmptyState>
          <LoggedInEmptyIcon>🎉</LoggedInEmptyIcon>
          <LoggedInEmptyTitle>All caught up!</LoggedInEmptyTitle>
          <LoggedInEmptyText>
            No reviews scheduled right now.
            <br />
            Keep practicing to build your review queue.
          </LoggedInEmptyText>
        </LoggedInEmptyState>
      ) : (
        <ReviewList>
          {reviews.map((item) => (
            <ReviewCard key={item.id} priority={item.priority}>
              <CardHeader>
                <CardInfo>
                  <CardTitle>
                    {item.script_title || `Script #${item.script_id}`}
                  </CardTitle>
                  <CardMeta>
                    <MetaItem>{item.accuracy}% accuracy</MetaItem>
                    <MetaItem>
                      {item.overdueDays > 0
                        ? `⏰ ${item.overdueDays}d overdue`
                        : `📅 in ${item.scheduled_days}d`}
                    </MetaItem>
                  </CardMeta>
                </CardInfo>

                <CardPriority>
                  <PriorityValue>{Math.round(item.priority)}</PriorityValue>
                  <PriorityLabel>priority</PriorityLabel>
                </CardPriority>
              </CardHeader>

              <ProgressBar>
                <ProgressFill progress={item.retrievability * 100} />
              </ProgressBar>

              <ReviewButton
                urgent={item.priority > 5}
                onClick={() => handleQuickReview(item)}
              >
                {item.priority > 5 ? '🔥 Review Now' : 'Start Review'}
              </ReviewButton>
            </ReviewCard>
          ))}
        </ReviewList>
      )}
    </Container>
  );
}
