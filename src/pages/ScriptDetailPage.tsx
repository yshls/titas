import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, type AppState } from '@/store/appStore';
import styled from '@emotion/styled';
import {
  MdArrowBack,
  MdVolumeUp,
  MdPlayArrow,
  MdRecordVoiceOver,
} from 'react-icons/md';
import type { ScriptData } from '@/utils/types';
import { useTTS } from '@/utils/useTTS';
import { useRef, useMemo, useState } from 'react';

const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.modes.light.background};
  overflow: hidden;
  font-family: 'lato', sans-serif;
`;

//  헤더 영역
const Header = styled.div`
  background-color: ${({ theme }) =>
    theme.modes.light.background}; /* 투명도 대신 배경색 사용 */
  border-bottom: 1px solid ${({ theme }) => theme.modes.light.border};
  padding: 12px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.textSub};
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textMain};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const VoiceSelector = styled.div`
  display: none;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSub};
  flex-shrink: 0;

  @media (min-width: 768px) {
    display: flex;
  }

  select {
    background: transparent;
    font-weight: 700;
    border: none;
    outline: none;
    color: ${({ theme }) => theme.colors.textMain};
    cursor: pointer;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  min-width: 0;

  p {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSub};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

//  대화(채팅) 영역
const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  background-color: ${({ theme }) => theme.modes.light.background};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageRow = styled.div<{ isRight: boolean }>`
  display: flex;
  justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.button<{
  isRight: boolean;
  bgColor: string;
  isSpeaking: boolean;
}>`
  position: relative;
  max-width: 90%;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.modes.light.border};
  text-align: left;
  transition: border-color 0.2s;
  cursor: pointer;

  /* 화자별 배경색 적용 */
  background-color: ${({ bgColor }) => bgColor};

  /* 말풍선 꼬리 효과 (모서리 처리) */
  border-top-right-radius: ${({ isRight }) => (isRight ? '4px' : '16px')};
  border-top-left-radius: ${({ isRight }) => (isRight ? '16px' : '4px')};

  /* 반응형 너비 제한 */
  @media (min-width: 768px) {
    max-width: 75%;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const BubbleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SpeakerName = styled.p`
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMain};
  opacity: 0.8;
`;

const SpeakerIcon = styled(MdVolumeUp)<{ isSpeaking: boolean }>`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.textMain};
  opacity: ${({ isSpeaking }) => (isSpeaking ? 0.5 : 0.3)};
  transition: opacity 0.3s;

  ${MessageBubble}:hover & {
    opacity: 1;
  }
`;

const LineText = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMain};
  line-height: 1.6;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

// 3. 하단 푸터
const Footer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.modes.light.border};
  padding: 12px;
  flex-shrink: 0;
  z-index: 10;
  background-color: ${({ theme }) => theme.modes.light.cardBg};
`;

const ActionButton = styled.button`
  width: 100%;
  max-width: 512px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 12px;
  font-weight: 900;
  text-transform: uppercase;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

// Not Found 스타일
const NotFoundContainer = styled.div`
  text-align: center;
  padding: 64px 0;
`;

const NotFoundTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
  margin-bottom: 16px;
`;

const NotFoundText = styled.p`
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: 24px;
`;

const GoBackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 12px;
  font-weight: 700;
`;

export function ScriptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { speak, isSpeaking, voices } = useTTS();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  const script = useAppStore((state: AppState) =>
    state.allScripts.find((s) => s.id === id),
  );

  const speakerIds = useMemo(
    () =>
      script ? [...new Set(script.lines.map((line) => line.speakerId))] : [],
    [script],
  );

  // 화자별 색상 매핑 (Theme 색상 활용)
  const speakerColors = useMemo(() => {
    // 테마에 정의된 연한 색상들 순환 사용
    const palette = [
      '#e8f3ff', // blue50
      '#fff3e0', // orange50
      '#f0faf6', // green50
      '#ffeeee', // red50
      '#f2f4f6', // grey100
    ];
    const colors: Record<string, string> = {};
    speakerIds.forEach((id, index) => {
      colors[id] = palette[index % palette.length];
    });
    return colors;
  }, [speakerIds]);

  const englishVoices = useMemo(
    () => voices.filter((v: SpeechSynthesisVoice) => v.lang.startsWith('en-')),
    [voices],
  );

  const handlePracticeClick = (scriptData: ScriptData) => {
    navigate(`/talk/${scriptData.id}`, {
      state: { lines: scriptData.lines, scriptId: scriptData.id },
    });
  };

  if (!script) {
    return (
      <NotFoundContainer>
        <NotFoundTitle>Script Not Found</NotFoundTitle>
        <NotFoundText>
          The script you are looking for does not exist.
        </NotFoundText>
        <GoBackButton onClick={() => navigate('/')}>
          <MdArrowBack size={20} />
          Back to My Scripts
        </GoBackButton>
      </NotFoundContainer>
    );
  }

  return (
    <PageContainer>
      {/* 헤더 */}
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Go back">
            <MdArrowBack size={24} />
          </BackButton>
          <Title>{script.title}</Title>
        </HeaderLeft>

        <VoiceSelector>
          <MdRecordVoiceOver size={16} />
          <select
            value={selectedVoiceURI || ''}
            onChange={(e) => setSelectedVoiceURI(e.target.value)}
            aria-label="Select TTS voice"
          >
            <option value="">Default Voice</option>
            {englishVoices.map((voice: SpeechSynthesisVoice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </VoiceSelector>

        <HeaderRight>
          <p>
            {script.lines.length} lines • {speakerIds.length} speakers
          </p>
        </HeaderRight>
      </Header>

      {/* 대화 */}
      <ChatContainer ref={chatContainerRef}>
        {script.lines.map((line, index) => {
          const isPrimarySpeakerSide =
            speakerIds.indexOf(line.speakerId) % 2 === 0;

          return (
            <MessageRow key={index} isRight={isPrimarySpeakerSide}>
              <MessageBubble
                onClick={() =>
                  !isSpeaking && speak(line.originalLine, selectedVoiceURI)
                }
                disabled={isSpeaking}
                isRight={isPrimarySpeakerSide}
                bgColor={speakerColors[line.speakerId]}
                isSpeaking={isSpeaking}
              >
                <BubbleHeader>
                  <SpeakerName>{line.speakerId}</SpeakerName>
                  <SpeakerIcon as={MdVolumeUp} isSpeaking={isSpeaking} />
                </BubbleHeader>

                <LineText>{line.originalLine}</LineText>
              </MessageBubble>
            </MessageRow>
          );
        })}
      </ChatContainer>

      {/* 하단 */}
      <Footer>
        <ActionButton onClick={() => handlePracticeClick(script)}>
          <MdPlayArrow size={28} />
          Start Practice
        </ActionButton>
      </Footer>
    </PageContainer>
  );
}
