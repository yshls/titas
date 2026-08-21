import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { MdBolt, MdCheckCircleOutline, MdChevronRight } from 'react-icons/md';
import { useReviewSummary } from '@/hooks/pageSpecific/useReviewSummary';
import { getRelativeTime } from '@/utils/timeUtils';

const Card = styled(motion.button)<{ $urgent: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  margin-bottom: 24px;
  border-radius: 20px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background-color 0.2s;

  ${({ $urgent, theme }) =>
    $urgent
      ? `
    background-color: ${theme.colors.primaryLight};
    border: 1px solid ${theme.colors.orange200};
  `
      : `
    background-color: ${theme.cardBg};
    border: 1px solid ${theme.border};
  `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const IconBadge = styled.div<{ $urgent: boolean }>`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $urgent, theme }) =>
    $urgent ? theme.colors.primary : theme.background};
  color: ${({ $urgent, theme }) =>
    $urgent ? '#ffffff' : theme.textSub};
`;

const TextGroup = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.p`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin: 0 0 2px;

  b {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSub};
  margin: 0;
`;

const Chevron = styled(MdChevronRight)`
  flex-shrink: 0;
  color: ${({ theme }) => theme.textDisabled};
`;

export function ReviewPrompt() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoading, dueCount, totalCount, nextReviewTime } = useReviewSummary();

  // 로딩 중이거나, 아직 복습할 카드를 하나도 만들지 않았다면 안내할 것이 없다.
  if (isLoading || totalCount === 0) {
    return null;
  }

  const hasDue = dueCount > 0;

  return (
    <Card
      $urgent={hasDue}
      onClick={() => navigate('/review')}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      aria-label={t('reviewPrompt.goToReview')}
    >
      <IconBadge $urgent={hasDue}>
        {hasDue ? <MdBolt size={24} /> : <MdCheckCircleOutline size={24} />}
      </IconBadge>

      <TextGroup>
        {hasDue ? (
          <>
            <Title>
              <Trans
                i18nKey="reviewPrompt.dueTitle"
                values={{ count: dueCount }}
                components={{ highlight: <b /> }}
              />
            </Title>
            <Subtitle>{t('reviewPrompt.dueSubtitle')}</Subtitle>
          </>
        ) : (
          <>
            <Title>{t('reviewPrompt.caughtUpTitle')}</Title>
            <Subtitle>
              {nextReviewTime
                ? t('reviewPrompt.nextReview', {
                    time: getRelativeTime(nextReviewTime),
                  })
                : t('reviewPrompt.caughtUpSubtitle')}
            </Subtitle>
          </>
        )}
      </TextGroup>

      <Chevron size={22} />
    </Card>
  );
}
