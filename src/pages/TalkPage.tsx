import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import type { DialogueLine, PracticeLog, WeakSpot } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';
import { checkWordDiff } from '@/utils/diffChecker';
import { useTTS } from '@/utils/useTTS';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';
import { useAppStore, type AppState } from '@/store/appStore';
import { FiMic } from 'react-icons/fi';
import {
  MdKeyboard,
  MdLightbulb,
  MdVolumeUp,
  MdSend,
  MdPerson,
  MdRecordVoiceOver,
  MdReplay,
  MdClose,
  MdArrowBack,
  MdPlayArrow, // 재생 아이콘 추가
} from 'react-icons/md';

// --- [Styled Components] ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.modes.light.background};
  font-family: 'lato', sans-serif;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.modes.light.background};
  border-bottom: 1px solid ${({ theme }) => theme.modes.light.border};
  z-index: 10;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  color: ${({ theme }) => theme.colors.textSub};
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textMain};
  text-transform: uppercase;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VoiceSelect = styled.select`
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSub};
  outline: none;
  cursor: pointer;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: ${({ theme }) => theme.modes.light.background};
`;

const MessageRow = styled.div<{ isRight: boolean }>`
  display: flex;
  justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.div<{ isRight: boolean; bgColor: string }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  background-color: ${({ bgColor }) => bgColor};
  border: 1px solid ${({ theme }) => theme.modes.light.border};
  position: relative; /* Play 버튼 위치 잡기 위해 */

  border-top-left-radius: ${({ isRight }) => (isRight ? '16px' : '4px')};
  border-top-right-radius: ${({ isRight }) => (isRight ? '4px' : '16px')};

  @media (min-width: 768px) {
    max-width: 70%;
  }
`;

const BubbleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const SpeakerLabel = styled.span`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMain};
  opacity: 0.7;
`;

const LineText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textMain};
  line-height: 1.5;
`;

// 피드백 텍스트 스타일
const FeedbackText = styled.span<{ status: 'correct' | 'removed' | 'added' }>`
  font-weight: 700;
  ${({ status, theme }) =>
    status === 'correct' && `color: ${theme.colors.success};`}
  ${({ status, theme }) =>
    status === 'removed' &&
    `color: ${theme.colors.error}; text-decoration: line-through; opacity: 0.6;`}
  ${({ status, theme }) =>
    status === 'added' && `color: ${theme.colors.warning};`}
`;

// ✨ [추가] 내 녹음 다시 듣기 버튼
const ReplayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.modes.light.border};
  color: ${({ theme }) => theme.colors.primary};
  margin-left: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: scale(1.1);
  }
`;

// 하단 컨트롤 영역
const ControlsContainer = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.modes.light.cardBg};
  border-top: 1px solid ${({ theme }) => theme.modes.light.border};
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.modes.light.border};
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey50};
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 0 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey200};
    cursor: not-allowed;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
`;

const CircleButton = styled.button<{
  isActive?: boolean;
  size?: 'small' | 'large';
}>`
  width: ${({ size }) => (size === 'large' ? '64px' : '48px')};
  height: ${({ size }) => (size === 'large' ? '64px' : '48px')};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  /* 기본 스타일 (테두리만) */
  background-color: white;
  border: 1px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.modes.light.border};
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.textSub};

  /* Active (Filled) 스타일 */
  ${({ isActive, theme }) =>
    isActive &&
    `
    background-color: ${theme.colors.primary};
    color: white;
    border: none;
  `}

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme, isActive }) =>
      isActive ? 'white' : theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const MicButton = styled(CircleButton)<{ isListening: boolean }>`
  ${({ isListening, theme }) =>
    isListening &&
    `
    background-color: ${theme.colors.error};
    color: white;
    border: none;
    animation: ${pulse} 1.5s infinite;
    
    &:hover {
      background-color: ${theme.colors.error};
      color: white;
    }
  `}
`;

// --- [Role Selection Components] --- (기존 유지)
const RoleSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.modes.light.background};
  padding: 24px;
`;
const RoleTitle = styled.h1`
  font-size: 32px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textMain};
  margin-bottom: 8px;
  text-transform: uppercase;
`;
const RoleSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: 32px;
`;
const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  max-width: 600px;
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const RoleCard = styled.button`
  background-color: ${({ theme }) => theme.modes.light.cardBg};
  border: 1px solid ${({ theme }) => theme.modes.light.border};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;
const Avatar = styled.div<{ color: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMain};
  font-size: 24px;
`;

// --- [Logic] ---

export function TalkPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const addNewPracticeLog = useAppStore(
    (state: AppState) => state.addNewPracticeLog,
  );
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- 녹음 관련 Refs & State ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // 인덱스별 녹음 파일 URL 저장 (Blob URL)
  const [userAudioMap, setUserAudioMap] = useState<Record<number, string>>({});

  const initialScriptLines: DialogueLine[] = useMemo(() => {
    return location.state?.lines || [];
  }, [location.state]);

  const speakerIds = useMemo(
    () => [...new Set(initialScriptLines.map((line) => line.speakerId))],
    [initialScriptLines],
  );

  const speakerColors = useMemo(() => {
    const palette = ['#e8f3ff', '#fff3e0', '#f0faf6', '#ffeeee'];
    const colors: Record<string, string> = {};
    speakerIds.forEach((id, index) => {
      colors[id] = palette[index % palette.length];
    });
    return colors;
  }, [speakerIds]);

  const [script] = useState<DialogueLine[]>(initialScriptLines);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, DiffResult[]>>(
    {},
  );
  const [userInputMap, setUserInputMap] = useState<Record<number, string>>({});
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [userSpeakerId, setUserSpeakerId] = useState<string | null>(null);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [inputMode, setInputMode] = useState<'mic' | 'keyboard'>('mic');
  const [typedInput, setTypedInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [sessionErrors, setSessionErrors] = useState<WeakSpot[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{
    accuracy: number;
    timeSpent: number;
  } | null>(null);

  const { transcript, isListening, startListening } = useSpeechRecognition();
  const { speak, isSpeaking, voices } = useTTS();

  const englishVoices = useMemo(
    () => voices.filter((v: SpeechSynthesisVoice) => v.lang.startsWith('en-')),
    [voices],
  );

  const currentLine = script[currentLineIndex];
  const isFinished = currentLineIndex >= script.length;
  const isMyTurn = currentLine?.speakerId === userSpeakerId;

  // --- [녹음 기능 구현] ---

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        // 현재 인덱스에 오디오 URL 매핑
        setUserAudioMap((prev) => ({ ...prev, [currentLineIndex]: audioUrl }));

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Mic access denied', err);
      toast.error('Microphone access is required for recording.');
    }
  };

  // 녹음 종료
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // 오디오 재생
  const playUserAudio = (index: number) => {
    const audioUrl = userAudioMap[index];
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // -----------------------

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [currentLineIndex, feedbackMap]);

  useEffect(() => {
    if (
      currentLine &&
      !isMyTurn &&
      !isSpeaking &&
      !isListening &&
      isPracticeStarted &&
      !isFinished
    ) {
      speak(currentLine.originalLine, selectedVoiceURI, () => {
        setCurrentLineIndex((prev) => prev + 1);
      });
    }
  }, [
    currentLine,
    isMyTurn,
    isSpeaking,
    isListening,
    isPracticeStarted,
    isFinished,
    speak,
    selectedVoiceURI,
  ]);

  useEffect(() => {
    if (transcript && !isListening) {
      processUserInput(transcript);
    }
  }, [transcript, isListening]);

  const processUserInput = (inputText: string) => {
    if (!currentLine || !isMyTurn || feedbackMap[currentLineIndex]) return;

    // ✨ 음성 인식 완료되면 녹음도 종료
    stopRecording();

    const originalLineForDiff = currentLine.originalLine.replace(
      /[.,?!\/#!$%\^&\*;:{}=\-_`~()]/g,
      '',
    );
    const diffResult = checkWordDiff(originalLineForDiff, inputText);

    setFeedbackMap((prev) => ({ ...prev, [currentLineIndex]: diffResult }));
    setUserInputMap((prev) => ({ ...prev, [currentLineIndex]: inputText }));
    setShowHint(false);
    setTypedInput('');

    const newErrors: WeakSpot[] = diffResult
      .filter((part) => part.status === 'removed' || part.status === 'added')
      .map((part) => ({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        original: part.status === 'removed' ? part.value : '',
        spoken: part.status === 'added' ? part.value : '',
        scriptId: location.state?.scriptId || 'NEW_SESSION',
        lineContent: currentLine.originalLine,
      }));
    setSessionErrors((prev) => [...prev, ...newErrors]);

    setTimeout(() => {
      setCurrentLineIndex((prev) => prev + 1);
    }, 1500);
  };

  const handleMicClick = () => {
    if (currentLine && isMyTurn && !feedbackMap[currentLineIndex]) {
      setShowHint(false);
      setTypedInput('');

      startListening(); // 음성 인식 시작
      startRecording(); //  녹음 시작 (브라우저 메모리 저장용)
    }
  };

  const handleKeyboardSubmit = () => {
    if (typedInput.trim() && currentLine && isMyTurn) {
      processUserInput(typedInput.trim());
    }
  };

  const handleEndPractice = () => {
    const userLines = Object.keys(feedbackMap).map(Number);
    let totalCorrectWords = 0;
    let totalWordsInSpokenLines = 0;

    userLines.forEach((lineIndex) => {
      const diff = feedbackMap[lineIndex];
      if (diff) {
        totalCorrectWords += diff.filter(
          (part) => part.status === 'correct',
        ).length;
        totalWordsInSpokenLines += diff.filter(
          (part) => part.status !== 'added',
        ).length;
      }
    });

    const finalAccuracy =
      totalWordsInSpokenLines > 0
        ? Math.round((totalCorrectWords / totalWordsInSpokenLines) * 100)
        : 0;

    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    const newLogEntry: PracticeLog = {
      id: crypto.randomUUID(),
      date: Date.now(),
      scriptId: location.state?.scriptId || 'NEW_SESSION',
      accuracy: finalAccuracy,
      timeSpent: timeSpent,
      errors: sessionErrors,
    };
    addNewPracticeLog(newLogEntry, location.state?.title || 'Practice Session');

    setPracticeResult({ accuracy: finalAccuracy, timeSpent: timeSpent });
    setShowResultModal(true);
  };

  const handleStartPractice = (speakerId: string) => {
    if (script.length === 0) {
      toast.error('No script available');
      return;
    }
    setUserSpeakerId(speakerId);
    setIsPracticeStarted(true);
    setCurrentLineIndex(0);
    setFeedbackMap({});
    setUserInputMap({});
    setUserAudioMap({}); // 오디오 초기화
    setSessionStartTime(Date.now());
    setSessionErrors([]);
    setShowResultModal(false);
  };

  const handleRetryPractice = () => {
    setCurrentLineIndex(0);
    setFeedbackMap({});
    setUserInputMap({});
    setUserAudioMap({}); // 오디오 초기화
    setSessionStartTime(Date.now());
    setSessionErrors([]);
    setShowResultModal(false);
    toast('Restarting...', { icon: '🔄', duration: 1500 });
  };

  useEffect(() => {
    if (isFinished && isPracticeStarted) {
      handleEndPractice();
    }
  }, [isFinished, isPracticeStarted]);

  // --- [Role Selection View] ---
  if (!isPracticeStarted) {
    return (
      <RoleSelectionContainer>
        <Toaster position="top-center" />
        <RoleTitle>Choose Your Role</RoleTitle>
        <RoleSubtitle>
          Select which character you want to practice as
        </RoleSubtitle>

        <RoleGrid>
          {speakerIds.map((id) => {
            const lineCount = script.filter(
              (line) => line.speakerId === id,
            ).length;
            return (
              <RoleCard key={id} onClick={() => handleStartPractice(id)}>
                <Avatar color={speakerColors[id]}>
                  <MdPerson />
                </Avatar>
                <div style={{ textAlign: 'center' }}>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      marginBottom: '4px',
                    }}
                  >
                    {id}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7684' }}>
                    {lineCount} lines
                  </p>
                </div>
              </RoleCard>
            );
          })}
        </RoleGrid>

        <BackButton
          onClick={() => navigate(-1)}
          style={{
            marginTop: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <MdArrowBack /> Back
        </BackButton>
      </RoleSelectionContainer>
    );
  }

  // --- [Practice View] ---
  return (
    <PageContainer>
      <Toaster position="top-center" />

      {/* Header */}
      <Header>
        <HeaderLeft>
          <BackButton
            onClick={() => {
              if (window.confirm('Quit practice?')) navigate(-1);
            }}
          >
            <MdArrowBack size={24} />
          </BackButton>
          <HeaderTitle>Practice Mode</HeaderTitle>
        </HeaderLeft>

        <HeaderRight>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#6b7684',
            }}
          >
            <span>{userSpeakerId}</span>
            <span>•</span>
            <span>
              {currentLineIndex + 1}/{script.length}
            </span>
          </div>
          <MdRecordVoiceOver size={16} color="#6b7684" />
          <VoiceSelect
            value={selectedVoiceURI || ''}
            onChange={(e) => setSelectedVoiceURI(e.target.value)}
          >
            <option value="">Default</option>
            {englishVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
          </VoiceSelect>
        </HeaderRight>
      </Header>

      {/* Chat Area */}
      <ChatContainer ref={chatContainerRef}>
        {script
          .slice(0, currentLineIndex + (isFinished ? 0 : 1))
          .map((line, idx) => {
            const isUser = line.speakerId === userSpeakerId;
            const feedback = feedbackMap[idx];
            const hasRecording = !!userAudioMap[idx];

            return (
              <MessageRow key={line.id || idx} isRight={isUser}>
                <MessageBubble
                  isRight={isUser}
                  bgColor={speakerColors[line.speakerId]}
                >
                  <BubbleHeader>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <SpeakerLabel>{line.speakerId}</SpeakerLabel>

                      {/* [추가] 내 녹음 다시 듣기 버튼 (사용자이고 녹음파일 있을때만) */}
                      {isUser && hasRecording && (
                        <ReplayButton
                          onClick={() => playUserAudio(idx)}
                          title="Replay my recording"
                        >
                          <MdPlayArrow size={18} />
                        </ReplayButton>
                      )}
                    </div>
                    {!isUser && <MdVolumeUp size={14} color="#6b7684" />}
                  </BubbleHeader>

                  <LineText>
                    {isUser ? (
                      <>
                        {/* 사용자 입력 또는 피드백 표시 */}
                        {userInputMap[idx] || feedback ? (
                          <div>
                            <p style={{ marginBottom: feedback ? '8px' : 0 }}>
                              {userInputMap[idx]}
                            </p>
                            {feedback && (
                              <div
                                style={{
                                  borderTop: '1px solid rgba(0,0,0,0.1)',
                                  paddingTop: '8px',
                                  fontSize: '14px',
                                }}
                              >
                                {feedback.map((part, i) => (
                                  <FeedbackText
                                    key={i}
                                    status={part.status as any}
                                  >
                                    {part.value}{' '}
                                  </FeedbackText>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          // 아직 말하지 않음 (힌트 or 대기)
                          idx === currentLineIndex &&
                          (showHint ? (
                            <span
                              style={{ color: '#6b7684', fontStyle: 'italic' }}
                            >
                              {line.originalLine}
                            </span>
                          ) : (
                            <span
                              style={{ color: '#b0b8c1', fontStyle: 'italic' }}
                            >
                              Your turn to speak...
                            </span>
                          ))
                        )}
                      </>
                    ) : (
                      // 상대방 대사
                      line.originalLine
                    )}
                  </LineText>
                </MessageBubble>
              </MessageRow>
            );
          })}
      </ChatContainer>

      {/* Controls */}
      <ControlsContainer>
        {inputMode === 'keyboard' && (
          <InputWrapper>
            <TextInput
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKeyboardSubmit()}
              placeholder={isMyTurn ? 'Type here...' : 'Wait for your turn...'}
              disabled={!isMyTurn || !!feedbackMap[currentLineIndex]}
              autoFocus
            />
            <SendButton
              onClick={handleKeyboardSubmit}
              disabled={!typedInput.trim() || !isMyTurn}
            >
              <MdSend size={20} />
            </SendButton>
          </InputWrapper>
        )}

        <ActionsRow>
          <CircleButton
            onClick={() =>
              setInputMode((prev) => (prev === 'mic' ? 'keyboard' : 'mic'))
            }
            isActive={inputMode === 'keyboard'}
          >
            <MdKeyboard size={24} />
          </CircleButton>

          <MicButton
            size="large"
            onClick={handleMicClick}
            isListening={isListening}
            disabled={
              inputMode === 'keyboard' ||
              isSpeaking ||
              !isMyTurn ||
              !!feedbackMap[currentLineIndex]
            }
          >
            <FiMic size={32} />
          </MicButton>

          <CircleButton
            onClick={() => setShowHint(!showHint)}
            isActive={showHint}
            disabled={!isMyTurn || !!feedbackMap[currentLineIndex]}
          >
            <MdLightbulb size={24} />
          </CircleButton>
        </ActionsRow>
      </ControlsContainer>

      {/* Result Modal */}
      {showResultModal && practiceResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '24px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <h2
              style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}
            >
              PRACTICE COMPLETE!
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                margin: '24px 0',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#22c55e',
                  }}
                >
                  {practiceResult.accuracy}%
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#6b7684',
                  }}
                >
                  ACCURACY
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#333d4b',
                  }}
                >
                  {practiceResult.timeSpent}s
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#6b7684',
                  }}
                >
                  TIME
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRetryPractice}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e5e8eb',
                  background: 'white',
                  fontWeight: 700,
                }}
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/scripts')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#333d4b',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
