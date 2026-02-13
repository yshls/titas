import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { FiMic, FiSend, FiX } from 'react-icons/fi';
import { MdKeyboard, MdLightbulb } from 'react-icons/md';
import { AudioVisualizer } from './AudioVisualizer';

const pulseRing = keyframes`
  0% { transform: scale(0.95); }
  70% { transform: scale(1); }
  100% { transform: scale(0.95); }
`;

const FloatingBarWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 20px 34px 20px;
  display: flex;
  justify-content: center;
  pointer-events: none;
  background: linear-gradient(
    to top,
    ${({ theme }) => theme.background} 30%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 30;
`;

const FloatingIsland = styled.div`
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 6px 6px 6px 10px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  width: 100%;
  max-width: 300px;
  justify-content: space-between;
  transform: translateZ(0);
  box-shadow: none;
`;

const SideButton = styled.button<{ active?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ active, theme }) => (active ? theme.textMain : '#9DAAB8')};
  background: ${({ active }) => (active ? '#F2F4F6' : 'transparent')};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #f2f4f6;
    color: ${({ theme }) => theme.textMain};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const HeroMicButton = styled.button<{ isListening: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 4px solid white;
  cursor: pointer;

  ${({ isListening, theme }) =>
    isListening
      ? css`
          background-color: ${theme.colors.error};
          color: white;
          animation: ${pulseRing} 2s infinite;
        `
      : css`
          background-color: ${theme.colors.primary};
          color: white;
          &:hover {
            transform: scale(1.08);
          }
        `}

  &:disabled {
    filter: grayscale(100%);
    opacity: 0.5;
    cursor: not-allowed;
    animation: none;
    transform: none;
  }
`;

const KeyboardInputWrapper = styled.div`
  pointer-events: auto;
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 10px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 16px;
  background: #f2f4f6;
  border: none;
  font-size: 16px;
  &:focus {
    outline: none;
    background: #eaecef;
  }
`;

const SendBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
  border: none;
  cursor: pointer;
  &:active {
    transform: scale(0.9);
  }
  &:disabled {
    background: #e1e4e8;
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
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  animation: ${keyframes`
    0% { opacity: 0; transform: translate(-50%, 10px); }
    100% { opacity: 1; transform: translate(-50%, 0); }
  `} 0.3s ease-out;
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
}

export function InputBar({
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
}: InputBarProps) {
  return (
    <FloatingBarWrapper>
      {/*  모바일 안내 메시지 추가 */}
      {isListening && <MobileHint>Tap when done</MobileHint>}

      {inputMode === 'mic' ? (
        <FloatingIsland>
          <SideButton
            onClick={() => setInputMode('keyboard')}
            disabled={!isMyTurn}
          >
            <MdKeyboard size={24} />
          </SideButton>

          <HeroMicButton
            isListening={isListening}
            onClick={handleMicClick}
            disabled={!isMyTurn || hasFeedback}
          >
            {isListening && mediaStream ? (
              <AudioVisualizer stream={mediaStream} />
            ) : (
              <FiMic size={28} />
            )}
          </HeroMicButton>

          <SideButton
            active={showHint}
            onClick={() => setShowHint(!showHint)}
            disabled={!isMyTurn}
          >
            <MdLightbulb size={24} />
          </SideButton>
        </FloatingIsland>
      ) : (
        <KeyboardInputWrapper>
          <SideButton onClick={() => setInputMode('mic')}>
            <FiX size={20} />
          </SideButton>
          <StyledInput
            placeholder="Type your sentence..."
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && typedInput.trim()) {
                handleSendTypedInput();
              }
            }}
            autoFocus
            disabled={!isMyTurn || hasFeedback}
          />
          <SendBtn
            onClick={handleSendTypedInput}
            disabled={!typedInput.trim() || !isMyTurn || hasFeedback}
          >
            <FiSend size={18} />
          </SendBtn>
        </KeyboardInputWrapper>
      )}
    </FloatingBarWrapper>
  );
}
