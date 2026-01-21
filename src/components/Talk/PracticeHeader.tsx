
import styled from '@emotion/styled';
import { MdArrowBack } from 'react-icons/md';

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 20;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderTitle = styled.span`
  font-weight: 700;
  font-size: 16px;
  color: #333;
`;

const BackButton = styled.button`
  padding: 8px;
  margin-left: -8px;
  border-radius: 50%;
  color: ${({ theme }) => theme.textMain};
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ProgressPill = styled.div`
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.textSub};
  font-feature-settings: 'tnum';
`;

interface PracticeHeaderProps {
    onStop: () => void;
    currentIndex: number;
    total: number;
}

export function PracticeHeader({ onStop, currentIndex, total }: PracticeHeaderProps) {
    return (
        <Header>
            <HeaderLeft>
                <BackButton onClick={onStop}>
                    <MdArrowBack size={24} />
                </BackButton>
                <HeaderTitle>Talking Practice</HeaderTitle>
            </HeaderLeft>
            <ProgressPill>
                {Math.min(currentIndex + 1, total)} / {total}
            </ProgressPill>
        </Header>
    );
}
