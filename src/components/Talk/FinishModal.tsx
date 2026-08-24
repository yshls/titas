import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.cardBg};
  padding: 16px;
  border-radius: 24px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  animation: ${scaleUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textDisabled};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  &:hover {
    background: ${({ theme }) => theme.borderSubtle};
    color: ${({ theme }) => theme.textMain};
  }
`;

const ModalIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${({ theme }) => theme.speaker.speaker1};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.success};
  font-size: 32px;
  margin: 0 auto 16px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  font-family: 'Shantell Sans', cursive;
  margin-bottom: 8px;
`;

const ModalText = styled.p`
  color: ${({ theme }) => theme.textSub};
  margin-bottom: 24px;
  font-size: 15px;
`;

const ModalButtonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  &:active {
    transform: scale(0.98);
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.grey100};
  color: ${({ theme }) => theme.textMain};
  border: none;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.grey200};
  }
`;

interface FinishModalProps {
    show: boolean;
    practiceResult: { accuracy: number; timeSpent: number; } | null;
    onClose: () => void;
    onRetry: () => void;
}

export const FinishModal = React.memo(function FinishModal({ show, practiceResult, onClose, onRetry }: FinishModalProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!show || !practiceResult) {
        return null;
    }

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose} aria-label={t('talk.closeAria')}>
                    <MdClose size={20} aria-hidden="true" />
                </CloseButton>
                <ModalIcon>
                    <FiCheckCircle />
                </ModalIcon>
                <ModalTitle>{t('talk.practiceComplete')}</ModalTitle>
                <ModalText>
                    {t('talk.accuracyLabel', { accuracy: practiceResult.accuracy })} <br />
                    {t('talk.timeLabel', {
                        minutes: Math.floor(practiceResult.timeSpent / 60),
                        seconds: practiceResult.timeSpent % 60,
                    })}
                </ModalText>
                <ModalButtonStack>
                    <PrimaryButton onClick={() => navigate('/mistakes')}>
                        {t('talk.mistakeResults')}
                    </PrimaryButton>
                    <SecondaryButton onClick={onRetry}>
                        <FiRefreshCw
                            style={{ marginRight: 6, position: 'relative', top: 2 }}
                        />
                        {t('talk.tryAgain')}
                    </SecondaryButton>
                </ModalButtonStack>
            </ModalContent>
        </ModalOverlay>
    );
});
