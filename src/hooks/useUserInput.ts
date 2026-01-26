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
    status === 'active' && currentLine?.speakerId === userSpeakerId;

  // --- 내부 UI 상태
  const [inputMode, setInputMode] = useState<'mic' | 'keyboard'>('mic');
  const [typedInput, setTypedInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // --- 외부 훅
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();
  const { isSpeaking } = useTTS();

  // --- Ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasProcessedCurrentLine = useRef(false);

  useEffect(() => {
    // 라인 변경 시 처리 플래그 초기화
    hasProcessedCurrentLine.current = false;
  }, [currentLineIndex]);

  // --- 핵심 로직
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
  }, [isListening, stopListening, mediaStream, addUserAudio, currentLineIndex]);

  const processAndAdvance = useCallback(
    async (text: string) => {
      if (!currentLine || isProcessing || hasProcessedCurrentLine.current)
        return;

      if (!text.trim()) {
        toast.error("Oops! I didn't catch that. Could you please try again?");
        await stopRecordingAndListening();
        return;
      }

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

      const diff = checkWordDiff(originalText, processedInput);
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
  );

  const startRecording = useCallback(async () => {
    try {
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
    } catch (e) {
      toast.error(
        'Oh, seems your microphone is shy! Could you please give it permissions?',
      );
      return false;
    }
  }, [addUserAudio, currentLineIndex]);

  // --- 이펙트
  useEffect(() => {
    // 음성 인식 결과 처리
    if (transcript && !isListening && isMyTurn && status === 'active') {
      processAndAdvance(transcript);
    }
  }, [transcript, isListening, isMyTurn, status, processAndAdvance]);

  // --- 핸들러
  const handleMicClick = async () => {
    if (isSpeaking) return;

    if (isListening) {
      stopRecordingAndListening();
    } else {
      if (!isMyTurn) return;
      setTypedInput('');
      const recordingStarted = await startRecording();
      if (recordingStarted) {
        startListening();
      }
    }
  };

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
    isListening,
    isProcessing,
    isSpeaking,
    mediaStream,
    handleMicClick,
    handleKeyboardSubmit,
    stopRecordingAndListening,
  };
}
