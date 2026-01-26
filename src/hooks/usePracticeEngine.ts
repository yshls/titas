import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePracticeStore } from '@/store/practiceStore';
import { useUserInput } from './useUserInput';
import { usePracticeFlow } from './usePracticeFlow';
import { useTTS } from '@/utils/useTTS';
import type { DialogueLine } from '@/utils/types';
import { shallow } from 'zustand/shallow';

const PALETTE = [
  '#e8f3ff', // blue50
  '#ffeeee', // red50
  '#f0faf6', // green50
  '#fff8e1', // amber50
  '#f3e5f5', // purple50
];

interface PracticeEngineProps {
  lines: DialogueLine[];
  scriptId: string;
  title: string;
}

/**
 * 연습 세션을 위한 마스터 오케스트레이터 훅
 * 역할:
 * - 스토어 초기화 및 정리
 * - `usePracticeFlow`, `useUserInput` 같은 전문 훅 실행
 * - UI에 필요한 상태와 핸들러 선택 및 노출
 */
export function usePracticeEngine({
  lines,
  scriptId,
  title,
}: PracticeEngineProps) {
  const navigate = useNavigate();

  // --- 스토어 액션 및 상태
  const { preparePractice, exitPractice, startPractice, retryPractice } =
    usePracticeStore.getState();

  const isMyTurn = usePracticeStore((state) => {
    const currentLine = state.lines[state.currentLineIndex];
    return (
      state.status === 'active' &&
      currentLine?.speakerId === state.userSpeakerId
    );
  }, shallow);

  // --- 전문 로직 훅
  usePracticeFlow();
  const userInput = useUserInput();
  const { speak } = useTTS();

  // --- 초기화 및 정리
  useEffect(() => {
    // 마운트 시 스토어에 스크립트 데이터 로드
    preparePractice(lines, scriptId, title);

    // 언마운트 시 스토어 상태 정리
    return () => {
      exitPractice();
    };
  }, [lines, scriptId, title, preparePractice, exitPractice]);

  // --- UI 메모
  const speakerIds = useMemo(
    () => [...new Set(lines.map((l) => l.speakerId))],
    [lines],
  );

  const speakerColors = useMemo(() => {
    const colors: Record<string, string> = {};
    speakerIds.forEach((id, index) => {
      colors[id] = PALETTE[index % PALETTE.length];
    });
    return colors;
  }, [speakerIds]);

  // --- UI 이벤트 핸들러
  const handleStartPractice = (speakerId: string) => {
    startPractice(speakerId);
  };

  const handleRetryPractice = () => {
    retryPractice();
  };

  const handleStopPractice = () => {
    userInput.stopRecordingAndListening();
    navigate(-1);
  };

  // UI 컴포넌트에 필요한 API 노출
  return {
    ...userInput,
    handleStartPractice,
    handleRetryPractice,
    handleStopPractice,
    speakerIds,
    speakerColors,
    isMyTurn,
    speak,
  };
}
