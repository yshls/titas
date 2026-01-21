
import { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import type { DialogueLine, DiffResult } from '@/utils/types';
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
    userInputMap: Record<number, string>;
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
    userInputMap,
    userAudioMap,
    showHint,
    speakerColors,
    onSpeak,
}: ChatProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // 자동 스크롤 효과
    useEffect(() => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [currentLineIndex, feedbackMap]);

    const visibleLines = lines.slice(0, isFinished ? undefined : currentLineIndex + 1);

    return (
        <ChatContainer ref={chatContainerRef}>
            {visibleLines.map((line, idx) => {
                const isUser = line.speakerId === userSpeakerId;
                const prevLine = lines[idx - 1];
                const isSameSpeakerAsPrev = idx > 0 && prevLine?.speakerId === line.speakerId;

                return (
                    <ChatBubble
                        key={idx}
                        line={line}
                        isUser={isUser}
                        feedback={feedbackMap[idx]}
                        userInput={userInputMap[idx]}
                        showHint={showHint && isUser && currentLineIndex === idx}
                        bubbleColor={speakerColors[line.speakerId] || '#e1e1e1'}
                        isSameSpeakerAsPrev={isSameSpeakerAsPrev}
                        onPlayAudio={() => onSpeak(line.originalLine)}
                        userAudioUrl={userAudioMap[idx]}
                    />
                );
            })}
        </ChatContainer>
    );
}
