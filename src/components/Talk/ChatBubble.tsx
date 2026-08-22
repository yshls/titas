import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { MdVolumeUp, MdPlayArrow } from 'react-icons/md';
import type { DialogueLine } from '@/utils/types';
import { type DiffResult } from '@/utils/diffChecker';
import { motion } from 'framer-motion';

const DIFF_COLOR_MAP = {
  correct: 'color: #059669; font-weight: 800; text-shadow: none;',
  removed: 'color: #ef4444; text-decoration: line-through; opacity: 0.75;',
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

  @media (max-width: 480px) {
    max-width: 90%;
  }
`;

const MessageBubble = styled(motion.div)<{
  isRight: boolean;
  bgColor: string;
  isFocused: boolean;
}>`
  padding: 12px 16px;
  border-radius: 20px;
  position: relative;
  font-size: 16px;
  line-height: 1.55;
  word-break: break-word;
  overflow-wrap: anywhere;
  background-color: ${({ bgColor, theme }) =>
    (theme.speaker as Record<string, string>)?.[bgColor] || bgColor};
  color: ${({ theme }) => theme.speakerText.main};

  /* Focus Styles */
  opacity: ${({ isFocused }) => (isFocused ? 1 : 0.4)};
  filter: ${({ isFocused }) => (isFocused ? 'none' : 'grayscale(80%) blur(0.5px)')};
  transform-origin: ${({ isRight }) => (isRight ? 'center right' : 'center left')};
  transition:
    opacity 0.4s ease,
    filter 0.4s ease,
    background-color 0.3s ease,
    color 0.3s ease;
  box-shadow: none;
  min-width: 120px;

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
  opacity: 0.8;
  gap: 8px;
  flex-direction: ${({ isRight }) => (isRight ? 'row-reverse' : 'row')};
  color: ${({ theme }) => theme.speakerText.sub};
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
  transition: opacity 0.2s, transform 0.2s;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const DialogueText = styled.div`
  font-size: 15px;
  line-height: 1.5;
  font-weight: 500;
  color: ${({ theme }) => theme.speakerText.main};
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const BlurredText = styled.div`
  font-size: 15px;
  line-height: 1.5;
  filter: blur(6px);
  user-select: none;
  opacity: 0.5;
  cursor: default;
`;

const FeedbackContainer = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)')};
  font-size: 14px;
  line-height: 1.55;
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
  opacity: 0.65;
  font-size: 15px;
`;

// 한국어 뜻. 원문을 가린 상태에서도 무슨 말을 해야 하는지 알 수 있게 한다.
const TranslatedText = styled.div<{ $below?: boolean }>`
  font-size: 13px;
  line-height: 1.45;
  color: ${({ theme }) => theme.speakerText.sub};
  opacity: 0.85;
  word-break: keep-all;
  overflow-wrap: break-word;
  ${({ $below }) => ($below ? 'margin-top: 6px;' : 'margin-bottom: 6px;')}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
  justify-content: flex-end;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  color: ${({ theme }) => theme.textMain};
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#ffffff'};
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
  onPlayAudio: (text: string) => void;
  userAudioUrl?: string;
  isFocused: boolean;
}

import React from 'react';

export const ChatBubble = React.memo(function ChatBubble({
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
  const { t } = useTranslation();
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
            <SpeakerIconBtn onClick={() => onPlayAudio(line.originalLine)} aria-label={t('talk.listenAria')}>
              <MdVolumeUp size={14} />
            </SpeakerIconBtn>
          </BubbleHeader>

          {isUser ? (
            <>
              {line.translatedLine && (
                <TranslatedText>{line.translatedLine}</TranslatedText>
              )}
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
            <>
              <DialogueText>{line.originalLine}</DialogueText>
              {line.translatedLine && (
                <TranslatedText $below>{line.translatedLine}</TranslatedText>
              )}
            </>
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
              <MdPlayArrow size={14} /> {t('talk.myVoice')}
            </ActionBtn>
          </ActionButtons>
        )}
      </BubbleContainer>
    </MessageRow>
  );
});