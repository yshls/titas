import React from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { MdPerson } from 'react-icons/md';

const RoleSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 100%;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
`;

const RoleTitle = styled.h1`
  font-size: clamp(22px, 3.5vh, 28px);
  font-weight: 800;
  margin-bottom: clamp(4px, 1vh, 10px);
  color: ${({ theme }) => theme.textMain};
  font-family: 'Shantell Sans', cursive;
  text-align: center;
`;

const RoleSubtitle = styled.p`
  color: ${({ theme }) => theme.textSub};
  margin-bottom: clamp(16px, 3vh, 40px);
  font-size: clamp(13px, 1.8vh, 15px);
  text-align: center;
`;

const RoleGrid = styled.div`
  display: flex;
  gap: clamp(10px, 2vh, 16px);
  flex-wrap: wrap;
  justify-content: center;
  max-width: 680px;
  width: 100%;
`;

const RoleButton = styled.button`
  flex: 1 1 clamp(100px, 25vw, 140px);
  max-width: 140px;
  min-height: clamp(110px, 16vh, 160px);
  padding: clamp(10px, 1.5vh, 16px);
  border-radius: clamp(16px, 2.5vh, 24px);
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
    border-color: ${({ theme }) => theme.border};
  }
`;

const RoleAvatarCircle = styled.div<{ bgColor: string }>`
  width: clamp(40px, 6vh, 56px);
  height: clamp(40px, 6vh, 56px);
  border-radius: 50%;
  background-color: ${({ bgColor, theme }) =>
    (theme.speaker as Record<string, string>)?.[bgColor] || bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(18px, 2.8vh, 24px);
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: clamp(8px, 1.5vh, 16px);
`;

const RoleName = styled.span`
  font-weight: 700;
  font-size: clamp(13px, 1.8vh, 16px);
  color: ${({ theme }) => theme.textMain};
  text-align: center;
  word-break: break-word;
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
