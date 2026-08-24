import { useState, useRef, useEffect, useCallback, createElement } from 'react';
import toast from 'react-hot-toast';
import { MdKeyboard } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useDevice } from '@/hooks/useDevice';
import { usePracticeStore } from '@/store/practiceStore';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTTS } from '@/hooks/useTTS';
import { checkWordDiff, calculateAccuracy } from '@/utils/diffChecker';
import { transcribeAudio } from '@/api/groqWhisper';

export function useUserInput() {
  const { t } = useTranslation();
  const status = usePracticeStore((state) => state.status);
  const currentLineIndex = usePracticeStore((state) => state.currentLineIndex);
  const currentLine = usePracticeStore(
    (state) => state.lines[state.currentLineIndex],
  );
  const userSpeakerId = usePracticeStore((state) => state.userSpeakerId);
  const addUserInput = usePracticeStore((state) => state.addUserInput);
  const addUserAudio = usePracticeStore((state) => state.addUserAudio);
  const advanceLine = usePracticeStore((state) => state.advanceLine);
  const retryCurrentLine = usePracticeStore((state) => state.retryCurrentLine);

  const isMyTurn =
    status === 'active' && currentLine?.speakerId === userSpeakerId;

  const [inputMode, setInputMode] = useState<'mic' | 'keyboard'>('mic');
  const [typedInput, setTypedInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const { isMobile } = useDevice();

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
    permissionStatus,
  } = useSpeechRecognition({ isMobile });

  const { isSpeaking } = useTTS();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasProcessedCurrentLine = useRef(false);
  const advanceTimerRef = useRef<number | undefined>(undefined);

  // 라인 변경 시 초기화
  useEffect(() => {
    hasProcessedCurrentLine.current = false;
    audioChunksRef.current = [];
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = undefined;
    }
  }, [currentLineIndex]);

  // 음성/텍스트 처리 및 다음 라인 진행
  const processAndAdvance = useCallback(
    async (text: string) => {
      if (!currentLine || isProcessing || hasProcessedCurrentLine.current) {
        return;
      }

      if (!text.trim()) {
        return;
      }

      setIsProcessing(true);
      hasProcessedCurrentLine.current = true;

      // 원본 텍스트와 사용자 입력 비교
      const originalText = currentLine.originalLine
        .replace(/[^\w\s']/g, '')
        .toLowerCase();
      const processedInput = text
        .trim()
        .replace(/[^\w\s']/g, '')
        .toLowerCase();

      if (!processedInput) {
        setIsProcessing(false);
        hasProcessedCurrentLine.current = false;
        return;
      }

      const diff = checkWordDiff(originalText, processedInput);

      // 사용자 입력 저장
      addUserInput(currentLineIndex, text, diff);
      clearTranscript();

      /*
       * 틀린 곳이 있으면 자동으로 넘기지 않는다. 쉐도잉은 틀린 문장을 다시
       * 말해보는 게 핵심인데, 바로 다음 줄로 넘어가면 재시도할 틈이 없다.
       * 정확히 말했을 때만 흐름을 끊지 않고 이어간다.
       */
      const { total, correct } = calculateAccuracy(diff);
      const isPerfect = total > 0 && correct === total;

      if (isPerfect) {
        advanceTimerRef.current = window.setTimeout(() => {
          advanceLine();
          setIsProcessing(false);
        }, 2000);
      } else {
        setIsProcessing(false);
      }
    },
    [
      currentLine,
      isProcessing,
      addUserInput,
      currentLineIndex,
      advanceLine,
      clearTranscript,
    ],
  );

  // 녹음 및 음성 인식 중지
  const stopRecordingAndListening = useCallback(async () => {
    return new Promise<void>((resolve) => {
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
          }
          resolve();
        }
      };

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.onstop = async () => {
          if (audioChunksRef.current.length === 0) {
            cleanup();
            return;
          }

          // 녹음 파일 저장
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          addUserAudio(currentLineIndex, url);

          if (hasProcessedCurrentLine.current) {
            cleanup();
            return;
          }

          let finalTranscript = transcript;

          // Web Speech API 실패 시 Groq Whisper 사용
          if (!finalTranscript || finalTranscript.trim().length === 0) {
            try {
              toast.loading(t('talk.transcribing'), { id: 'stt' });
              finalTranscript = await transcribeAudio(blob);
              toast.dismiss('stt');
            } catch (error) {
              console.error('[Groq] Transcription failed:', error);
              toast.dismiss('stt');
              toast.error(t('talk.sttFailedTypeInstead'));
              setInputMode('keyboard');
              cleanup();
              return;
            }
          }

          // 텍스트 처리
          if (finalTranscript && finalTranscript.trim().length > 0) {
            processAndAdvance(finalTranscript);
          } else {
            toast(t('talk.sttFailedTypeInstead'), {
              icon: createElement(MdKeyboard),
              duration: 2000,
            });
            setInputMode('keyboard');
          }

          cleanup();
        };

        mediaRecorderRef.current.stop();
      } else {
        cleanup();
      }

      if (isListening) {
        stopListening();
      }

      setTimeout(() => cleanup(), 500);
    });
  }, [
    isListening,
    stopListening,
    mediaStream,
    addUserAudio,
    currentLineIndex,
    transcript,
    processAndAdvance,
    setInputMode,
  ]);



  // 녹음 시작
  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMediaStream(stream);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/mp4';

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.start();
    return true;
  }, []);

  const [isPermissionRequestPending, setIsPermissionRequestPending] =
    useState(false);

  // 마이크 권한 요청
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      toast.error(t('talk.micPermissionRequired'));
    }
  }, []);

  // 음성 인식 시작
  const startRecognition = useCallback(async () => {
    if (!isMyTurn) return;
    setTypedInput('');
    const recordingStarted = await startRecording();
    if (recordingStarted) {
      startListening();
    }
  }, [isMyTurn, startRecording, startListening]);

  // 권한 승인 후 자동 시작
  useEffect(() => {
    if (permissionStatus === 'granted' && isPermissionRequestPending) {
      startRecognition();
      setIsPermissionRequestPending(false);
    }
  }, [permissionStatus, isPermissionRequestPending, startRecognition]);

  // 마이크 버튼 클릭
  const handleMicClick = useCallback(async () => {
    if (isSpeaking) return;

    if (isListening) {
      stopRecordingAndListening();
      return;
    }

    if (permissionStatus === 'denied') {
      toast.error(t('talk.micPermissionDenied'));
      return;
    }

    if (permissionStatus === 'prompt') {
      setIsPermissionRequestPending(true);
      await requestPermission();
      return;
    }

    if (permissionStatus === 'granted') {
      startRecognition();
    }
  }, [
    isSpeaking,
    isListening,
    stopRecordingAndListening,
    permissionStatus,
    requestPermission,
    startRecognition,
  ]);

  // 방금 말한 문장을 지우고 다시 말할 수 있게 되돌린다.
  const handleRetryLine = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = undefined;
    }
    retryCurrentLine();
    clearTranscript();
    setTypedInput('');
    // 이 값이 true로 남아 있으면 다시 말해도 결과가 반영되지 않는다.
    hasProcessedCurrentLine.current = false;
    setIsProcessing(false);
  }, [retryCurrentLine, clearTranscript]);

  // 결과를 확인한 뒤 사용자가 직접 다음 문장으로 넘어간다.
  const handleAdvanceLine = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = undefined;
    }
    advanceLine();
    setIsProcessing(false);
  }, [advanceLine]);

  // 키보드 입력 제출
  const handleKeyboardSubmit = useCallback(() => {
    if (typedInput.trim()) {
      processAndAdvance(typedInput);
      setTypedInput('');
    }
  }, [typedInput, processAndAdvance]);

  return {
    inputMode,
    setInputMode,
    typedInput,
    setTypedInput,
    transcript,
    isListening,
    isProcessing,
    isSpeaking,
    mediaStream,
    handleMicClick,
    handleKeyboardSubmit,
    handleRetryLine,
    handleAdvanceLine,
    stopRecordingAndListening,
  };
}
