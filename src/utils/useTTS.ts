import { useState, useEffect, useRef, useCallback } from 'react';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const speechTimerRef = useRef<number | undefined>(undefined);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }
      utterancesRef.current = [];
      window.speechSynthesis.cancel();
    };
  }, []);

  // 안정적인 speak 함수
  const speak = useCallback(
    (text: string, voiceURI: string | null = null, onEnd?: () => void) => {
      // 호출 시점에 최신 음성 목록 바로 가져오기
      const availableVoices = window.speechSynthesis.getVoices();

      const getBestEnglishVoice = () => {
        if (availableVoices.length === 0) return null;
        const lang = 'en-US';
        const googleVoice = availableVoices.find(
          (v) => v.lang === lang && v.name.includes('Google'),
        );
        if (googleVoice) return googleVoice;
        const appleVoice = availableVoices.find(
          (v) =>
            v.lang === lang &&
            (v.name.includes('Samantha') || v.name.includes('Siri')),
        );
        if (appleVoice) return appleVoice;
        const msVoice = availableVoices.find(
          (v) => v.lang === lang && v.name.includes('Microsoft'),
        );
        if (msVoice) return msVoice;
        return availableVoices.find((v) => v.lang.startsWith('en'));
      };

      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }
      window.speechSynthesis.cancel();

      speechTimerRef.current = window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';

        if (voiceURI) {
          const selectedVoice = availableVoices.find(
            (v) => v.voiceURI === voiceURI,
          );
          if (selectedVoice) utterance.voice = selectedVoice;
        } else {
          const bestVoice = getBestEnglishVoice();
          if (bestVoice) {
            utterance.voice = bestVoice;
          }
        }

        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        const cleanup = () => {
          utterancesRef.current = utterancesRef.current.filter(
            (u) => u !== utterance,
          );
        };

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          cleanup();
          if (onEnd) onEnd();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          cleanup();
        };

        utterancesRef.current.push(utterance);
        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [], // 의존성 배열이 비어있어 항상 동일한 함수 인스턴스 반환
  );

  const cancel = useCallback(() => {
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utterancesRef.current = [];
  }, []);

  return {
    speak,
    isSpeaking,
    voices:
      typeof window !== 'undefined' && window.speechSynthesis
        ? window.speechSynthesis.getVoices()
        : [],
    cancel,
  };
};
