import { useState, useEffect } from 'react';

const synth = window.speechSynthesis;

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 언마운트 시 음성 중단
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  /**
   * 텍스트 음성 재생
   * @param text 변환할 텍스트
   * @param onEnd 재생 완료 콜백
   */

  const speak = (text: string, onEnd?: () => void) => {
    if (!synth || isSpeaking) return;
    if (text.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) {
        onEnd();
      }
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
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
