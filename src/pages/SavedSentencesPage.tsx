import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MdBookmarkBorder,
  MdVolumeUp,
  MdDelete,
  MdSpeed,
  MdRepeat,
} from 'react-icons/md';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';
import { useSavedSentences } from '@/hooks/pageSpecific/useSavedSentences';
import { useTTS, DEFAULT_RATE, RATE_STEPS } from '@/utils/useTTS';

const REPEAT_STEPS = [1, 2, 3] as const;

const PageContainer = styled.div`
  padding: clamp(10px, 2vh, 14px) 12px clamp(20px, 4vh, 40px);
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.background};
`;

const Header = styled.header`
  margin-bottom: clamp(12px, 2vh, 20px);
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 900;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Card = styled(motion.div)`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 14px;
  padding: 14px;
`;

const SentenceText = styled.p`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ theme }) => theme.textMain};
  margin: 0 0 6px;
  word-break: keep-all;
`;

const SourceText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.textSub};
  margin: 0 0 10px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ControlButton = styled.button<{ $active?: boolean; $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.background};
  color: ${({ $active, $danger, theme }) => {
    if ($danger) return theme.colors.error;
    return $active ? theme.colors.onPrimary : theme.textSub;
  }};

  &:hover {
    background-color: ${({ $active, $danger, theme }) => {
      if ($danger) return theme.colors.red50;
      return $active ? theme.colors.primaryHover : theme.border;
    }};
  }
`;

const SpeakButton = styled(ControlButton)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  gap: 8px;
`;

const EmptyIcon = styled.div`
  display: flex;
  color: ${({ theme }) => theme.textDisabled};
  margin-bottom: 4px;
`;

const EmptyTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin: 0;
`;

const EmptyDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  margin: 0;
  max-width: 320px;
  line-height: 1.6;
  word-break: keep-all;
`;

export function SavedSentencesPage() {
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const { sentences, isLoading, remove } = useSavedSentences();
  const { speak } = useTTS();

  // 저장된 속도를 기본값으로 두되, 이 화면에서 임시로 바꿔 들어볼 수 있게 한다.
  const [rates, setRates] = useState<Record<string, number>>({});
  const [repeats, setRepeats] = useState<Record<string, number>>({});
  const repeatTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (repeatTimerRef.current) clearTimeout(repeatTimerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const rateOf = (id: string, saved?: number | null) =>
    rates[id] ?? saved ?? DEFAULT_RATE;

  const cycleRate = (id: string, saved?: number | null) => {
    const current = rateOf(id, saved);
    const idx = RATE_STEPS.findIndex((r) => r === current);
    setRates((prev) => ({
      ...prev,
      [id]: RATE_STEPS[(idx + 1) % RATE_STEPS.length],
    }));
  };

  const cycleRepeat = (id: string) => {
    setRepeats((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 1) % REPEAT_STEPS[REPEAT_STEPS.length - 1]) + 1,
    }));
  };

  const speakRepeatedly = (text: string, rate: number, times: number) => {
    if (repeatTimerRef.current) clearTimeout(repeatTimerRef.current);
    let done = 0;
    const runOnce = () => {
      speak(
        text,
        null,
        () => {
          done += 1;
          if (done < times) {
            repeatTimerRef.current = window.setTimeout(runOnce, 350);
          }
        },
        rate,
      );
    };
    runOnce();
  };

  const seoProps =
    language === 'en'
      ? {
          title: 'Saved Sentences',
          description:
            'Practice the English sentences you saved, at your own speed and repeat count.',
        }
      : {
          title: '저장한 문장',
          description:
            '따로 담아둔 영어 문장을 원하는 속도와 반복 횟수로 연습하세요.',
        };

  return (
    <PageContainer>
      <Seo {...seoProps} />

      <Header>
        <PageTitle>{t('saved.pageTitle')}</PageTitle>
        <Subtitle>{t('saved.pageSubtitle')}</Subtitle>
      </Header>

      {isLoading ? (
        <EmptyState>
          <EmptyDesc>{t('common.action.loading')}</EmptyDesc>
        </EmptyState>
      ) : sentences.length === 0 ? (
        <EmptyState>
          <EmptyIcon aria-hidden="true">
            <MdBookmarkBorder size={44} />
          </EmptyIcon>
          <EmptyTitle>{t('saved.emptyTitle')}</EmptyTitle>
          <EmptyDesc>{t('saved.emptyDesc')}</EmptyDesc>
        </EmptyState>
      ) : (
        <List>
          <AnimatePresence initial={false}>
            {sentences.map((s) => {
              const rate = rateOf(s.id, s.rate);
              const repeat = repeats[s.id] ?? 1;

              return (
                <Card
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <SentenceText>{s.text}</SentenceText>
                  {s.scriptTitle && (
                    <SourceText>
                      {t('saved.fromScript', { title: s.scriptTitle })}
                    </SourceText>
                  )}

                  <Controls>
                    <SpeakButton
                      onClick={() => speakRepeatedly(s.text, rate, repeat)}
                      aria-label={t('saved.playAria')}
                    >
                      <MdVolumeUp size={14} aria-hidden="true" />
                      {t('saved.play')}
                    </SpeakButton>

                    <ControlButton
                      $active={rate !== DEFAULT_RATE}
                      onClick={() => cycleRate(s.id, s.rate)}
                      aria-label={t('scriptDetail.speedAria')}
                    >
                      <MdSpeed size={14} aria-hidden="true" />
                      {rate.toFixed(2).replace(/0$/, '')}x
                    </ControlButton>

                    <ControlButton
                      $active={repeat > 1}
                      onClick={() => cycleRepeat(s.id)}
                      aria-label={t('scriptDetail.repeatAria')}
                    >
                      <MdRepeat size={14} aria-hidden="true" />
                      {repeat}
                    </ControlButton>

                    <Spacer />

                    <ControlButton
                      $danger
                      onClick={() => remove(s.id)}
                      aria-label={t('saved.deleteAria')}
                    >
                      <MdDelete size={16} aria-hidden="true" />
                    </ControlButton>
                  </Controls>
                </Card>
              );
            })}
          </AnimatePresence>
        </List>
      )}
    </PageContainer>
  );
}
