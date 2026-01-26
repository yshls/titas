import { useEffect } from 'react';
import { usePracticeStore } from '@/store/practiceStore';
import { useTTS } from '@/utils/useTTS';

export function usePracticeFlow() {
  // 스토어 상태 개별 선택
  const status = usePracticeStore((state) => state.status);
  const lines = usePracticeStore((state) => state.lines);
  const currentLineIndex = usePracticeStore((state) => state.currentLineIndex);
  const userSpeakerId = usePracticeStore((state) => state.userSpeakerId);
  const advanceLine = usePracticeStore((state) => state.advanceLine);
  const finishPractice = usePracticeStore((state) => state.finishPractice);

  const { speak, isSpeaking } = useTTS();

  const isFinished = status === 'active' && currentLineIndex >= lines.length;
  const currentLine = lines[currentLineIndex] ?? null;
  const isMyTurn = currentLine?.speakerId === userSpeakerId;

  // 상대방 차례 처리
  useEffect(() => {
    if (status === 'active' && !isFinished && !isMyTurn && !isSpeaking) {
      if (currentLine) {
        speak(currentLine.originalLine, null, () => {
          advanceLine();
        });
      }
    }
  }, [
    status,
    isFinished,
    isMyTurn,
    isSpeaking,
    currentLine,
    speak,
    advanceLine,
  ]);

  // 연습 종료 처리
  useEffect(() => {
    if (status === 'active' && isFinished) {
      const timer = setTimeout(() => {
        finishPractice();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [status, isFinished, finishPractice]);
}