import { useState, useEffect } from 'react';

// Web Speech API SpeechSynthesis 인터페이스
const synth = window.speechSynthesis;

/**
 * 텍스트를 음성으로 변환(TTS)하는 커스텀 훅
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 컴포넌트 언마운트 시 음성 출력 중단
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  /**
   * 텍스트를 음성으로 재생
   * @param text 음성으로 변환할 텍스트
   * @param onEnd 재생 완료 시 호출될 콜백 함수
   */
  const speak = (text: string, onEnd?: () => void) => {
    if (!synth || isSpeaking) return; // 음성 기능이 없거나 이미 재생 중이면 중복 실행 방지
    if (text.trim() === '') return; // 빈 텍스트 무시

    const utterance = new SpeechSynthesisUtterance(text);

    // 영어 목소리 설정
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) {
        onEnd(); // 완료 콜백 실행
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech Synthesis Error:', event.error);
      setIsSpeaking(false);
    };

    synth.speak(utterance);
  };

  return {
    speak,
    isSpeaking,
  };
}
