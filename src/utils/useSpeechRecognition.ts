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
    'Your browser does not support the Web Speech API. Please use Chrome.'
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
      console.log('Speech Recognition Result:', event.results);
      const transcript_parts = [];
      for (let i = 0; i < event.results.length; ++i) {
        transcript_parts.push(event.results[i][0].transcript);
      }
      const full_transcript = transcript_parts.join(' ');
      setTranscript(full_transcript.trim());
    };

    // 에러 처리
    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
    };

    // 인식 종료 처리
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // 음성 인식 시작
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch (e) {
        console.warn(
          'Recognition start failed (already started or permission issue).'
        );
      }
    }
  };

  // 음성 인식 중지
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
  };
}
