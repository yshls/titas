import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import type { DialogueLine, WeakSpot, PracticeLog } from '@/utils/types';
import { checkWordDiff, type DiffResult } from '@/utils/diffChecker';
import { useTTS } from '@/utils/useTTS';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';
import { useAppStore, type AppState } from '@/store/appStore';
import { FiMic, FiSend, FiX, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import {
  MdKeyboard,
  MdLightbulb,
  MdVolumeUp,
  MdPlayArrow,
  MdArrowBack,
  MdClose,
  MdPerson,
} from 'react-icons/md';

// --- 애니메이션 정의 ---

const floatUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.95); }
  70% { transform: scale(1); }
  100% { transform: scale(0.95); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

// --- 상수 정의 ---

const PALETTE = [
  '#e8f3ff', // blue50
  '#ffeeee', // red50
  '#f0faf6', // green50
  '#fff8e1', // amber50
  '#f3e5f5', // purple50
];

const DIFF_COLOR_MAP = {
  correct: 'color: #2e7d32; font-weight: 700;',
  removed: 'color: #d32f2f; font-weight: 700;',
  added: 'color: #666; text-decoration: line-through;',
  neutral: 'color: #333;',
};

// --- 스타일 정의 ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};
  font-family: 'lato', sans-serif;
  overflow: hidden;
  position: relative;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 20;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderTitle = styled.span`
  font-weight: 700;
  font-size: 16px;
  color: #333;
`;

const BackButton = styled.button`
  padding: 8px;
  margin-left: -8px;
  border-radius: 50%;
  color: ${({ theme }) => theme.textMain};
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ProgressPill = styled.div`
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.textSub};
  font-feature-settings: 'tnum';
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-behavior: smooth;
`;

const MessageRow = styled.div<{ isRight: boolean }>`
  display: flex;
  justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
  width: 100%;
`;

const BubbleContainer = styled.div<{ isRight: boolean }>`
  display: flex;
  flex-direction: column;
  max-width: 85%;
  align-items: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
  animation: ${floatUp} 0.3s ease-out;
`;

const MessageBubble = styled.div<{ isRight: boolean; bgColor: string }>`
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  font-size: 16px;
  line-height: 1.5;
  word-break: break-word;
  background-color: ${({ bgColor }) => bgColor};
  color: #333d4b;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.03);
  min-width: 120px;

  ${({ isRight }) =>
    isRight
      ? css`
          border-top-right-radius: 4px;
        `
      : css`
          border-top-left-radius: 4px;
        `}
`;

const BubbleHeader = styled.div<{ isRight: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  opacity: 0.6;
  gap: 8px;
  flex-direction: ${({ isRight }) => (isRight ? 'row-reverse' : 'row')};
`;

const SpeakerName = styled.span`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SpeakerIconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
  color: inherit;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const UserInputText = styled.div`
  margin-bottom: 6px;
  font-weight: 600;
`;

const DialogueText = styled.div`
  font-size: 16px;
  line-height: 1.5;
  font-weight: 500;
`;

const BlurredText = styled.div`
  font-size: 16px;
  line-height: 1.5;
  filter: blur(6px);
  user-select: none;
  opacity: 0.5;
  cursor: default;
`;

const FeedbackContainer = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 15px;
  line-height: 1.6;
`;

const Highlight = styled.span<{
  type: 'correct' | 'wrong' | 'added' | 'neutral' | 'removed';
}>`
  font-weight: 600;
  padding: 0 2px;

  ${({ type }) => type === 'correct' && DIFF_COLOR_MAP.correct}
  ${({ type }) => type === 'removed' && DIFF_COLOR_MAP.removed}
  ${({ type }) => type === 'added' && DIFF_COLOR_MAP.added}
  ${({ type }) => type === 'neutral' && DIFF_COLOR_MAP.neutral}
`;

const HintText = styled.span`
  opacity: 0.5;
`;

// const ListeningText = styled.span`
//   opacity: 0.5;
//   font-style: italic;
// `;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 10px;
  justify-content: flex-end;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  color: #555;
  transition: all 0.2s;

  &:hover {
    background-color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const FloatingBarWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 20px 34px 20px;
  display: flex;
  justify-content: center;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 30%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 30;
`;

const FloatingIsland = styled.div`
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 6px 6px 6px 10px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  width: 100%;
  max-width: 300px;
  justify-content: space-between;
  transform: translateZ(0);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const SideButton = styled.button<{ active?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ active, theme }) => (active ? theme.textMain : '#9DAAB8')};
  background: ${({ active }) => (active ? '#F2F4F6' : 'transparent')};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #f2f4f6;
    color: ${({ theme }) => theme.textMain};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const HeroMicButton = styled.button<{ isListening: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 4px solid white;
  cursor: pointer;

  ${({ isListening, theme }) =>
    isListening
      ? css`
          background-color: ${theme.colors.error};
          color: white;
          animation: ${pulseRing} 2s infinite;
        `
      : css`
          background-color: ${theme.colors.primary};
          color: white;
          &:hover {
            transform: scale(1.08);
          }
        `}

  &:disabled {
    filter: grayscale(100%);
    opacity: 0.5;
    cursor: not-allowed;
    animation: none;
    transform: none;
  }
`;

const KeyboardInputWrapper = styled.div`
  pointer-events: auto;
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 10px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 16px;
  background: #f2f4f6;
  border: none;
  font-size: 16px;
  &:focus {
    outline: none;
    background: #eaecef;
  }
`;

const SendBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
  border: none;
  cursor: pointer;
  &:active {
    transform: scale(0.9);
  }
  &:disabled {
    background: #e1e4e8;
    cursor: not-allowed;
  }
`;

const RoleSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  height: 100%;
  flex-direction: column;
`;

const RoleTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 10px;
  color: #333d4b;
`;

const RoleSubtitle = styled.p`
  color: #8b95a1;
  margin-bottom: 40px;
`;

const RoleGrid = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const RoleButton = styled.button`
  width: 140px;
  height: 160px;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  }
`;

const RoleAvatarCircle = styled.div<{ bgColor: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ bgColor }) => bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 16px;
`;

const RoleName = styled.span`
  font-weight: 700;
  font-size: 16px;
  color: #333d4b;
`;

const VisualizerBars = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 24px;
`;

const Bar = styled.div<{ height: number }>`
  width: 4px;
  background-color: white;
  border-radius: 4px;
  height: ${({ height }) => Math.max(4, height)}px;
  transition: height 0.05s ease;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 24px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: ${scaleUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #9daab8;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  &:hover {
    background: #f2f4f6;
    color: #333;
  }
`;

const ModalIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #e8f5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-size: 32px;
  margin: 0 auto 16px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #333;
  margin-bottom: 8px;
`;

const ModalText = styled.p`
  color: #6b7684;
  margin-bottom: 24px;
  font-size: 15px;
`;

const ModalButtonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
  &:active {
    transform: scale(0.98);
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: #f2f4f6;
  color: #4e5968;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  &:hover {
    background: #e5e8eb;
  }
`;

const AudioVisualizer = ({ stream }: { stream: MediaStream }) => {
  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0]);

  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | undefined>(undefined);

  useEffect(() => {
    if (!stream) return;
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 32;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      const bars = [
        dataArray[0],
        dataArray[2],
        dataArray[4],
        dataArray[6],
        dataArray[8],
      ].map((v) => (v / 255) * 32);
      setData(bars);
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      ctx.close();
    };
  }, [stream]);

  return (
    <VisualizerBars>
      {data.map((h, i) => (
        <Bar key={i} height={h} />
      ))}
    </VisualizerBars>
  );
};

// --- 메인 컴포넌트 ---

export function TalkPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const addNewPracticeLog = useAppStore(
    (state: AppState) => state.addNewPracticeLog,
  );
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isSavedRef = useRef(false);

  // 상태 관리
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [userAudioMap, setUserAudioMap] = useState<Record<number, string>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const initialScriptLines: DialogueLine[] = useMemo(
    () => location.state?.lines || [],
    [location.state],
  );
  const speakerIds = useMemo(
    () => [...new Set(initialScriptLines.map((l) => l.speakerId))],
    [initialScriptLines],
  );

  // 색상 매핑
  const speakerColors = useMemo(() => {
    const colors: Record<string, string> = {};
    speakerIds.forEach((id, index) => {
      colors[id] = PALETTE[index % PALETTE.length];
    });
    return colors;
  }, [speakerIds]);

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userSpeakerId, setUserSpeakerId] = useState<string | null>(null);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [inputMode, setInputMode] = useState<'mic' | 'keyboard'>('mic');
  const [typedInput, setTypedInput] = useState('');
  const [showHint, setShowHint] = useState(false);

  const [selectedVoiceURI] = useState<string | null>(null);

  // 마이크 활성 체크
  const [isMicActivatedForCurrentLine, setIsMicActivatedForCurrentLine] =
    useState(false);

  // 결과 모달 상태
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{
    accuracy: number;
    timeSpent: number;
  } | null>(null);

  const [feedbackMap, setFeedbackMap] = useState<Record<number, DiffResult[]>>(
    {},
  );
  const [userInputMap, setUserInputMap] = useState<Record<number, string>>({});
  const [sessionErrors, setSessionErrors] = useState<WeakSpot[]>([]);
  const [startTime, setStartTime] = useState(Date.now());

  const { transcript, isListening, startListening, stopListening } =
    useSpeechRecognition();
  const { speak, isSpeaking } = useTTS();

  const isFinished = currentLineIndex >= initialScriptLines.length;
  const isMyTurn =
    !isFinished &&
    initialScriptLines[currentLineIndex].speakerId === userSpeakerId;

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setUserAudioMap((prev) => ({ ...prev, [currentLineIndex]: url }));
        stream.getTracks().forEach((t) => t.stop());
        setMediaStream(null);
      };
      recorder.start();
    } catch (e) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording')
      mediaRecorderRef.current.stop();
    if (isListening) stopListening();
  }, [isListening, stopListening]);

  const handleMicClick = () => {
    if (!isMyTurn || isSpeaking) return;
    if (isListening) {
      stopRecording();
    } else {
      setTypedInput('');
      setIsMicActivatedForCurrentLine(true);
      startListening();
      startRecording();
    }
  };

  // 입력 처리
  const processInput = useCallback(
    (text: string) => {
      const currentLine = initialScriptLines[currentLineIndex];
      if (!currentLine) return;
      stopRecording();

      const diff = checkWordDiff(
        currentLine.originalLine.replace(/[^\w\s]/g, ''),
        text,
      );
      setFeedbackMap((p) => ({ ...p, [currentLineIndex]: diff }));
      setUserInputMap((p) => ({ ...p, [currentLineIndex]: text }));

      const errors: WeakSpot[] = diff
        .filter((p) => p.status === 'removed' || p.status === 'added')
        .map(
          (p) =>
            ({
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              original: p.status === 'removed' ? p.value : '',
              spoken: p.status === 'added' ? p.value : '',
              scriptId: location.state?.scriptId || 'unknown',
              lineContent: currentLine.originalLine,
            }) as unknown as WeakSpot,
        );

      setSessionErrors((p) => [...p, ...errors]);

      // 입력 후 마이크 비활성
      setIsMicActivatedForCurrentLine(false);

      setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
        setShowHint(false);
      }, 2000);
    },
    [currentLineIndex, stopRecording, location.state, initialScriptLines],
  );

  // 음성 인식 결과 처리
  useEffect(() => {
    if (
      transcript &&
      !isListening &&
      isMyTurn &&
      !feedbackMap[currentLineIndex] &&
      isMicActivatedForCurrentLine
    ) {
      processInput(transcript);
    }
  }, [
    transcript,
    isListening,
    isMyTurn,
    currentLineIndex,
    feedbackMap,
    processInput,
    isMicActivatedForCurrentLine,
  ]);

  // 상대방 턴 자동 재생
  useEffect(() => {
    if (
      isPracticeStarted &&
      !isFinished &&
      !isMyTurn &&
      !isSpeaking &&
      !showFinishModal
    ) {
      const line = initialScriptLines[currentLineIndex];
      if (!line) return;

      speak(line.originalLine, selectedVoiceURI, () => {});

      const duration = Math.max(2000, line.originalLine.length * 80);
      const timer = setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [
    currentLineIndex,
    isMyTurn,
    isPracticeStarted,
    isFinished,
    speak,
    isSpeaking,
    showFinishModal,
    initialScriptLines,
    selectedVoiceURI,
  ]);

  // 자동 스크롤
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [currentLineIndex, feedbackMap]);

  // 종료 처리
  useEffect(() => {
    if (
      isFinished &&
      isPracticeStarted &&
      !showFinishModal &&
      !isSavedRef.current
    ) {
      const user = useAppStore.getState().user;

      if (!user) {
        toast.error('Login required to save progress.');
        return;
      }

      // 정확도 계산
      let totalWords = 0;
      let correctWords = 0;
      Object.values(feedbackMap).forEach((diff) => {
        diff.forEach((part) => {
          if (part.status !== 'added') totalWords++;
          if (part.status === 'correct') correctWords++;
        });
      });
      const accuracy =
        totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const cleanErrors = sessionErrors.map((err) => ({
        id: err.id || crypto.randomUUID(),
        timestamp: err.timestamp || Date.now(),
        original: err.original || '',
        spoken: err.spoken || '',
        scriptId: err.scriptId || location.state?.scriptId || '', // camelCase
        lineContent: (err as any).lineContent || '', // camelCase
      }));

      const newLog: PracticeLog = {
        id: crypto.randomUUID(),
        date: Date.now(),
        scriptId: location.state?.scriptId || 'unknown',
        accuracy,
        timeSpent,
        errors: cleanErrors,
      };

      addNewPracticeLog(newLog, location.state?.title || 'Practice Session');

      setPracticeResult({ accuracy, timeSpent });
      isSavedRef.current = true;
      setShowFinishModal(true);
    }
  }, [
    isFinished,
    isPracticeStarted,
    showFinishModal,
    addNewPracticeLog,
    sessionErrors,
    location.state,
    startTime,
    feedbackMap,
  ]);

  const handleStartPractice = (speakerId: string) => {
    setUserSpeakerId(speakerId);
    setIsPracticeStarted(true);
    setStartTime(Date.now());
    setCurrentLineIndex(0);
    setFeedbackMap({});
    setUserInputMap({});
    setSessionErrors([]);
    setIsMicActivatedForCurrentLine(false);
    isSavedRef.current = false;
  };

  const handleRetryPractice = () => {
    setShowFinishModal(false);
    setCurrentLineIndex(0);
    setFeedbackMap({});
    setUserInputMap({});
    setSessionErrors([]);
    setStartTime(Date.now());
    setIsMicActivatedForCurrentLine(false);
    isSavedRef.current = false;
    toast.success('Restarting practice...');
  };

  // 역할 선택 화면
  if (!isPracticeStarted) {
    return (
      <PageContainer>
        <RoleSelectionContainer>
          <RoleTitle>Who are you?</RoleTitle>
          <RoleSubtitle>Select your role to start speaking.</RoleSubtitle>
          <RoleGrid>
            {speakerIds.map((id) => (
              <RoleButton key={id} onClick={() => handleStartPractice(id)}>
                <RoleAvatarCircle bgColor={speakerColors[id]}>
                  <MdPerson />
                </RoleAvatarCircle>
                <RoleName>{id}</RoleName>
              </RoleButton>
            ))}
          </RoleGrid>
        </RoleSelectionContainer>
      </PageContainer>
    );
  }

  // 연습 화면
  return (
    <PageContainer>
      <Toaster position="top-center" />

      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            <MdArrowBack size={24} />
          </BackButton>
          <HeaderTitle>Talking Practice</HeaderTitle>
        </HeaderLeft>
        <ProgressPill>
          {Math.min(currentLineIndex + 1, initialScriptLines.length)} /{' '}
          {initialScriptLines.length}
        </ProgressPill>
      </Header>

      <ChatContainer ref={chatContainerRef}>
        {/* 현재 대화까지만 렌더링 */}
        {initialScriptLines
          .slice(0, isFinished ? undefined : currentLineIndex + 1)
          .map((line, idx) => {
            const isUser = line.speakerId === userSpeakerId;
            const feedback = feedbackMap[idx];
            const hasAudio = !!userAudioMap[idx];

            // 화자 색상 적용
            const bubbleColor = speakerColors[line.speakerId];

            // 연속된 화자 확인 (헤더 생략 로직)
            const prevLine = initialScriptLines[idx - 1];
            const isSameSpeakerAsPrev =
              idx > 0 && prevLine?.speakerId === line.speakerId;

            return (
              <MessageRow key={idx} isRight={isUser}>
                <BubbleContainer isRight={isUser}>
                  <MessageBubble
                    isRight={isUser}
                    bgColor={bubbleColor}
                    style={
                      isSameSpeakerAsPrev
                        ? {
                            marginTop: '2px',
                            borderTopLeftRadius: isUser ? '18px' : '4px',
                            borderTopRightRadius: isUser ? '4px' : '18px',
                          }
                        : {}
                    }
                  >
                    {/* 이전과 다른 화자일 때만 헤더 표시 */}
                    {!isSameSpeakerAsPrev && (
                      <BubbleHeader isRight={isUser}>
                        <SpeakerName>{line.speakerId}</SpeakerName>
                        <SpeakerIconBtn
                          onClick={() =>
                            speak(line.originalLine, selectedVoiceURI)
                          }
                          aria-label="Listen"
                        >
                          <MdVolumeUp size={14} />
                        </SpeakerIconBtn>
                      </BubbleHeader>
                    )}

                    {isUser ? (
                      <>
                        {feedback ? (
                          <>
                            <UserInputText>{userInputMap[idx]}</UserInputText>
                            <FeedbackContainer>
                              {feedback.map((p, i) => (
                                <Highlight key={i} type={p.status as any}>
                                  {p.value}{' '}
                                </Highlight>
                              ))}
                            </FeedbackContainer>
                          </>
                        ) : showHint ? (
                          <HintText>{line.originalLine}</HintText>
                        ) : (
                          <BlurredText>{line.originalLine}</BlurredText>
                        )}
                      </>
                    ) : (
                      <DialogueText>{line.originalLine}</DialogueText>
                    )}
                  </MessageBubble>

                  {isUser && hasAudio && (
                    <ActionButtons>
                      <ActionBtn
                        onClick={() => {
                          const audio = new Audio(userAudioMap[idx]);
                          audio.play();
                        }}
                      >
                        <MdPlayArrow size={14} /> My Voice
                      </ActionBtn>
                    </ActionButtons>
                  )}
                </BubbleContainer>
              </MessageRow>
            );
          })}
      </ChatContainer>

      {!isFinished && (
        <FloatingBarWrapper>
          {inputMode === 'mic' ? (
            <FloatingIsland>
              <SideButton onClick={() => setInputMode('keyboard')}>
                <MdKeyboard size={24} />
              </SideButton>

              <HeroMicButton
                isListening={isListening}
                onClick={handleMicClick}
                disabled={!isMyTurn || !!feedbackMap[currentLineIndex]}
              >
                {isListening && mediaStream ? (
                  <AudioVisualizer stream={mediaStream} />
                ) : (
                  <FiMic size={28} />
                )}
              </HeroMicButton>

              <SideButton
                active={showHint}
                onClick={() => setShowHint(!showHint)}
                disabled={!isMyTurn}
              >
                <MdLightbulb size={24} />
              </SideButton>
            </FloatingIsland>
          ) : (
            <KeyboardInputWrapper>
              <SideButton onClick={() => setInputMode('mic')}>
                <FiX size={20} />
              </SideButton>
              <StyledInput
                placeholder="Type your sentence..."
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && typedInput.trim()) {
                    processInput(typedInput);
                    setTypedInput('');
                  }
                }}
                autoFocus
              />
              <SendBtn
                onClick={() => {
                  if (typedInput.trim()) {
                    processInput(typedInput);
                    setTypedInput('');
                  }
                }}
                disabled={!typedInput.trim()}
              >
                <FiSend size={18} />
              </SendBtn>
            </KeyboardInputWrapper>
          )}
        </FloatingBarWrapper>
      )}

      {showFinishModal && practiceResult && (
        <ModalOverlay onClick={() => setShowFinishModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowFinishModal(false)}>
              <MdClose size={20} />
            </CloseButton>
            <ModalIcon>
              <FiCheckCircle />
            </ModalIcon>
            <ModalTitle>Practice Complete!</ModalTitle>
            <ModalText>
              Accuracy: {practiceResult.accuracy}% <br />
              Time: {Math.floor(practiceResult.timeSpent / 60)}m{' '}
              {practiceResult.timeSpent % 60}s
            </ModalText>
            <ModalButtonStack>
              <PrimaryButton onClick={() => navigate('/review')}>
                Review Results
              </PrimaryButton>
              <SecondaryButton onClick={handleRetryPractice}>
                <FiRefreshCw
                  style={{ marginRight: 6, position: 'relative', top: 2 }}
                />
                Try Again
              </SecondaryButton>
            </ModalButtonStack>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}
