import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MdCelebration, MdHourglassEmpty } from 'react-icons/md';
import { getRelativeTime, getNaturalTime } from '@/utils/timeUtils';

// 이 컴포넌트가 예전엔 색을 전부 고정값으로 써서 다크모드에서도 항상
// 밝은 회색 박스로만 떠 있었다. 테마 토큰으로 바꿔 다크모드에서도 맞게 보이게 한다.
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 16px;
  margin: 20px 0;
`;

// 축하하는 상태라 브랜드색보다 success(초록)가 의미상 더 맞는다.
const IconWrapper = styled(motion.div)`
  display: flex;
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.textSub};
  max-width: 400px;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const TimeInfo = styled.div`
  margin-top: 8px;
  padding: 16px 24px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  color: ${({ theme }) => theme.textMain};
  font-weight: 600;
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const SubTime = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 400;
`;

const NextReviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

interface ReviewEmptyStateProps {
  nextReviewTime?: string | null;
}

export const ReviewEmptyState = ({ nextReviewTime }: ReviewEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <Container>
      <IconWrapper
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <MdCelebration size={44} />
      </IconWrapper>

      <Title>{t('review.allCaughtUpTitle')}</Title>

      <Description>
        {t('review.allCaughtUpDesc')}
      </Description>

      {nextReviewTime && (
        <TimeInfo>
          <NextReviewRow>
            <MdHourglassEmpty size={16} aria-hidden="true" />
            <span>{t('review.nextReviewPrefix', { time: getRelativeTime(nextReviewTime) })}</span>
          </NextReviewRow>
          <SubTime>({getNaturalTime(nextReviewTime)})</SubTime>
        </TimeInfo>
      )}
    </Container>
  );
};
