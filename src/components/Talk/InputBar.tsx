import React from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { FiMic, FiSend, FiX, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { MdKeyboard, MdLightbulb } from 'react-icons/md';
import { AudioVisualizer } from './AudioVisualizer';

// Zero-reflow: 레이아웃 크기를 변경하지 않고 외곽 파동 링을 표현하는 box-shadow 애니메이션
const pulseRing = (errorColor: string) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${errorColor}a6;
  }
  70% {
    box-shadow: 0 0 0 14px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
`;

const FloatingBarWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 16px clamp(12px, 2vh, 20px) 16px;
  display: flex;
  justify-content: center;
  pointer-events: none;
  background: linear-gradient(
    to top,
    ${({ theme }) => theme.background} 35%,
    transparent 100%
  );
  z-index: 30;

  @media (max-height: 800px) {
    padding: 0 12px 10px 12px;
  }
`;

const FloatingIsland = styled.div`
  pointer-events: auto;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(36, 35, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 6px 8px;
  border-radius: 100px;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 300px;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const SideButton = styled.button<{ active?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ active, theme }) => (active ? theme.colors.primary : theme.textSub)};
  background: ${({ active, theme }) => (active ? theme.borderSubtle : 'transparent')};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.borderSubtle};
    color: ${({ theme }) => theme.textMain};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

// 레이아웃 고정 래퍼 (자식의 scale/visualizer 변경 시 주변 요소 밀림 100% 방지)
const HeroMicWrapper = styled.div`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const HeroMicButton = styled.button<{ isListening: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.25s ease;
  border: none;
  cursor: pointer;
  flex-shrink: 0;

  ${({ isListening, theme }) =>
    isListening
      ? css`
          background-color: ${theme.colors.error};
          color: ${theme.colors.onPrimary};
          animation: ${pulseRing(theme.colors.error)} 1.8s infinite;
        `
      : css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.onPrimary};
          &:hover {
            background-color: ${theme.colors.primaryHover};
            transform: scale(1.06);
          }
        `}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    transform: none;
  }
`;

const KeyboardInputWrapper = styled.div`
  pointer-events: auto;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(36, 35, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  max-width: 500px;
  padding: 8px 12px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 16px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.textMain};
  border: none;
  font-size: 15px;

  &::placeholder {
    color: ${({ theme }) => theme.textDisabled};
  }
`;

const SendBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.1s, background-color 0.2s;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    background: ${({ theme }) => theme.borderSubtle};
    color: ${({ theme }) => theme.textDisabled};
    cursor: not-allowed;
  }
`;

// 모바일 안내 메시지 스타일
const MobileHint = styled.div`
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  animation: ${keyframes`
    0% { opacity: 0; transform: translate(-50%, 8px); }
    100% { opacity: 1; transform: translate(-50%, 0); }
  `} 0.3s ease-out;
`;

// 결과를 본 뒤 다시 말할지 넘어갈지 고르는 바
const ReviewIsland = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 340px;
  padding: 8px;
  border-radius: 100px;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(36, 35, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const ReviewButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border: none;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;

  background: ${({ $primary, theme }) =>
    $primary ? theme.colors.primary : theme.background};
  color: ${({ $primary, theme }) =>
    $primary ? theme.colors.onPrimary : theme.textMain};

  &:hover {
    background: ${({ $primary, theme }) =>
      $primary ? theme.colors.primaryHover : theme.borderSubtle};
  }
`;

interface InputBarProps {
  inputMode: 'mic' | 'keyboard';
  setInputMode: (mode: 'mic' | 'keyboard') => void;
  isListening: boolean;
  handleMicClick: () => void;
  isMyTurn: boolean;
  hasFeedback: boolean;
  mediaStream: MediaStream | null;
  showHint: boolean;
  setShowHint: (show: boolean) => void;
  typedInput: string;
  setTypedInput: (text: string) => void;
  handleSendTypedInput: () => void;
  handleRetryLine: () => void;
  handleAdvanceLine: () => void;
}

export const InputBar = React.memo(function InputBar({
  inputMode,
  setInputMode,
  isListening,
  handleMicClick,
  isMyTurn,
  hasFeedback,
  mediaStream,
  showHint,
  setShowHint,
  typedInput,
  setTypedInput,
  handleSendTypedInput,
  handleRetryLine,
  handleAdvanceLine,
}: InputBarProps) {
  const { t } = useTranslation();

  // 결과가 나왔으면 입력 대신 "다시 말하기 / 다음"을 보여준다.
  if (hasFeedback) {
    return (
      <FloatingBarWrapper>
        <ReviewIsland>
          <ReviewButton onClick={handleRetryLine}>
            <FiRefreshCw size={16} aria-hidden="true" />
            {t('talk.retryLine')}
          </ReviewButton>
          <ReviewButton $primary onClick={handleAdvanceLine}>
            {t('talk.nextLine')}
            <FiArrowRight size={16} aria-hidden="true" />
          </ReviewButton>
        </ReviewIsland>
      </FloatingBarWrapper>
    );
  }

  return (
    <FloatingBarWrapper>
      {/* 모바일 안내 메시지 */}
      {isListening && <MobileHint>{t('talk.tapWhenDone')}</MobileHint>}

      {inputMode === 'mic' ? (
        <FloatingIsland>
          <SideButton
            onClick={() => setInputMode('keyboard')}
            disabled={!isMyTurn}
            aria-label={t('talk.switchToKeyboardAria')}
          >
            <MdKeyboard size={24} aria-hidden="true" />
          </SideButton>

          <HeroMicWrapper>
            <HeroMicButton
              isListening={isListening}
              onClick={handleMicClick}
              disabled={!isMyTurn || hasFeedback}
              aria-label={
                isListening
                  ? t('talk.stopRecordingAria')
                  : t('talk.startRecordingAria')
              }
              aria-pressed={isListening}
            >
              {isListening && mediaStream ? (
                <AudioVisualizer stream={mediaStream} />
              ) : (
                <FiMic size={28} />
              )}
            </HeroMicButton>
          </HeroMicWrapper>

          <SideButton
            active={showHint}
            onClick={() => setShowHint(!showHint)}
            disabled={!isMyTurn}
            aria-label={t('talk.toggleHintAria')}
            aria-pressed={showHint}
          >
            <MdLightbulb size={24} aria-hidden="true" />
          </SideButton>
        </FloatingIsland>
      ) : (
        <KeyboardInputWrapper>
          <SideButton
            onClick={() => setInputMode('mic')}
            aria-label={t('talk.switchToMicAria')}
          >
            <FiX size={20} aria-hidden="true" />
          </SideButton>
          <StyledInput
            placeholder={t('talk.typePlaceholder')}
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && typedInput.trim()) {
                handleSendTypedInput();
              }
            }}
            autoFocus
            disabled={!isMyTurn || hasFeedback}
            aria-label={t('talk.typeInputAria')}
          />
          <SendBtn
            onClick={handleSendTypedInput}
            disabled={!typedInput.trim() || !isMyTurn || hasFeedback}
            aria-label={t('talk.sendAria')}
          >
            <FiSend size={18} aria-hidden="true" />
          </SendBtn>
        </KeyboardInputWrapper>
      )}
    </FloatingBarWrapper>
  );
});

