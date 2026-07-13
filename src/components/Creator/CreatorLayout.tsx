import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { motion } from 'framer-motion';
import { MdCheck } from 'react-icons/md';

// 상수 임포트용
export const SPEAKER_COLORS: Record<string, string> = {
  blue50: '#e8f3ff',
  red50: '#ffeeee',
  green50: '#f0faf6',
};

// --- 공통 스타일
export const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
`;

export const VisuallyHiddenLabel = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const SectionCard = styled.section`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 10px;
`;

export const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.textSub};
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const LabelSubText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// --- 사이드바 스피커 리스트 컴포넌트
export const SpeakerListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TitleInput = styled.input`
  width: 100%;
  padding: 8px 0;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.border};
  background-color: transparent;
  color: ${({ theme }) => theme.textMain};
  font-weight: 700;
  font-size: 18px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  }
  &::placeholder {
    color: ${({ theme }) => theme.textSub};
    opacity: 0.8;
  }
`;

const SpeakerRow = styled.div<{ isActive: boolean; activeBg: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background-color: ${({ isActive, theme }) => (isActive ? theme.border : 'transparent')};
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

const SpeakerNameInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.textMain};
  outline: none;
  padding: 4px;

  &::placeholder {
    color: ${({ theme }) => theme.textDisabled};
  }
`;

export const SpeakerIndicator = styled.div<{ color: string; inDialogue?: boolean }>`
  width: ${({ inDialogue }) => (inDialogue ? '24px' : '20px')};
  height: ${({ inDialogue }) => (inDialogue ? '24px' : '20px')};
  margin-top: ${({ inDialogue }) => (inDialogue ? '4px' : '0')};
  border-radius: 6px;
  background-color: ${({ color }) => color};
  border: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
`;

export function SpeakerItem({
  speaker,
  isActive,
  onNameChange,
  onClick,
}: {
  speaker: { id: string; name: string; colorKey: string };
  isActive: boolean;
  onNameChange: (id: string, name: string) => void;
  onClick: () => void;
}) {
  const theme = useTheme();
  const bgColor = SPEAKER_COLORS[speaker.colorKey];

  return (
    <SpeakerRow isActive={isActive} activeBg={bgColor} onClick={onClick}>
      <SpeakerIndicator color={bgColor} />
      <SpeakerNameInput
        value={speaker.name}
        onChange={(e) => onNameChange(speaker.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder="Name"
      />
      {isActive && <MdCheck size={18} color={theme.colors.primary} />}
    </SpeakerRow>
  );
}

// --- 대본 리스트 컴포넌트
export const ScriptListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 8px;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 10px;
  }
`;

export const DialogueItemWrapper = styled(motion.article)<{ isEditing: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ isEditing, theme }) => (isEditing ? theme.background : 'transparent')};
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: ${({ theme }) => theme.background};
  }

  .content {
    flex: 1;
    min-width: 0;
  }
  .speaker-label {
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.textSub};
    margin-bottom: 6px;
  }
  .text-display {
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.textMain};
    line-height: 1.6;
    cursor: text;
  }
  .edit-input {
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.textMain};
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    line-height: 1.6;
    font-family: inherit;
    padding: 0;
  }
`;

export const DeleteLineButton = styled.button`
  padding: 8px;
  color: ${({ theme }) => theme.colors.grey400};
  cursor: pointer;
  border: none;
  background: none;
  border-radius: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background-color: ${({ theme }) => theme.colors.red50};
  }
`;

// --- 저장/조작 버튼 컴포넌트
export const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  ${({ variant, theme }) =>
    variant === 'primary' &&
    `
    background-color: ${theme.colors.primary};
    color: white;
    &:hover { background-color: ${theme.colors.primaryHover}; transform: translateY(-1px); }
    &:active { transform: translateY(0); }
  `}

  ${({ variant, theme }) =>
    variant === 'secondary' &&
    `
    background-color: ${theme.cardBg};
    border: 1px solid ${theme.border};
    color: ${theme.textSub};
    &:hover { background-color: ${theme.border}; color: ${theme.textMain}; }
  `}

  &:disabled, &[aria-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background-color: ${({ theme }) => theme.colors.grey100};
    color: ${({ theme }) => theme.colors.grey500};
    border-color: transparent;
  }
`;

// --- 추가된 리팩토링 요소 (커스텀 토스트, 입력창, 빈 상태) ---
export const ToastContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  span {
    font-size: 14px;
    font-weight: 600;
  }
`;

export const ToastWarningButton = styled.button`
  background: ${({ theme }) => theme.colors.error};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

export const ToastCancelButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSub};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.textMain};
  }
`;

export const EmptyIconWrapper = styled.div`
  background: ${({ theme }) => theme.colors.grey50};
  padding: 8px;
  border-radius: 50%;
  margin-bottom: 16px;
`;

export const EmptyText = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.textSub};
`;

export const BottomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InputHintWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 600;
`;

export const SendButton = styled.button<{ disabled: boolean }>`
  padding: 12px;
  background: ${({ theme, disabled }) => disabled ? theme.colors.grey400 : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  transition: opacity 0.2s, background 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

export const SidebarButtonGroup = styled.div`
  display: none;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

export const MobileButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const ActiveBadge = styled.div<{ color: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  background-color: ${({ color }) => color};
  font-weight: 700;
  font-size: 13px;
  color: #333d4b;
  white-space: nowrap;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;
