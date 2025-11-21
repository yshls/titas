import { useState, useEffect, useCallback } from 'react';

const synth = window.speechSynthesis;

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const populateVoiceList = useCallback(() => {
    if (synth) {
      setVoices(synth.getVoices());
    }
  }, []);

  useEffect(() => {
    populateVoiceList();
    if (synth && synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoiceList;
    }
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [populateVoiceList]);

  const speak = (text: string, voiceURI: string | null, onEnd?: () => void) => {
    if (!synth || isSpeaking) return;
    if (text.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    if (voiceURI) {
      const selectedVoice = voices.find((v) => v.voiceURI === voiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  return {
    speak,
    isSpeaking,
    voices,
  };
}
