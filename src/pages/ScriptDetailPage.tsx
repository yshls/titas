import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import {
  MdArrowBack,
  MdVolumeUp,
  MdPlayArrow,
  MdRecordVoiceOver,
  MdStop,
  MdPlayCircle,
  MdSpeed,
  MdRepeat,
  MdBookmarkBorder,
  MdBookmark,
} from 'react-icons/md';
import type { ScriptData } from '@/utils/types';
import { useTTS, DEFAULT_RATE, RATE_STEPS } from '@/utils/useTTS';
import { useMemo, useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/common/Seo';
import { EditableText } from '@/components/common/EditableText';
import { useSavedSentences } from '@/hooks/pageSpecific/useSavedSentences';

// --- 상수 정의 ---

/** 문장별 반복 횟수 단계 */
const REPEAT_STEPS = [1, 2, 3] as const;

const PALETTE = [
  '#e8f3ff', // blue50
  '#ffeeee', // red50
  '#f0faf6', // green50
  '#fff8e1', // amber50
  '#f3e5f5', // purple50
];

// --- 스타일 컴포넌트 ---

const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
  font-family: 'lato', sans-serif;
  overflow: hidden;
`;

const Header = styled.header`
  flex-shrink: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 20;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.textSub};
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.textMain};
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AutoPlayButton = styled.button<{ isPlaying: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${({ isPlaying, theme }) =>
    isPlaying
      ? `
    background-color: ${theme.border};
    color: ${theme.textSub};
    border: 1px solid ${theme.border};
  `
      : `
    background-color: ${theme.colors.primaryLight};
    color: ${theme.colors.primary};
    border: 1px solid transparent;
  `}

  &:hover {
    transform: translateY(-1px);
    filter: brightness(0.95);
  }
`;

const VoiceSelectWrapper = styled.div`
  display: none;
  align-items: center;
  gap: 4px;
  background-color: ${({ theme }) => theme.border};
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.textMain};

  @media (min-width: 768px) {
    display: flex;
  }
`;

const VoiceSelect = styled.select`
  background: transparent;
  border: none;
  font-weight: 700;
  font-size: 12px;
  color: ${({ theme }) => theme.textMain};
  outline: none;
  max-width: 150px;
  cursor: pointer;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  background-color: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 10px;
  }
`;

const DialogueRow = styled.div<{ isRight: boolean }>`
  display: flex;
  justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
  width: 100%;
`;

const BubbleContainer = styled.div<{ isRight: boolean }>`
  display: flex;
  flex-direction: column;
  max-width: 85%;
  align-items: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};

  @media (min-width: 768px) {
    max-width: 70%;
  }
`;

const MessageBubble = styled.div<{
  bgColor: string;
  isRight: boolean;
  active: boolean;
}>`
  padding: 14px 18px;
  border-radius: 24px;
  text-align: left;
  background-color: ${({ bgColor }) => bgColor};
  color: #333d4b;
  cursor: default;
  transition: all 0.2s ease;
  box-shadow: none;
  font-size: 18px;
  line-height: 1.6;
  min-width: 140px;

  ${({ isRight }) =>
    isRight ? `border-top-right-radius: 4px;` : `border-top-left-radius: 4px;`}

  ${({ active, theme }) =>
    active &&
    `
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primaryLight};
    transform: scale(1.02);
  `}

  &:hover {
    filter: brightness(0.95);
  }
`;

const BubbleHeader = styled.div<{ isRight: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
  flex-direction: ${({ isRight }) => (isRight ? 'row-reverse' : 'row')};
`;

const SpeakerName = styled.span``;

const VolumeIcon = styled(MdVolumeUp)<{ isSpeaking: boolean }>`
  opacity: ${({ isSpeaking }) => (isSpeaking ? 1 : 0.4)};
  color: ${({ isSpeaking, theme }) =>
    isSpeaking ? theme.colors.primary : 'inherit'};
  width: 14px;
  height: 14px;
  transition: all 0.2s;
`;

const DialogueText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  font-weight: 500;
  color: ${({ theme }) => theme.textMain};
`;

const LineControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 0 4px;
`;

const LineControlButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.cardBg};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.onPrimary : theme.textSub};

  &:hover {
    color: ${({ $active, theme }) =>
      $active ? theme.colors.onPrimary : theme.textMain};
  }
`;

const Footer = styled.div`
  flex-shrink: 0;
  padding: 16px;
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.background};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const StartButton = styled.button`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: 12px;
  font-weight: 800;
  font-size: 16px;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorContainer = styled(PageContainer)`
  align-items: center;
  justify-content: center;
`;

const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.textMain};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.textSub};
  margin-bottom: 24px;
`;

const ErrorButton = styled(StartButton)`
  width: auto;
  padding: 12px 24px;
`;

// --- [로직 컴포넌트] ---

export function ScriptDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { speak, isSpeaking, voices } = useTTS();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const allScripts = useAppStore((state) => state.allScripts);
  const language = useAppStore((state) => state.language);
  const updateScriptLine = useAppStore((state) => state.updateScriptLine);
  const updateScriptLineRate = useAppStore((state) => state.updateScriptLineRate);
  const script = allScripts.find((s) => s.id === id);

  const { save: saveSentence, remove: removeSentence, isSaved, findByText } =
    useSavedSentences();

  // 문장별 반복 횟수. 저장할 값이 아니라 이번 세션에서만 쓰는 설정이다.
  const [repeatCounts, setRepeatCounts] = useState<Record<string, number>>({});
  const repeatTimerRef = useRef<number | undefined>(undefined);

  const speakerIds = useMemo(
    () =>
      script ? [...new Set(script.lines.map((line) => line.speakerId))] : [],
    [script],
  );

  const speakerColors = useMemo(() => {
    const colors: Record<string, string> = {};
    speakerIds.forEach((id, index) => {
      colors[id] = PALETTE[index % PALETTE.length];
    });
    return colors;
  }, [speakerIds]);

  const englishVoices = useMemo(
    () => voices.filter((v: SpeechSynthesisVoice) => v.lang.startsWith('en-')),
    [voices],
  );

  const handlePracticeClick = (scriptData: ScriptData) => {
    stopAutoPlay();
    navigate(`/talk/${scriptData.id}`, {
      state: {
        lines: scriptData.lines,
        scriptId: scriptData.id,
        title: scriptData.title,
      },
    });
  };

  const getRate = (lineId: string) =>
    script?.lines.find((l) => l.id === lineId)?.rate ?? DEFAULT_RATE;

  // 속도 버튼을 누르면 다음 단계로 순환한다.
  const cycleRate = (lineId: string) => {
    const current = getRate(lineId);
    const idx = RATE_STEPS.findIndex((r) => r === current);
    const next = RATE_STEPS[(idx + 1) % RATE_STEPS.length];
    if (script) updateScriptLineRate(script.id, lineId, next);
  };

  const cycleRepeat = (lineId: string) => {
    setRepeatCounts((prev) => {
      const next = (prev[lineId] ?? 1) % REPEAT_STEPS[REPEAT_STEPS.length - 1] + 1;
      // 1 → 2 → 3 → 1 순환 (REPEAT_STEPS의 마지막 값에서 되돌아온다)
      return { ...prev, [lineId]: next };
    });
  };

  // 한 문장을 지정한 횟수만큼 이어서 읽는다.
  const speakRepeatedly = (text: string, rate: number, times: number) => {
    let done = 0;
    const runOnce = () => {
      speak(text, selectedVoiceURI, () => {
        done += 1;
        if (done < times) {
          // 연달아 붙지 않도록 짧게 쉬었다가 다음 반복을 시작한다.
          repeatTimerRef.current = window.setTimeout(runOnce, 350);
        } else {
          setClickedIndex(null);
        }
      }, rate);
    };
    runOnce();
  };

  const toggleSave = (line: { id: string; originalLine: string; speakerId: string }) => {
    const existing = findByText(line.originalLine);
    if (existing) {
      removeSentence(existing.id);
      return;
    }
    saveSentence({
      text: line.originalLine,
      speakerId: line.speakerId,
      scriptId: script?.id ?? null,
      scriptTitle: script?.title ?? null,
      rate: getRate(line.id),
    });
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      setIsAutoPlaying(true);
      setClickedIndex(null);
      setPlayingIndex(0);
      toast.success(t('scriptDetail.autoPlayStarted'));
    }
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    setPlayingIndex(null);
    setClickedIndex(null);
    // 반복 대기 중인 타이머가 남아 있으면 정지 후에도 다시 읽어버린다.
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = undefined;
    }
    window.speechSynthesis.cancel();
  };

  useEffect(() => {
    if (!script) return;

    if (isAutoPlaying && playingIndex !== null) {
      if (playingIndex >= script.lines.length) {
        stopAutoPlay();
        return;
      }

      const line = script.lines[playingIndex];

      const element = document.getElementById(`bubble-${playingIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      speak(
        line.originalLine,
        selectedVoiceURI,
        () => {
          if (isAutoPlaying) {
            setTimeout(() => {
              setPlayingIndex((prev) => (prev !== null ? prev + 1 : null));
            }, 500);
          }
        },
        line.rate ?? DEFAULT_RATE,
      );
    }
  }, [isAutoPlaying, playingIndex, script, selectedVoiceURI, speak]);

  useEffect(() => {
    return () => stopAutoPlay();
  }, []);

  if (!script) {
    return (
      <ErrorContainer>
        <Seo
          title={
            language === 'en'
              ? 'Script Not Found'
              : '스크립트를 찾을 수 없습니다'
          }
        />
        <ErrorTitle>{t('scriptDetail.notFoundTitle')}</ErrorTitle>
        <ErrorMessage>
          {t('scriptDetail.notFoundDesc')}
        </ErrorMessage>
        <ErrorButton onClick={() => navigate('/')}>
          <MdArrowBack size={20} /> {t('scriptDetail.backToScripts')}
        </ErrorButton>
      </ErrorContainer>
    );
  }

  const seoProps =
    language === 'en'
      ? {
          title: `Listen to '${script.title}'`,
          description: `Read and listen to the full English script for '${script.title}'. Prepare for your shadowing practice.`,
        }
      : {
          title: `'${script.title}' 전체 대본 듣기`,
          description: `'${script.title}' 영어 대본 전체를 읽고 들어보세요. 쉐도잉 연습을 위해 미리 준비할 수 있습니다.`,
        };

  return (
    <PageContainer>
      <Seo {...seoProps} />

      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label={t('scriptDetail.goBackAria')}>
            <MdArrowBack size={24} />
          </BackButton>
          <Title>{script.title}</Title>
        </HeaderLeft>

        <HeaderControls>
          <AutoPlayButton
            onClick={toggleAutoPlay}
            isPlaying={isAutoPlaying}
            aria-label={isAutoPlaying ? t('scriptDetail.stopAutoPlayAria') : t('scriptDetail.startAutoPlayAria')}
          >
            {isAutoPlaying ? <MdStop size={18} /> : <MdPlayCircle size={18} />}
            {isAutoPlaying ? t('scriptDetail.stop') : t('scriptDetail.autoPlay')}
          </AutoPlayButton>

          <VoiceSelectWrapper>
            <MdRecordVoiceOver size={14} />
            <VoiceSelect
              value={selectedVoiceURI || ''}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              aria-label={t('scriptDetail.selectVoiceAria')}
              title={t('scriptDetail.selectVoiceAria')}
            >
              <option value="">{t('scriptDetail.defaultVoice')}</option>
              {englishVoices.map((voice: SpeechSynthesisVoice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </VoiceSelect>
          </VoiceSelectWrapper>
        </HeaderControls>
      </Header>

      <ScrollArea ref={chatContainerRef}>
        {script.lines.map((line, index) => {
          const isRightSide = speakerIds.indexOf(line.speakerId) % 2 !== 0;

          const isActive =
            (playingIndex === index || clickedIndex === index) && isSpeaking;

          return (
            <DialogueRow key={index} isRight={isRightSide}>
              <BubbleContainer isRight={isRightSide}>
                <MessageBubble
                  id={`bubble-${index}`}
                  bgColor={speakerColors[line.speakerId]}
                  isRight={isRightSide}
                  active={isActive}
                  onClick={() => {
                    stopAutoPlay();
                    setClickedIndex(index);
                    speakRepeatedly(
                      line.originalLine,
                      line.rate ?? DEFAULT_RATE,
                      repeatCounts[line.id] ?? 1,
                    );
                  }}
                  aria-label={t('scriptDetail.speakLineAria', { speaker: line.speakerId })}
                >
                  <BubbleHeader isRight={isRightSide}>
                    <SpeakerName>{line.speakerId}</SpeakerName>
                    <VolumeIcon isSpeaking={isActive} />
                  </BubbleHeader>
                  <DialogueText as="div">
                    <EditableText
                      initialText={line.originalLine}
                      onEditStart={() => {
                        stopAutoPlay();
                        setClickedIndex(null);
                      }}
                      onSave={(newText) => {
                        updateScriptLine(script.id, line.id, newText);
                      }}
                    />
                  </DialogueText>
                </MessageBubble>

                <LineControls>
                  <LineControlButton
                    $active={(line.rate ?? DEFAULT_RATE) !== DEFAULT_RATE}
                    onClick={() => cycleRate(line.id)}
                    aria-label={t('scriptDetail.speedAria')}
                  >
                    <MdSpeed size={13} aria-hidden="true" />
                    {(line.rate ?? DEFAULT_RATE).toFixed(2).replace(/0$/, '')}x
                  </LineControlButton>

                  <LineControlButton
                    $active={(repeatCounts[line.id] ?? 1) > 1}
                    onClick={() => cycleRepeat(line.id)}
                    aria-label={t('scriptDetail.repeatAria')}
                  >
                    <MdRepeat size={13} aria-hidden="true" />
                    {repeatCounts[line.id] ?? 1}
                  </LineControlButton>

                  <LineControlButton
                    $active={isSaved(line.originalLine)}
                    onClick={() => toggleSave(line)}
                    aria-label={t('scriptDetail.saveSentenceAria')}
                  >
                    {isSaved(line.originalLine) ? (
                      <MdBookmark size={13} aria-hidden="true" />
                    ) : (
                      <MdBookmarkBorder size={13} aria-hidden="true" />
                    )}
                  </LineControlButton>
                </LineControls>
              </BubbleContainer>
            </DialogueRow>
          );
        })}
      </ScrollArea>

      <Footer>
        <StartButton onClick={() => handlePracticeClick(script)}>
          <MdPlayArrow size={24} /> {t('scriptDetail.startPractice')}
        </StartButton>
      </Footer>
    </PageContainer>
  );
}
