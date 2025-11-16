import { useState, useEffect, useRef } from 'react';

// Web Speech API 브라우저 호환성 확인
// window 객체에서 API 탐색
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// API 미지원 시 사용자 경고
if (!SpeechRecognition) {
  alert('Your browser does not support the Web Speech API. Please use Chrome.');
}

/**
 * 음성 인식 API 제어용 커스텀 훅 (Custom Hook)
 * Vanilla JS API를 React 방식으로 제어하는 핵심 로직
 */
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState(''); // 최종 인식 텍스트
  const [isListening, setIsListening] = useState(false); // 현재 인식 중 상태

  // SpeechRecognition 인스턴스 보관용 ref (재생성 방지)
  const recognitionRef = useRef<any>(null);

  // 컴포넌트 마운트 시 인스턴스 1회 생성
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // 언어: 영어
    recognition.interimResults = false; // 중간 결과: 미사용 (최종 결과만 받음)
    recognition.continuous = false; // 자동 종료: 활성화 (한 문장 인식 후)

    // 음성 인식 결과 도착 시
    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const spokenText = lastResult[0].transcript;
      setTranscript(spokenText); // React 상태(state)로 결과 저장
      setIsListening(false); // 인식 상태 종료
    };

    // 에러 발생 시
    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
    };

    // ref에 인스턴스 저장
    recognitionRef.current = recognition;
  }, []); // '[]' (빈 배열): 마운트 시 1회만 실행

  // 시작 함수 (React 컴포넌트가 호출할 함수)
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript(''); // 이전 기록 초기화
    }
  };

  // 중지 함수 (수동 제어용)
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // 훅(Hook)이 반환하는 값과 함수
  return {
    transcript,
    isListening,
    startListening,
    stopListening,
  };
}
