import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import { useTTS } from '@/hooks/useTTS';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { PracticeLog, WeakSpot } from '@/utils/types';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Seo } from '@/components/common/Seo';
import {
  MdBarChart,
  MdVolumeUp,
  MdExpandMore,
  MdErrorOutline,
  MdMic,
  MdCheckCircle,
  MdSpeed,
} from 'react-icons/md';

const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.background};
  padding: 10px 20px;
  font-family: 'lato', sans-serif;
  padding-bottom: clamp(60px, 10vh, 100px);
  transition: background-color 0.3s ease;

  @media (max-height: 800px) {
    padding: 8px 14px;
    padding-bottom: 60px;
  }
`;

const Header = styled.header`
  margin-bottom: clamp(14px, 2.5vh, 32px);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 900;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSub};
  font-size: 15px;
  line-height: 1.5;
`;

const CardGrid = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin: 32px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 18px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 2px;
  }
`;

const ShowMoreButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background-color: ${({ theme }) => theme.colors.grey100};
  border: none;
  border-radius: 16px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.textMain};
  }
`;

const WordCardContainer = styled(motion.div)<{
  isExpanded: boolean;
  isSolved: boolean;
}>`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 16px;
  border: none;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  ${({ isSolved, theme }) =>
    isSolved &&
    `
    background-color: ${theme.colors.green50};
  `}
`;

const CardMain = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  flex-shrink: 0;

  ${({ rank, theme }) => {
    if (rank === 1)
      return `background-color: #FFF7D6; color: #D97706; border: none;`;
    if (rank === 2)
      return `background-color: #F3F4F6; color: #6B7280; border: none;`;
    if (rank === 3)
      return `background-color: #FFF1E6; color: #C2410C; border: none;`;
    return `background-color: ${theme.background}; color: ${theme.textSub}; border: none;`;
  }}
`;

const WordInfo = styled.div`
  flex: 1;
  margin-left: 16px;
  min-width: 0;
`;

const WordText = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SolvedIcon = styled(MdCheckCircle)`
  margin-left: 4px;
  color: ${({ theme }) => theme.colors.success};
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MissCount = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 700;
`;

const FrequencyBarContainer = styled.div`
  width: 100%;
  max-width: 140px;
  height: 6px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
`;

const FrequencyBar = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background-color: ${({ percent, theme }) =>
    percent > 70 ? theme.colors.error : theme.colors.accent};
  border-radius: 3px;
  transition: width 0.5s ease-out;
`;

const ExpandIconWrapper = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s;
  color: ${({ theme }) => theme.textSub};
`;

const expandAnimation = keyframes`
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 500px; }
`;

const ExpandedContent = styled.div`
  border: none;
  padding: 16px;
  background-color: ${({ theme }) => theme.background};
  animation: ${expandAnimation} 0.3s ease-out forwards;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.textSub};
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const ExampleItem = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.textMain};
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: ${({ theme }) => theme.colors.error};
    font-weight: 800;
  }
`;

const BulletPoint = styled.span`
  font-size: 12px;
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.error};
`;

const PracticeArea = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  padding: 12px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

const TTSButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PracticeStatus = styled.p<{
  status: 'idle' | 'listening' | 'evaluating' | 'success' | 'fail';
}>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ status, theme }) =>
    status === 'listening'
      ? theme.colors.primary
      : status === 'success'
        ? theme.colors.success
        : status === 'fail'
          ? theme.colors.error
          : theme.textSub};
`;

const TranscriptText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.textSub};
`;

const MicButton = styled.button<{ isListening: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  background-color: ${({ isListening, theme }) =>
    isListening ? theme.colors.error : theme.colors.primary};
  color: ${({ isListening, theme }) =>
    isListening ? '#ffffff' : theme.colors.onPrimary};

  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
`;

const TTSButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  color: ${({ theme }) => theme.textSub};
  background-color: ${({ theme }) => theme.background};
  font-size: 12px;
  font-weight: 700;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.borderSubtle};
    color: ${({ theme }) => theme.textMain};
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
`;

const EmptyIconBox = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.cardBg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.textSub};
  margin-bottom: 24px;
`;

const EmptyTitleText = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 8px;
`;

const EmptySubText = styled.p`
  color: ${({ theme }) => theme.textSub};
`;

const ActionButton = styled.button`
  margin-top: 24px;
  padding: 14px 28px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: 14px;
  font-weight: 800;
  font-size: 16px;
  border: none;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

type WordStats = {
  word: string;
  count: number;
  examples: string[];
};

function WordCardItem({
  item,
  index,
  maxCount,
}: {
  item: WordStats;
  index: number;
  maxCount: number;
}) {
  const { t } = useTranslation();
  const { speak } = useTTS();
  const { transcript, isListening, startListening, stopListening } =
    useSpeechRecognition();

  const [isExpanded, setIsExpanded] = useState(false);
  const [practiceStatus, setPracticeStatus] = useState<
    'idle' | 'listening' | 'success' | 'fail'
  >('idle');
  const [isSolved, setIsSolved] = useState(false);

  const percent = Math.min((item.count / maxCount) * 100, 100);

  useEffect(() => {
    if (transcript && isListening) {
      const cleanInput = transcript
        .toLowerCase()
        .trim()
        .replace(/[.,?!]+$/, '');
      const target = item.word.toLowerCase().trim();

      if (cleanInput.includes(target)) {
        setPracticeStatus('success');
        setIsSolved(true);
        stopListening();
      }
    }
  }, [transcript, isListening, item.word, stopListening]);

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isListening) {
      stopListening();
      setPracticeStatus('idle');
    } else {
      setPracticeStatus('listening');
      startListening();
    }
  };

  const handleSlowTTS = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(item.word, null, undefined, 0.5);
  };

  return (
    <WordCardContainer
      isExpanded={isExpanded}
      isSolved={isSolved}
      onClick={() => setIsExpanded(!isExpanded)}
      whileTap={{ scale: 0.98 }}
    >
      <CardMain>
        <CardLeftWrapper>
          <RankBadge rank={index + 1}>{index + 1}</RankBadge>

          <WordInfo>
            <WordText>
              {item.word}
              {isSolved && <SolvedIcon size={20} />}
            </WordText>

            <StatRow>
              <FrequencyBarContainer>
                <FrequencyBar percent={percent} />
              </FrequencyBarContainer>
              <MissCount>{t('mistakes.misses', { count: item.count })}</MissCount>
            </StatRow>
          </WordInfo>
        </CardLeftWrapper>

        <ExpandIconWrapper isExpanded={isExpanded}>
          <MdExpandMore size={24} />
        </ExpandIconWrapper>
      </CardMain>

      {isExpanded && (
        <ExpandedContent onClick={(e) => e.stopPropagation()}>
          <SectionHeader>
            <MdMic size={16} /> {t('mistakes.pronunciationClinic')}
          </SectionHeader>
          <PracticeArea>
            <TTSButtonGroup>
              <TTSButton
                onClick={(e) => {
                  e.stopPropagation();
                  speak(item.word);
                }}
              >
                <MdVolumeUp size={16} /> {t('mistakes.normal')}
              </TTSButton>
              <TTSButton onClick={handleSlowTTS}>
                <MdSpeed size={16} /> {t('mistakes.slow')}
              </TTSButton>
            </TTSButtonGroup>

            <MicButton isListening={isListening} onClick={handleMicClick}>
              {isListening ? <MdBarChart size={24} /> : <MdMic size={24} />}
            </MicButton>

            <PracticeStatus status={practiceStatus}>
              {practiceStatus === 'idle' && t('mistakes.tapMicPrompt')}
              {practiceStatus === 'listening' && t('mistakes.listeningPrompt')}
              {practiceStatus === 'success' && t('mistakes.successPrompt')}
              {practiceStatus === 'fail' && t('mistakes.failPrompt')}
            </PracticeStatus>

            {transcript && isListening && (
              <TranscriptText>{t('mistakes.youSaid', { text: transcript })}</TranscriptText>
            )}
          </PracticeArea>

          {item.examples.length > 0 && (
            <>
              <SectionHeader>
                <MdErrorOutline size={16} /> {t('mistakes.contextExamples')}
              </SectionHeader>
              {item.examples.map((ex, i) => (
                <ExampleItem key={i}>
                  <BulletPoint>●</BulletPoint>
                  {ex.split(new RegExp(`\\b(${item.word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})\\b`, 'gi')).map((part, index) =>
                    part.toLowerCase() === item.word.toLowerCase() ? (
                      <strong key={index}>{part}</strong>
                    ) : (
                      <span key={index}>{part}</span>
                    )
                  )}
                </ExampleItem>
              ))}
            </>
          )}
        </ExpandedContent>
      )}
    </WordCardContainer>
  );
}

export function MistakesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const practiceLogs = useAppStore((state) => state.practiceLogs);
  const language = useAppStore((state) => state.language);

  const wordStatsList = useMemo(() => {
    const stats: Record<string, WordStats> = {};

    practiceLogs.forEach((log: PracticeLog) => {
      log.errors.forEach((error: WeakSpot) => {
        if (!error.original) return;

        const word = error.original
          .toLowerCase()
          .trim()
          .replace(/[.,?!]+$/, '');
        if (!word) return;

        if (!stats[word]) {
          stats[word] = { word, count: 0, examples: [] };
        }

        stats[word].count += 1;

        if (
          error.lineContent &&
          !stats[word].examples.includes(error.lineContent) &&
          stats[word].examples.length < 3
        ) {
          stats[word].examples.push(error.lineContent);
        }
      });
    });

    return Object.values(stats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [practiceLogs]);

  const maxCount = wordStatsList.length > 0 ? wordStatsList[0].count : 1;

  const seoProps =
    language === 'en'
      ? {
          title: 'Practice Your Mistakes',
          description:
            'Review and fix your pronunciation mistakes. Practice the words you struggle with most.',
        }
      : {
          title: '실수 분석 및 연습',
          description:
            '자주 틀리는 발음을 분석하고 어려운 단어를 집중적으로 연습하세요.',
        };

  if (wordStatsList.length === 0) {
    return (
      <PageContainer>
        <Seo {...seoProps} />
        <Header>
          <Title>{t('mistakes.pageTitle')}</Title>
          <Subtitle>
            {t('mistakes.pageSubtitleEmpty')}
          </Subtitle>
        </Header>
        <EmptyStateContainer>
          <EmptyIconBox>
            <MdBarChart size={40} />
          </EmptyIconBox>
          <EmptyTitleText>{t('mistakes.noMistakesYet')}</EmptyTitleText>
          <EmptySubText>
            {t('mistakes.noMistakesDesc')}
          </EmptySubText>
          <ActionButton onClick={() => navigate('/scripts')}>
            {t('mistakes.startPracticing')}
          </ActionButton>
        </EmptyStateContainer>
      </PageContainer>
    );
  }

  const topMistakes = wordStatsList.slice(0, 3);
  const otherMistakes = wordStatsList.slice(3);
  const [showAll, setShowAll] = useState(false);

  return (
    <PageContainer>
      <Seo {...seoProps} />
      <Header>
        <Title>{t('mistakes.pageTitle')}</Title>
        <Subtitle>
          {t('mistakes.pageSubtitle')}
        </Subtitle>
      </Header>

      {topMistakes.length > 0 && (
        <>
          <SectionTitle>{t('mistakes.topFocus')}</SectionTitle>
          <CardGrid
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {topMistakes.map((item, index) => (
              <motion.div
                layout
                key={item.word}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <WordCardItem
                  item={item}
                  index={index}
                  maxCount={maxCount}
                />
              </motion.div>
            ))}
          </CardGrid>
        </>
      )}

      {otherMistakes.length > 0 && (
        <>
          <SectionTitle>{t('mistakes.otherMisses', { count: otherMistakes.length })}</SectionTitle>
          <CardGrid>
            {otherMistakes
              .slice(0, showAll ? undefined : 7)
              .map((item, index) => (
                <WordCardItem
                  key={item.word}
                  item={item}
                  index={index + 3}
                  maxCount={maxCount}
                />
              ))}

            {!showAll && otherMistakes.length > 7 && (
              <ShowMoreButton onClick={() => setShowAll(true)}>
                <MdExpandMore size={20} />
                {t('mistakes.showMore', { count: otherMistakes.length - 7 })}
              </ShowMoreButton>
            )}
          </CardGrid>
        </>
      )}
    </PageContainer>
  );
}
