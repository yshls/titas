import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API 브라우저 호환성 타입 선언
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// API 미지원 브라우저 경고
if (!SpeechRecognition && typeof window !== 'undefined') {
  console.warn(
    'Your browser does not support the Web Speech API. Please use Chrome.',
  );
}

// ✅ 모바일 감지
const isMobile =
  typeof window !== 'undefined' &&
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 마이크 권한 요청 함수
const requestMicrophonePermission = async (
  setPermissionStatus: (status: PermissionState) => void,
): Promise<boolean> => {
  console.log('[SpeechRecognition] Requesting microphone permission...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('[SpeechRecognition] Permission granted.');
    setPermissionStatus('granted');
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error('[SpeechRecognition] Permission denied.', error);
    setPermissionStatus('denied');
    return false;
  }
};

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState>('prompt');

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 침묵 타이머 정리 함수
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // 음성 인식 중지 함수
  const stopRecognition = useCallback(() => {
    console.log('[STOP] Stopping recognition...');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('[STOP] Error stopping recognition:', e);
      }
    }
    setIsListening(false);
    clearSilenceTimer();
  }, [clearSilenceTimer]);

  // 음성 인식 초기화
  useEffect(() => {
    // 브라우저 호환성 체크
    if (!navigator.mediaDevices) {
      console.error('[SpeechRecognition] navigator.mediaDevices not available');
      setPermissionStatus('denied');
      return;
    }

    // 권한 요청
    requestMicrophonePermission(setPermissionStatus);

    // Web Speech API 지원 체크
    if (!SpeechRecognition) {
      console.log('[SpeechRecognition] API not supported');
      return;
    }

    // Recognition 인스턴스 생성
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    // ✅ 모바일에서는 continuous false
    recognition.continuous = isMobile ? false : true;
    recognition.maxAlternatives = 1;

    console.log(
      `🔧 [CONFIG] isMobile: ${isMobile}, continuous: ${recognition.continuous}`,
    );

    // 디버깅: 오디오 이벤트
    recognition.onaudiostart = () => {
      console.log('🎙️ [onaudiostart] 마이크 입력 감지 시작!');
    };

    recognition.onaudioend = () => {
      console.log('🎙️ [onaudioend] 마이크 입력 종료');
    };

    recognition.onsoundstart = () => {
      console.log('🔊 [onsoundstart] 소리 감지됨!');
    };

    recognition.onsoundend = () => {
      console.log('🔇 [onsoundend] 소리 감지 종료');
    };

    recognition.onspeechstart = () => {
      console.log('🗣️ [onspeechstart] 말소리 감지됨!');
    };

    recognition.onspeechend = () => {
      console.log('🤐 [onspeechend] 말소리 끝남');
    };

    // 이벤트 핸들러: 시작
    recognition.onstart = () => {
      console.log('>>> [onstart] Recognition started');
      setIsListening(true);
    };

    // 이벤트 핸들러: 결과
    recognition.onresult = (event: any) => {
      console.log('>>> [onresult] Result received');
      console.log('>>> [onresult] Results length:', event.results.length);

      // 기존 침묵 타이머 취소
      clearSilenceTimer();

      let interimText = '';
      let finalText = '';

      // ✅ 모든 결과를 처리 (resultIndex부터가 아닌 전체)
      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        console.log(
          `>>> [onresult] Result[${i}]: "${text}" (isFinal: ${event.results[i].isFinal}, confidence: ${confidence})`,
        );

        if (event.results[i].isFinal) {
          finalText += text + ' ';
        } else {
          interimText += text;
        }
      }

      // 임시 결과 로깅
      if (interimText) {
        console.log('[Interim]:', interimText);
        // ✅ 모바일에서는 interim도 transcript에 반영
        if (isMobile) {
          setTranscript(interimText);
        }
      }

      // 확정 결과 처리
      if (finalText) {
        console.log('[Final]:', finalText);
        console.log('[Final] Setting transcript...');
        setTranscript((prev) => {
          const newValue = prev + finalText;
          console.log('[Final] New transcript value:', newValue);
          return newValue;
        });

        // ✅ 모바일: 1초, PC: 2초
        const timeout = isMobile ? 1000 : 2000;
        silenceTimerRef.current = setTimeout(() => {
          console.log(`[Auto-stop] ${timeout / 1000}초 침묵 감지 → 자동 중지`);
          stopRecognition();
        }, timeout);
      }
    };

    // 이벤트 핸들러: 에러
    recognition.onerror = (event: any) => {
      console.error(`!!! [onerror] ${event.error}`, event);

      // no-speech 에러: 모바일에서는 그냥 중지
      if (event.error === 'no-speech') {
        console.log('[Info] No speech detected');
        if (isMobile) {
          // ✅ 모바일: interim 결과라도 있으면 사용
          console.log('[Mobile] Checking interim results...');
          stopRecognition();
        }
        return;
      }

      // 권한 거부 에러 처리
      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        console.log('[Error] Microphone permission denied');
        setPermissionStatus('denied');
      }

      // aborted 에러는 수동 중지이므로 무시
      if (event.error === 'aborted') {
        console.log('[Info] Recognition aborted (manual stop)');
        return;
      }

      setIsListening(false);
    };

    // 이벤트 핸들러: 종료
    recognition.onend = () => {
      console.log('>>> [onend] Recognition ended');
      console.log('>>> [onend] Final transcript:', transcript);
      setIsListening(false);
      clearSilenceTimer();

      // ✅ 모바일: continuous false라서 자동 재시작 방지
      if (isMobile) {
        console.log('[Mobile] Recognition ended naturally');
      }
    };

    recognitionRef.current = recognition;

    // 클린업
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // 이미 종료된 경우 무시
        }
      }
    };
  }, []);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    console.log('[START] Attempting to start recognition...');
    console.log('[START] isMobile:', isMobile);

    // 권한 체크
    if (permissionStatus === 'prompt') {
      console.log('[START] Requesting permission first...');
      const granted = await requestMicrophonePermission(setPermissionStatus);
      if (!granted) {
        console.warn('[START] Permission denied, cannot start');
        return;
      }
    }

    if (permissionStatus !== 'granted') {
      console.warn('[START] Permission not granted');
      return;
    }

    // 이미 듣고 있으면 중복 시작 방지
    if (isListening) {
      console.warn('[START] Already listening');
      return;
    }

    // Recognition 시작
    if (recognitionRef.current) {
      try {
        setTranscript(''); // 이전 transcript 초기화
        console.log('[START] Starting recognition...');
        recognitionRef.current.start();
      } catch (e) {
        console.error('[START] Failed to start:', e);
      }
    } else {
      console.error('[START] Recognition instance not initialized');
    }
  }, [permissionStatus, isListening]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    stopRecognition();
  }, [stopRecognition]);

  // Transcript 초기화
  const clearTranscript = useCallback(() => {
    console.log('[CLEAR] Clearing transcript');
    setTranscript('');
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
