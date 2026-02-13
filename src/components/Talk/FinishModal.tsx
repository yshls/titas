
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
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
  background: white;
  padding: 32px;
  border-radius: 24px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: ${scaleUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #9daab8;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  &:hover {
    background: #f2f4f6;
    color: #333;
  }
`;

const ModalIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #e8f5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-size: 32px;
  margin: 0 auto 16px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #333;
  margin-bottom: 8px;
`;

const ModalText = styled.p`
  color: #6b7684;
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
  color: white;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
  &:active {
    transform: scale(0.98);
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: #f2f4f6;
  color: #4e5968;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  &:hover {
    background: #e5e8eb;
  }
`;

interface FinishModalProps {
    show: boolean;
    practiceResult: { accuracy: number; timeSpent: number; } | null;
    onClose: () => void;
    onRetry: () => void;
}

export function FinishModal({ show, practiceResult, onClose, onRetry }: FinishModalProps) {
    const navigate = useNavigate();

    if (!show || !practiceResult) {
        return null;
    }

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <MdClose size={20} />
                </CloseButton>
                <ModalIcon>
                    <FiCheckCircle />
                </ModalIcon>
                <ModalTitle>Practice Complete!</ModalTitle>
                <ModalText>
                    Accuracy: {practiceResult.accuracy}% <br />
                    Time: {Math.floor(practiceResult.timeSpent / 60)}m{' '}
                    {practiceResult.timeSpent % 60}s
                </ModalText>
                <ModalButtonStack>
                    <PrimaryButton onClick={() => navigate('/mistakes')}>
                        Mistake Results
                    </PrimaryButton>
                    <SecondaryButton onClick={onRetry}>
                        <FiRefreshCw
                            style={{ marginRight: 6, position: 'relative', top: 2 }}
                        />
                        Try Again
                    </SecondaryButton>
                </ModalButtonStack>
            </ModalContent>
        </ModalOverlay>
    );
}
