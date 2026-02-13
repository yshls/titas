import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition && typeof window !== 'undefined') {
  console.warn('Web Speech API not supported');
}

// 마이크 권한 요청
const requestMicrophonePermission = async (
  setPermissionStatus: (status: PermissionState) => void,
): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setPermissionStatus('granted');
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error('[SpeechRecognition] Permission denied', error);
    setPermissionStatus('denied');
    return false;
  }
};

export function useSpeechRecognition(options?: { isMobile: boolean }) {
  const { isMobile } = options || { isMobile: false };
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState>('prompt');

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const autoRestartEnabledRef = useRef(false);

  // Web Speech API 초기화
  useEffect(() => {
    if (!navigator.mediaDevices) {
      console.error('[SpeechRecognition] navigator.mediaDevices not available');
      setPermissionStatus('denied');
      return;
    }

    requestMicrophonePermission(setPermissionStatus);

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = !isMobile; // 짧게 끊어서 인식
    recognition.interimResults = true; // 중간 결과 받기
    recognition.maxAlternatives = 1;

    // 인식 시작
    recognition.onstart = () => {
      setIsListening(true);
    };

    // 음성 인식 결과
    recognition.onresult = (event: any) => {
      let finalText = '';

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        finalText += text + ' ';
      }

      const trimmed = finalText.trim();
      if (trimmed) {
        finalTranscriptRef.current = trimmed;
        setTranscript(trimmed);
      }
    };

    // 에러 처리
    recognition.onerror = (event: any) => {
      console.error('[SpeechRecognition] Error:', event.error);

      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        setPermissionStatus('denied');
      }

      setIsListening(false);
    };

    // 인식 종료 (자동 재시작 포함)
    recognition.onend = () => {
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        setTranscript(finalText);
      }

      setIsListening(false);

      // 연속 인식 효과
      if (autoRestartEnabledRef.current && permissionStatus === 'granted') {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e: any) {
            if (!e.message?.includes('already started')) {
              autoRestartEnabledRef.current = false;
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    // 컴포넌트 언마운트 시 정리
    return () => {
      autoRestartEnabledRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [permissionStatus, isMobile]);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    if (permissionStatus === 'prompt') {
      const granted = await requestMicrophonePermission(setPermissionStatus);
      if (!granted) return;
    }

    if (permissionStatus !== 'granted' || isListening) {
      return;
    }

    if (recognitionRef.current) {
      try {
        setTranscript('');
        finalTranscriptRef.current = '';
        autoRestartEnabledRef.current = true;
        recognitionRef.current.start();
      } catch (e: any) {
        if (!e.message?.includes('already started')) {
          console.error('[SpeechRecognition] Start failed:', e);
          autoRestartEnabledRef.current = false;
        }
      }
    }
  }, [permissionStatus, isListening]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    autoRestartEnabledRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('[SpeechRecognition] Stop failed:', e);
      }
    }

    const finalText = finalTranscriptRef.current.trim();
    if (finalText) {
      setTranscript(finalText);
    }

    setIsListening(false);
  }, []);

  // 텍스트 초기화
  const clearTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  // 권한 재요청
  const requestPermission = useCallback(async () => {
    return await requestMicrophonePermission(setPermissionStatus);
  }, []);

  return {
    transcript,
    isListening,
    permissionStatus,
    startListening,
    stopListening,
    clearTranscript,
    requestPermission,
  };
}
