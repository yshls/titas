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
  padding: 14px 16px;
  margin-bottom: 24px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;

  ${({ $urgent, theme }) =>
    $urgent
      ? `background-color: ${theme.colors.primaryLight};`
      : `background-color: ${theme.cardBg};`}

  &:hover {
    background-color: ${({ $urgent, theme }) =>
      $urgent ? theme.colors.brand100 : theme.background};
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
    $urgent ? theme.colors.onPrimary : theme.textSub};
`;

const TextGroup = styled.div`
  flex: 1;
  min-width: 0;
`;

/*
 * 강조 상태의 배경(primaryLight)은 테마와 무관하게 밝은 색이므로,
 * 그 위 글자에 다크 모드용 밝은 textMain을 쓰면 대비가 1.35까지 떨어져 읽을 수 없다.
 * 밝은 배경 위에서는 글자색도 고정한다.
 */
const Title = styled.p<{ $urgent: boolean }>`
  font-size: 15px;
  /* 기본 줄바꿈은 한글을 아무 글자에서나 끊어 "있어/요"처럼 한 글자가 남는다. */
  word-break: keep-all;
  /* 개수를 900으로 강조하려면 본문은 그보다 가벼워야 차이가 보인다. */
  font-weight: 600;
  color: ${({ $urgent, theme }) =>
    $urgent ? theme.colors.grey900 : theme.textMain};
  margin: 0 0 2px;

  /*
   * 옅은 브랜드 배경 위에서는 그린 계열 글자도 대비가 부족하므로,
   * 색 대신 굵기로만 개수를 강조한다.
   */
  b {
    font-weight: 900;
  }
`;

const Subtitle = styled.p<{ $urgent: boolean }>`
  font-size: 13px;
  word-break: keep-all;
  color: ${({ $urgent, theme }) =>
    $urgent ? theme.colors.grey700 : theme.textSub};
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
            <Title $urgent>
              <Trans
                i18nKey="reviewPrompt.dueTitle"
                values={{ count: dueCount }}
                components={{ highlight: <b /> }}
              />
            </Title>
            <Subtitle $urgent>{t('reviewPrompt.dueSubtitle')}</Subtitle>
          </>
        ) : (
          <>
            <Title $urgent={false}>{t('reviewPrompt.caughtUpTitle')}</Title>
            <Subtitle $urgent={false}>
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
