import React, { useMemo, useState, useEffect } from 'react';
import { useAppStore, type AppState } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import { useTTS } from '@/utils/useTTS';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';
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

// --- 타입 정의 확장 ---
interface ExtendedWeakSpot extends WeakSpot {
  lineContent?: string;
}

// --- 스타일 컴포넌트 ---

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  padding: 10px 20px;
  font-family: 'lato', sans-serif;
  padding-bottom: 100px;
  transition: background-color 0.3s ease;
`;

const Header = styled.header`
  margin-bottom: 32px;
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

const CardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

const WordCardContainer = styled.div<{
  isExpanded: boolean;
  isSolved: boolean;
}>`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 16px;
  border: 2px solid
    ${({ theme, isExpanded, isSolved }) =>
      isSolved
        ? theme.colors.success
        : isExpanded
        ? theme.colors.primary
        : 'transparent'};
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  ${({ isSolved, theme }) =>
    isSolved &&
    `
    background-color: ${theme.colors.success}08;
  `}

  &:hover {
    border-color: ${({ theme, isSolved }) =>
      isSolved ? theme.colors.success : theme.colors.primary};
    transform: translateY(-2px);
  }
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
      return `background-color: #FFF7D6; color: #D97706; border: 1px solid #FEF3C7;`;
    if (rank === 2)
      return `background-color: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB;`;
    if (rank === 3)
      return `background-color: #FFF1E6; color: #C2410C; border: 1px solid #FFEDD5;`;
    return `background-color: ${theme.background}; color: ${theme.textSub}; border: 1px solid ${theme.border};`;
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
    percent > 70 ? theme.colors.error : theme.colors.primary};
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
  to { opacity: 1; max-height: 600px; }
`;

const ExpandedContent = styled.div`
  background-color: ${({ theme }) => theme.background};
  padding: 0 20px 20px 20px;
  border-top: 1px solid ${({ theme }) => theme.border};
  animation: ${expandAnimation} 0.3s ease-in-out forwards;
`;

const SectionHeader = styled.p`
  font-size: 11px;
  font-weight: 800;
  color: ${({ theme }) => theme.textSub};
  margin: 20px 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ExampleItem = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
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
  border: 1px solid ${({ theme }) => theme.border};
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
  status: 'idle' | 'listening' | 'success' | 'fail';
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
  color: white;

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
    background-color: ${({ theme }) => theme.colors.primary}15;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIconBox = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
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
  color: white;
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

// --- 개별 단어 카드 컴포넌트 ---

function WordCardItem({
  item,
  index,
  maxCount,
}: {
  item: WordStats;
  index: number;
  maxCount: number;
}) {
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
    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.rate = 0.5;
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <WordCardContainer
      isExpanded={isExpanded}
      isSolved={isSolved}
      onClick={() => setIsExpanded(!isExpanded)}
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
              <MissCount>{item.count} misses</MissCount>
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
            <MdMic size={16} /> Pronunciation Clinic
          </SectionHeader>
          <PracticeArea>
            <TTSButtonGroup>
              <TTSButton
                onClick={(e) => {
                  e.stopPropagation();
                  speak(item.word);
                }}
              >
                <MdVolumeUp size={16} /> Normal
              </TTSButton>
              <TTSButton onClick={handleSlowTTS}>
                <MdSpeed size={16} /> Slow (0.5x)
              </TTSButton>
            </TTSButtonGroup>

            <MicButton isListening={isListening} onClick={handleMicClick}>
              {isListening ? <MdBarChart size={24} /> : <MdMic size={24} />}
            </MicButton>

            <PracticeStatus status={practiceStatus}>
              {practiceStatus === 'idle' && 'Tap mic & say the word!'}
              {practiceStatus === 'listening' && 'Listening... Say it!'}
              {practiceStatus === 'success' && 'Perfect! Solved 🎉'}
              {practiceStatus === 'fail' && 'Try again.'}
            </PracticeStatus>

            {transcript && isListening && (
              <TranscriptText>You said: "{transcript}"</TranscriptText>
            )}
          </PracticeArea>

          {item.examples.length > 0 && (
            <>
              <SectionHeader>
                <MdErrorOutline size={16} /> Context Examples
              </SectionHeader>
              {item.examples.map((ex, i) => (
                <ExampleItem key={i}>
                  <BulletPoint>●</BulletPoint>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: ex.replace(
                        new RegExp(`\\b${item.word}\\b`, 'gi'),
                        (match) => `<strong>${match}</strong>`,
                      ),
                    }}
                  />
                </ExampleItem>
              ))}
            </>
          )}
        </ExpandedContent>
      )}
    </WordCardContainer>
  );
}

// --- 메인 페이지 컴포넌트 ---

export function ReviewPage() {
  const navigate = useNavigate();
  const practiceLogs = useAppStore((state) => state.practiceLogs);
  const language = useAppStore((state) => state.language);

  const wordStatsList = useMemo(() => {
    const stats: Record<string, WordStats> = {};

    practiceLogs.forEach((log: PracticeLog) => {
      // ExtendedWeakSpot 타입을 사용하여 lineContent 접근 허용
      log.errors.forEach((error: ExtendedWeakSpot) => {
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
          title: 'Review Your Weak Spots',
          description:
            'Analyze your pronunciation mistakes and practice the words you struggle with to improve your English speaking.',
        }
      : {
          title: '약점 분석 및 복습',
          description:
            '자주 틀리는 발음을 분석하고 어려운 단어를 집중적으로 연습하여 영어 스피킹 실력을 향상시키세요.',
        };

  if (wordStatsList.length === 0) {
    return (
      <PageContainer>
        <Seo {...seoProps} />
        <Header>
          <Title>Review</Title>
          <Subtitle>Your analytics will appear here.</Subtitle>
        </Header>
        <EmptyStateContainer>
          <EmptyIconBox>
            <MdBarChart size={40} />
          </EmptyIconBox>
          <EmptyTitleText>No Data Yet</EmptyTitleText>
          <EmptySubText>
            Complete practice sessions to track your mistakes.
          </EmptySubText>
          <ActionButton onClick={() => navigate('/scripts')}>
            Start Practice
          </ActionButton>
        </EmptyStateContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Seo {...seoProps} />
      <Header>
        <Title>Weak Spots Analysis</Title>
        <Subtitle>
          Fix your pronunciation instantly.
          <br />
          Tap a card to practice.
        </Subtitle>
      </Header>

      <CardGrid>
        {wordStatsList.map((item, index) => (
          <WordCardItem
            key={item.word}
            item={item}
            index={index}
            maxCount={maxCount}
          />
        ))}
      </CardGrid>
    </PageContainer>
  );
}

