import { useRef, useEffect } from 'react';
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
  padding: 20px;
  padding-bottom: 140px; /* space for floating bar */
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-behavior: smooth;
  animation: ${floatUp} 0.3s ease-out;
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

export function Chat({
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

  // 자동 스크롤 효과
  
  useEffect(() => {
    if (chatContainerRef.current) {
      const activeElement = chatContainerRef.current.children[currentLineIndex] as HTMLElement;
      if (activeElement) {
        
        const container = chatContainerRef.current;
        const offset = activeElement.offsetTop - container.offsetTop - container.clientHeight / 2 + activeElement.clientHeight / 2;
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
            onPlayAudio={() => onSpeak(line.originalLine)}
            userAudioUrl={userAudioMap[idx]}
            isFocused={isFinished || isCurrent}  
          />
        );
      })}
    </ChatContainer>
  );
}
