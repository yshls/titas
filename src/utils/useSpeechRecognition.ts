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
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 음성 인식 인스턴스 초기화
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.continuous = true;

    // 음성 인식 결과 처리
    recognition.onresult = (event: any) => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }
      console.log('Interim Transcript:', interimTranscript);
      if (finalTranscript) {
        console.log('Final Transcript:', finalTranscript);
        setTranscript((prev) => prev + finalTranscript);
      }

      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 2000); // 2초 동안 말이 없으면 중지
    };

    // 에러 처리
    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
    };

    // 인식 종료 처리
    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  // 음성 인식 시작
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript(''); // 시작할 때 이전 텍스트 초기화
        recognitionRef.current.start();
        setIsListening(true);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
        }, 2000); 
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
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
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
