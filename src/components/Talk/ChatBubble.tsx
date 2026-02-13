import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { MdVolumeUp, MdPlayArrow } from 'react-icons/md';
import type { DialogueLine } from '@/utils/types';
import { type DiffResult } from '@/utils/diffChecker';
import { motion } from 'framer-motion';

const DIFF_COLOR_MAP = {
  correct: 'color: #059669; font-weight: 800; text-shadow: none;', 
  removed: 'color: #ef4444; text-decoration: line-through; opacity: 0.6;', 
  added: 'color: #3b82f6; font-weight: 700;', 
  neutral: 'color: inherit;',
};

const MessageRow = styled.div<{ isRight: boolean }>`
  display: flex;
  justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
  width: 100%;
`;

const BubbleContainer = styled.div<{ isRight: boolean }>`
  display: flex;
  flex-direction: column;
  max-width: 85%;
  align-items: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled(motion.div)<{ isRight: boolean; bgColor: string; isFocused: boolean }>`
  padding: 14px 18px;
  border-radius: 24px;
  position: relative;
  font-size: 18px;
  line-height: 1.6;
  word-break: break-word;
  background-color: ${({ bgColor }) => bgColor};
  color: #1a1a1a;
  
  /* Focus Styles */
  opacity: ${({ isFocused }) => (isFocused ? 1 : 0.4)};
  filter: ${({ isFocused }) => (isFocused ? 'none' : 'grayscale(80%) blur(0.5px)')};
  transform-origin: ${({ isRight }) => (isRight ? 'center right' : 'center left')};
  transition: opacity 0.5s ease, filter 0.5s ease;
  box-shadow: none;
  min-width: 140px;

  ${({ isRight }) =>
    isRight
      ? css`
          border-top-right-radius: 4px;
        `
      : css`
          border-top-left-radius: 4px;
        `}
`;

const BubbleHeader = styled.div<{ isRight: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  opacity: 0.6;
  gap: 8px;
  flex-direction: ${({ isRight }) => (isRight ? 'row-reverse' : 'row')};
`;

const SpeakerName = styled.span`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SpeakerIconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
  color: inherit;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;



const DialogueText = styled.div`
  font-size: 16px;
  line-height: 1.5;
  font-weight: 500;
`;

const BlurredText = styled.div`
  font-size: 16px;
  line-height: 1.5;
  filter: blur(6px);
  user-select: none;
  opacity: 0.5;
  cursor: default;
`;

const FeedbackContainer = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 15px;
  line-height: 1.6;
`;

const Highlight = styled.span<{
  type: 'correct' | 'wrong' | 'added' | 'neutral' | 'removed';
}>`
  font-weight: 600;
  padding: 0 2px;

  ${({ type }) => type === 'correct' && DIFF_COLOR_MAP.correct}
  ${({ type }) => type === 'removed' && DIFF_COLOR_MAP.removed}
  ${({ type }) => type === 'added' && DIFF_COLOR_MAP.added}
  ${({ type }) => type === 'neutral' && DIFF_COLOR_MAP.neutral}
`;

const HintText = styled.span`
  opacity: 0.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 10px;
  justify-content: flex-end;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  color: #555;
  transition: all 0.2s;

  &:hover {
    background-color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

interface ChatBubbleProps {
  line: DialogueLine;
  isUser: boolean;
  feedback: DiffResult[] | undefined;
  showHint: boolean;
  bubbleColor: string;
  isSameSpeakerAsPrev: boolean;
  onPlayAudio: () => void;
  userAudioUrl?: string;
  isFocused: boolean;
}

export function ChatBubble({
  line,
  isUser,
  feedback,
  showHint,
  bubbleColor,
  isSameSpeakerAsPrev,
  onPlayAudio,
  userAudioUrl,
  isFocused,
}: ChatBubbleProps) {
  return (
    <MessageRow isRight={isUser}>
      <BubbleContainer isRight={isUser}>
        <MessageBubble
          isRight={isUser}
          bgColor={bubbleColor}
          isFocused={isFocused}
          layout
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ 
            opacity: isFocused ? 1 : 0.4, 
            y: 0, 
            scale: isFocused ? 1.05 : 1.0 
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={isSameSpeakerAsPrev ? { marginTop: '4px' } : {}}
        >
          <BubbleHeader isRight={isUser}>
            <SpeakerName>{line.speakerId}</SpeakerName>
            <SpeakerIconBtn onClick={onPlayAudio} aria-label="Listen">
              <MdVolumeUp size={14} />
            </SpeakerIconBtn>
          </BubbleHeader>

          {isUser ? (
            <>
              {feedback ? (
                <>
                  <DialogueText style={{ opacity: 0.7, fontSize: '15px' }}>
                    {line.originalLine}
                  </DialogueText>
                  <FeedbackContainer>
                    {feedback
                      .filter((p) => p.value.trim() !== '')
                      .map((p, i) => (
                        <Highlight key={i} type={p.status as any}>
                          {p.value}
                        </Highlight>
                      ))}
                  </FeedbackContainer>
                </>
              ) : showHint ? (
                <HintText>{line.originalLine}</HintText>
              ) : (
                <BlurredText>{line.originalLine}</BlurredText>
              )}
            </>
          ) : (
            <DialogueText>{line.originalLine}</DialogueText>
          )}
        </MessageBubble>

        {isUser && userAudioUrl && (
          <ActionButtons>
            <ActionBtn
              onClick={() => {
                const audio = new Audio(userAudioUrl);
                audio.play();
              }}
            >
              <MdPlayArrow size={14} /> My Voice
            </ActionBtn>
          </ActionButtons>
        )}
      </BubbleContainer>
    </MessageRow>
  );
}