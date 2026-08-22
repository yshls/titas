import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import type { DialogueLine } from '@/utils/types';
import { type DiffResult } from '@/utils/diffChecker';
import { ChatBubble } from './ChatBubble';

const floatUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  padding-bottom: 120px; /* 플로팅 바 영역 확보 */
  scroll-padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-behavior: smooth;
  animation: ${floatUp} 0.3s ease-out;
  -webkit-overflow-scrolling: touch;
`;

interface ChatProps {
  lines: DialogueLine[];
  userSpeakerId: string | null;
  currentLineIndex: number;
  isFinished: boolean;
  feedbackMap: Record<number, DiffResult[]>;
  userAudioMap: Record<number, string>;
  showHint: boolean;
  speakerColors: Record<string, string>;
  onSpeak: (text: string) => void;
}

export const Chat = React.memo(function Chat({
  lines,
  userSpeakerId,
  currentLineIndex,
  isFinished,
  feedbackMap,
  userAudioMap,
  showHint,
  speakerColors,
  onSpeak,
}: ChatProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤 효과 (하단 플로팅 바 차폐 영역을 고려한 중심점 보정)
  useEffect(() => {
    if (chatContainerRef.current) {
      const activeElement = chatContainerRef.current.children[currentLineIndex] as HTMLElement;
      if (activeElement) {
        const container = chatContainerRef.current;
        const FLOATING_BAR_CLEARANCE = 110; // 플로팅 바 유효 높이
        const effectiveCenter = (container.clientHeight - FLOATING_BAR_CLEARANCE) / 2;
        const offset =
          activeElement.offsetTop -
          container.offsetTop -
          effectiveCenter +
          activeElement.clientHeight / 2;

        container.scrollTo({
          top: Math.max(0, offset),
          behavior: 'smooth',
        });
      }
    }
  }, [currentLineIndex, feedbackMap]);

  const visibleLines = lines.slice(0, currentLineIndex + 1);

  return (
    <ChatContainer ref={chatContainerRef}>
      {visibleLines.map((line, idx) => {
        const isUser = line.speakerId === userSpeakerId;
        const prevLine = lines[idx - 1];
        const isSameSpeakerAsPrev =
          idx > 0 && prevLine?.speakerId === line.speakerId;
      
        const isCurrent = idx === currentLineIndex;

        return (
          <ChatBubble
            key={idx}
            line={line}
            isUser={isUser}
            feedback={feedbackMap[idx]}
            showHint={showHint && isUser && isCurrent}
            bubbleColor={speakerColors[line.speakerId] || '#e1e1e1'}
            isSameSpeakerAsPrev={isSameSpeakerAsPrev}
            onPlayAudio={onSpeak}
            userAudioUrl={userAudioMap[idx]}
            isFocused={isFinished || isCurrent}  
          />
        );
      })}
    </ChatContainer>
  );
});
