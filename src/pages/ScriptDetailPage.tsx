import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, type AppState } from '@/store/appStore';
import {
  MdArrowBack,
  MdVolumeUp,
  MdPlayArrow,
  MdRecordVoiceOver,
  MdStop,
  MdPlayCircle,
} from 'react-icons/md';
import type { ScriptData } from '@/utils/types';
import { useTTS } from '@/utils/useTTS';
import { useRef, useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
// 미사용 훅 주석 처리
// import { useTheme } from '@emotion/react';

// 스타일 컴포넌트 정의

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
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBg};
  z-index: 10;
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

const LineCount = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSub};
  margin-right: 8px;
  display: none;
  @media (min-width: 640px) {
    display: block;
  }
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
  padding: 12px;
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

const Bubble = styled.button<{
  bgColor: string;
  isRight: boolean;
  active: boolean;
}>`
  max-width: 85%;
  padding: 8px;
  border-radius: 16px;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background-color: ${({ bgColor }) => bgColor};
  color: #333d4b;
  cursor: pointer;
  transition: all 0.3s ease;

  ${({ isRight }) =>
    isRight ? `border-top-right-radius: 4px;` : `border-top-left-radius: 4px;`}

  /* 활성 상태 스타일 */
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

  &:disabled {
    cursor: pointer;
  }

  @media (min-width: 768px) {
    max-width: 70%;
  }
`;

const SpeakerLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.5);
`;

// 활성 아이콘 색상 (진한 회색)
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
  font-weight: 600;
  color: ${({ theme }) => theme.textMain};
`;

const Footer = styled.div`
  flex-shrink: 0;
  padding: 12px;
  background-color: ${({ theme }) => theme.cardBg};
  border-top: 1px solid ${({ theme }) => theme.border};
  z-index: 10;
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
  color: white;
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

// 로직 컴포넌트

const PALETTE = [
  '#e8f3ff', // blue50
  '#ffeeee', // red50
  '#f0faf6', // green50
  '#fff8e1', // amber50
  '#f3e5f5', // purple50
];

export function ScriptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { speak, isSpeaking, voices } = useTTS();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  // 미사용 변수 주석 처리
  // const theme = useTheme();

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // 개별 클릭 상태 관리
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const script = useAppStore((state: AppState) =>
    state.allScripts.find((s) => s.id === id),
  );

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
      state: { lines: scriptData.lines, scriptId: scriptData.id },
    });
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      setIsAutoPlaying(true);
      setClickedIndex(null); // 수동 클릭 초기화
      setPlayingIndex(0);
    }
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    setPlayingIndex(null);
    setClickedIndex(null); // 활성 상태 초기화
    window.speechSynthesis.cancel();
  };

  // 자동 재생 로직
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

      speak(line.originalLine, selectedVoiceURI, () => {
        if (isAutoPlaying) {
          setTimeout(() => {
            setPlayingIndex((prev) => (prev !== null ? prev + 1 : null));
          }, 500);
        }
      });
    }
  }, [isAutoPlaying, playingIndex, script, selectedVoiceURI, speak]);

  useEffect(() => {
    return () => stopAutoPlay();
  }, []);

  if (!script) {
    return (
      <ErrorContainer>
        <ErrorTitle>Script Not Found</ErrorTitle>
        <ErrorMessage>
          The script you are looking for does not exist.
        </ErrorMessage>
        <ErrorButton onClick={() => navigate('/')}>
          <MdArrowBack size={20} /> Back to My Scripts
        </ErrorButton>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Go back">
            <MdArrowBack size={24} />
          </BackButton>
          <Title>{script.title}</Title>
        </HeaderLeft>

        <HeaderControls>
          <AutoPlayButton
            onClick={toggleAutoPlay}
            isPlaying={isAutoPlaying}
            aria-label={isAutoPlaying ? 'Stop Auto Play' : 'Start Auto Play'}
          >
            {isAutoPlaying ? <MdStop size={16} /> : <MdPlayCircle size={16} />}
            {isAutoPlaying ? 'Stop' : 'Auto Play'}
          </AutoPlayButton>

          <VoiceSelectWrapper>
            <MdRecordVoiceOver size={14} />
            <VoiceSelect
              value={selectedVoiceURI || ''}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              aria-label="Select TTS voice"
              // 접근성 준수용 title 속성
              title="Select TTS voice"
            >
              <option value="">Default Voice</option>
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

          // 활성 상태 로직 (자동 재생 또는 수동 클릭)
          const isActive =
            (playingIndex === index || clickedIndex === index) && isSpeaking;

          return (
            <DialogueRow key={index} isRight={isRightSide}>
              <Bubble
                id={`bubble-${index}`}
                bgColor={speakerColors[line.speakerId]}
                isRight={isRightSide}
                active={isActive}
                onClick={() => {
                  stopAutoPlay(); // 자동 재생 중지
                  setClickedIndex(index); // 수동 클릭 인덱스 설정
                  speak(line.originalLine, selectedVoiceURI, () => {
                    setClickedIndex(null); // 말하기 종료 후 초기화
                  });
                }}
                disabled={false}
                aria-label={`Speak line by ${line.speakerId}`}
              >
                <SpeakerLabel>
                  {line.speakerId}
                  <VolumeIcon isSpeaking={isActive} />
                </SpeakerLabel>
                <DialogueText>{line.originalLine}</DialogueText>
              </Bubble>
            </DialogueRow>
          );
        })}
      </ScrollArea>

      <Footer>
        <StartButton onClick={() => handlePracticeClick(script)}>
          <MdPlayArrow size={24} /> Start Practice
        </StartButton>
      </Footer>
    </PageContainer>
  );
}
