import { useState, useEffect, useRef, useCallback } from 'react';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 초기값 설정
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const speechTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      handleVoicesChanged,
    );
    handleVoicesChanged();

    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged,
      );
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }
      utterancesRef.current = [];
      window.speechSynthesis.cancel();
    };
  }, []);

  // 최적 영어 목소리 탐색
  const getBestEnglishVoice = useCallback(() => {
    if (voices.length === 0) return null;
    const lang = 'en-US';

    // Google US English
    const googleVoice = voices.find(
      (v) => v.lang === lang && v.name.includes('Google'),
    );
    if (googleVoice) return googleVoice;

    // Apple Samantha / Siri
    const appleVoice = voices.find(
      (v) =>
        v.lang === lang &&
        (v.name.includes('Samantha') || v.name.includes('Siri')),
    );
    if (appleVoice) return appleVoice;

    // Microsoft Zira/David
    const msVoice = voices.find(
      (v) => v.lang === lang && v.name.includes('Microsoft'),
    );
    if (msVoice) return msVoice;

    // 기본 영어 음성
    return voices.find((v) => v.lang.startsWith('en'));
  }, [voices]);

  // TTS 취소
  const cancel = useCallback(() => {
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utterancesRef.current = [];
  }, []);

  // TTS 실행
  const speak = useCallback(
    (text: string, voiceURI: string | null = null, onEnd?: () => void) => {
      // 기존 작업 중단
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }
      window.speechSynthesis.cancel();

      speechTimerRef.current = window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);

        // 기본 언어 설정
        utterance.lang = 'en-US';

        // 목소리 설정
        if (voiceURI) {
          const selectedVoice = voices.find((v) => v.voiceURI === voiceURI);
          if (selectedVoice) utterance.voice = selectedVoice;
        } else {
          const bestVoice = getBestEnglishVoice();
          if (bestVoice) {
            utterance.voice = bestVoice;
          }
        }

        // 속도 및 톤 설정
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        const cleanup = () => {
          utterancesRef.current = utterancesRef.current.filter(
            (u) => u !== utterance,
          );
        };

        utterance.onstart = () => setIsSpeaking(true);

        // 종료 처리
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
    [voices, getBestEnglishVoice],
  );

  // cancel 함수 반환
  return { speak, isSpeaking, voices, cancel };
};
