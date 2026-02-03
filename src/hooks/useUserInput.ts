import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { usePracticeStore } from '@/store/practiceStore';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';
import { useTTS } from '@/utils/useTTS';
import { checkWordDiff } from '@/utils/diffChecker';

export function useUserInput() {
  // --- 스토어 상태 선택
  const status = usePracticeStore((state) => state.status);
  const currentLineIndex = usePracticeStore((state) => state.currentLineIndex);
  const currentLine = usePracticeStore(
    (state) => state.lines[state.currentLineIndex],
  );
  const userSpeakerId = usePracticeStore((state) => state.userSpeakerId);
  const addUserInput = usePracticeStore((state) => state.addUserInput);
  const addUserAudio = usePracticeStore((state) => state.addUserAudio);
  const advanceLine = usePracticeStore((state) => state.advanceLine);

  const isMyTurn =
    status === 'active' && currentLine?.speakerId === userSpeakerId; // --- 내부 UI 상태

  const [inputMode, setInputMode] = useState<'mic' | 'keyboard'>('mic');
  const [typedInput, setTypedInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null); // --- 외부 훅

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
    permissionStatus,
  } = useSpeechRecognition();

  const { isSpeaking } = useTTS(); // --- Ref

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasProcessedCurrentLine = useRef(false); // 라인 변경 시 처리 플래그 초기화

  useEffect(() => {
    hasProcessedCurrentLine.current = false;
  }, [currentLineIndex]); // 디버깅: transcript 변화 추적

  useEffect(() => {
    console.log('🔵 [useUserInput] transcript changed:', transcript);
    console.log('🔵 [useUserInput] isListening:', isListening);
    console.log('🔵 [useUserInput] isMyTurn:', isMyTurn);
  }, [transcript, isListening, isMyTurn]); // --- 핵심 로직: 녹음 및 음성 인식 중지

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
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, {
            type: 'audio/webm',
          });
          const url = URL.createObjectURL(blob);
          addUserAudio(currentLineIndex, url);
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
  }, [isListening, stopListening, mediaStream, addUserAudio, currentLineIndex]); // --- 핵심 로직: 입력 처리 및 다음 라인 진행

  const processAndAdvance = useCallback(
    async (text: string) => {
      if (!currentLine || isProcessing || hasProcessedCurrentLine.current) {
        console.log('⚠️ [processAndAdvance] Skipped:', {
          hasCurrentLine: !!currentLine,
          isProcessing,
          hasProcessed: hasProcessedCurrentLine.current,
        });
        return;
      }

      if (!text.trim()) {
        toast.error("Oops! I didn't catch that. Could you please try again?");
        await stopRecordingAndListening();
        return;
      }

      console.log('✅ [processAndAdvance] Starting to process:', text);
      setIsProcessing(true);
      hasProcessedCurrentLine.current = true;
      await stopRecordingAndListening();

      const originalText = currentLine.originalLine
        .replace(/[^\w\s']/g, '')
        .toLowerCase();
      const processedInput = text
        .trim()
        .replace(/[^\w\s']/g, '')
        .toLowerCase();

      if (!processedInput) {
        setIsProcessing(false);
        return;
      }

      console.log('📊 [processAndAdvance] Comparing:', {
        original: originalText,
        spoken: processedInput,
      });

      const diff = checkWordDiff(originalText, processedInput);
      console.log('📊 [processAndAdvance] Diff result:', diff);

      addUserInput(currentLineIndex, text, diff);
      clearTranscript();

      setTimeout(() => {
        advanceLine();
        setIsProcessing(false);
      }, 2000);
    },
    [
      currentLine,
      isProcessing,
      stopRecordingAndListening,
      addUserInput,
      currentLineIndex,
      advanceLine,
      clearTranscript,
    ],
  ); // --- 자동 제출: transcript가 완성되면 자동으로 처리

  useEffect(() => {
    console.log('🟢 [Auto-submit check]', {
      hasTranscript: !!transcript,
      transcriptLength: transcript.length,
      notListening: !isListening,
      isMyTurn,
      hasProcessed: hasProcessedCurrentLine.current,
    }); // transcript가 있고, 음성 인식이 끝났고, 내 차례이고, 아직 처리 안 했을 때

    if (
      transcript &&
      transcript.trim().length > 0 &&
      !isListening &&
      isMyTurn &&
      !hasProcessedCurrentLine.current
    ) {
      console.log('✅ [Auto-submit] Conditions met! Processing...');
      processAndAdvance(transcript);
    }
  }, [transcript, isListening, isMyTurn, processAndAdvance]); // --- 녹음 시작

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
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      addUserAudio(currentLineIndex, url);
    };
    recorder.start();
    return true;
  }, [addUserAudio, currentLineIndex]); // --- 권한 관리

  const [isPermissionRequestPending, setIsPermissionRequestPending] =
    useState(false);

  const requestPermission = useCallback(async () => {
    console.log('[useUserInput] Requesting microphone permission...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[useUserInput] Permission granted.');
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error('[useUserInput] Permission denied.', error);
      toast.error('Microphone access is required to use voice input.');
    }
  }, []); // --- 음성 인식 시작

  const startRecognition = useCallback(async () => {
    if (!isMyTurn) return;
    setTypedInput('');
    const recordingStarted = await startRecording();
    if (recordingStarted) {
      startListening();
    }
  }, [isMyTurn, startRecording, startListening]); // 권한 승인 후 자동 시작

  useEffect(() => {
    if (permissionStatus === 'granted' && isPermissionRequestPending) {
      startRecognition();
      setIsPermissionRequestPending(false);
    }
  }, [permissionStatus, isPermissionRequestPending, startRecognition]); // --- 이벤트 핸들러: 마이크 버튼 클릭

  const handleMicClick = async () => {
    if (isSpeaking) return;

    if (isListening) {
      console.log('🛑 [handleMicClick] Stopping...');
      stopRecordingAndListening();
      return;
    }

    if (permissionStatus === 'denied') {
      toast.error(
        'Microphone access is denied. Please enable it in your browser settings.',
      );
      return;
    }

    if (permissionStatus === 'prompt') {
      setIsPermissionRequestPending(true);
      await requestPermission();
      return;
    }

    if (permissionStatus === 'granted') {
      console.log('🎤 [handleMicClick] Starting recognition...');
      startRecognition();
    }
  }; // --- 이벤트 핸들러: 키보드 제출

  const handleKeyboardSubmit = () => {
    if (typedInput.trim()) {
      processAndAdvance(typedInput);
      setTypedInput('');
    }
  };

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
    stopRecordingAndListening,
  };
}
