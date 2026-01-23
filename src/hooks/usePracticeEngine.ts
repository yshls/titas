import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { DialogueLine, WeakSpot, PracticeLog } from '@/utils/types';
import { checkWordDiff, type DiffResult } from '@/utils/diffChecker';
import { useTTS } from '@/utils/useTTS';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';
import { useAppStore } from '@/store/appStore';
import { addPracticeLog as addPracticeLogLocally } from '@/utils/storageService';

const PALETTE = [
  '#e8f3ff', // blue50
  '#ffeeee', // red50
  '#f0faf6', // green50
  '#fff8e1', // amber50
  '#f3e5f5', // purple50
];

interface PracticeEngineProps {
  lines: DialogueLine[];
  scriptId: string;
  title: string;
}

export function usePracticeEngine({
  lines: initialScriptLines,
  scriptId,
  title,
}: PracticeEngineProps) {
  const navigate = useNavigate();
  const addNewPracticeLog = useAppStore((state) => state.addNewPracticeLog);

  const isSavedRef = useRef(false);

  // 핵심 상태
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userSpeakerId, setUserSpeakerId] = useState<string | null>(null);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // UI 상태
  const [inputMode, setInputMode] = useState<'mic' | 'keyboard'>('mic');
  const [typedInput, setTypedInput] = useState('');
  const [showHint, setShowHint] = useState(false);

  // 데이터 상태
  const [feedbackMap, setFeedbackMap] = useState<Record<number, DiffResult[]>>(
    {},
  );
  const [userInputMap, setUserInputMap] = useState<Record<number, string>>({});
  const [sessionErrors, setSessionErrors] = useState<WeakSpot[]>([]);
  const [practiceResult, setPracticeResult] = useState<{
    accuracy: number;
    timeSpent: number;
  } | null>(null);
  const [userAudioMap, setUserAudioMap] = useState<Record<number, string>>({});

  // 외부 훅
  const { transcript, isListening, startListening, stopListening } =
    useSpeechRecognition();
  const { speak, isSpeaking } = useTTS();

  // 미디어와 녹음
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isMicActivatedForCurrentLine, setIsMicActivatedForCurrentLine] =
    useState(false);

  // 메모
  const speakerIds = useMemo(
    () => [...new Set(initialScriptLines.map((l) => l.speakerId))],
    [initialScriptLines],
  );

  const speakerColors = useMemo(() => {
    const colors: Record<string, string> = {};
    speakerIds.forEach((id, index) => {
      colors[id] = PALETTE[index % PALETTE.length];
    });
    return colors;
  }, [speakerIds]);

  const isFinished = currentLineIndex >= initialScriptLines.length;
  const isMyTurn =
    !isFinished &&
    initialScriptLines[currentLineIndex].speakerId === userSpeakerId;

  // 핵심 로직
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (isListening) {
      stopListening();
    }
  }, [isListening, stopListening]);

  const processInput = useCallback(
    (text: string) => {
      const currentLine = initialScriptLines[currentLineIndex];
      if (!currentLine || !text.trim()) return;

      stopRecording();

      const originalText = currentLine.originalLine
        .replace(/[^\w\s']/g, '')
        .toLowerCase();
      const spokenText = text
        .trim()
        .replace(/[^\w\s']/g, '')
        .toLowerCase();

      if (!spokenText) return;

      const diff = checkWordDiff(originalText, spokenText);

      setFeedbackMap((p) => ({ ...p, [currentLineIndex]: diff }));
      setUserInputMap((p) => ({ ...p, [currentLineIndex]: text }));

      const errors: WeakSpot[] = diff
        .filter((p) => p.status === 'removed' || p.status === 'added')
        .map((p) => ({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          original: p.status === 'removed' ? p.value : '',
          spoken: p.status === 'added' ? p.value : '',
          scriptId: scriptId,
          lineContent: currentLine.originalLine,
        }));

      setSessionErrors((p) => [...p, ...errors]);
      setIsMicActivatedForCurrentLine(false);

      setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
        setShowHint(false);
      }, 2000);
    },
    [currentLineIndex, initialScriptLines, scriptId, stopRecording],
  );

  // 오디오 녹음
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
      toast.error(
        'Oh, seems your microphone is shy! Could you please give it permissions in the browser settings?',
      );
    }
  };

  // 이펙트
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

      speak(line.originalLine, null, () => {
        setCurrentLineIndex((i) => i + 1);
      });
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
  ]);

  useEffect(() => {
    if (
      isFinished &&
      isPracticeStarted &&
      !showFinishModal &&
      !isSavedRef.current
    ) {
      const user = useAppStore.getState().user;

      let totalWords = 0;
      let correctWords = 0;
      Object.values(feedbackMap).forEach((diff) => {
        diff.forEach((part) => {
          if (part.status !== 'added') totalWords++;
          if (part.status === 'correct') correctWords++;
        });
      });
      const accuracy =
        totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const newLog: PracticeLog = {
        id: crypto.randomUUID(),
        date: Date.now(),
        scriptId: scriptId,
        accuracy,
        timeSpent,
        errors: sessionErrors,
      };

      if (user) {
        addNewPracticeLog(newLog, title || 'Practice Session');
        toast.success('Practice complete! Progress saved to your account.');
      } else {
        addPracticeLogLocally(newLog);
        toast.success('Practice complete! Progress saved to this browser.');
      }

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
    scriptId,
    title,
    startTime,
    feedbackMap,
  ]);

  // UI 이벤트 핸들러
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
    toast.success("Alright, let's go again! Round two.");
  };

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

  const handleSendTypedInput = () => {
    if (typedInput.trim()) {
      processInput(typedInput);
      setTypedInput('');
    }
  };

  const handleStopPractice = () => {
    stopRecording();
    navigate(-1);
  };

  return {
    // 상태와 메모
    isPracticeStarted,
    isFinished,
    isMyTurn,
    isSpeaking,
    isListening,
    mediaStream,
    speakerIds,
    speakerColors,
    currentLineIndex,
    lines: initialScriptLines,
    feedbackMap,
    userInputMap,
    userAudioMap,
    inputMode,
    typedInput,
    showHint,
    showFinishModal,
    practiceResult,
    userSpeakerId,

    // 상태 설정자
    setInputMode,
    setTypedInput,
    setShowHint,
    setShowFinishModal,

    // 핸들러
    handleStartPractice,
    handleRetryPractice,
    handleStopPractice,
    handleMicClick,
    handleSendTypedInput,
    speak,
  };
}
