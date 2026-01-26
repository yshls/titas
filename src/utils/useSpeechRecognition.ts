import { useState, useEffect, useRef } from 'react';

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

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  // 음성 인식 인스턴스 초기화
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    // 음성 인식 결과 처리
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript((prev) => prev + finalTranscript);
    };

    // 에러 처리
    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
    };

    // 인식 종료 처리
    recognition.onend = () => {
      setIsListening(false);
      // 모바일에서 자동 중단 감지 후 필요한 경우 여기에 로직 추가
      // 예: if (!manualStopRef.current) { startListening(); }
    };

    recognitionRef.current = recognition;
  }, []);

  // 음성 인식 시작
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript(''); // 시작할 때 이전 텍스트 초기화
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn(
          'Recognition start failed (already started or permission issue).',
        );
      }
    }
  };

  // 음성 인식 중지
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false); // 수동 중지 시 즉시 상태 변경
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
  };
}
