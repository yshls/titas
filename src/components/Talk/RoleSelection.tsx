import React from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { MdPerson } from 'react-icons/md';

const RoleSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  height: 100%;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
`;

const RoleTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.textMain};
  font-family: 'Shantell Sans', cursive;
`;

const RoleSubtitle = styled.p`
  color: ${({ theme }) => theme.textSub};
  margin-bottom: 40px;
`;

const RoleGrid = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const RoleButton = styled.button`
  width: 140px;
  height: 160px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderSubtle};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    border-color: ${({ theme }) => theme.border};
  }
`;

const RoleAvatarCircle = styled.div<{ bgColor: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ bgColor, theme }) =>
    (theme.speaker as Record<string, string>)?.[bgColor] || bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 16px;
`;

const RoleName = styled.span`
  font-weight: 700;
  font-size: 16px;
  color: ${({ theme }) => theme.textMain};
`;

interface RoleSelectionProps {
    speakerIds: string[];
    speakerColors: Record<string, string>;
    onSelectRole: (speakerId: string) => void;
}

export const RoleSelection = React.memo(function RoleSelection({ speakerIds, speakerColors, onSelectRole }: RoleSelectionProps) {
    const { t } = useTranslation();
    return (
        <RoleSelectionContainer>
            <RoleTitle>{t('talk.whoAreYou')}</RoleTitle>
            <RoleSubtitle>{t('talk.selectRolePrompt')}</RoleSubtitle>
            <RoleGrid>
                {speakerIds.map((id) => (
                    <RoleButton key={id} onClick={() => onSelectRole(id)}>
                        <RoleAvatarCircle bgColor={speakerColors[id]}>
                            <MdPerson />
                        </RoleAvatarCircle>
                        <RoleName>{id}</RoleName>
                    </RoleButton>
                ))}
            </RoleGrid>
        </RoleSelectionContainer>
    );
});
