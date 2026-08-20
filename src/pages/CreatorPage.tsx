import toast from 'react-hot-toast';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';
import { AnimatePresence } from 'framer-motion';
import { generateUUID } from '@/utils/uuid';
import {
  MdAdd,
  MdSave,
  MdDelete,
  MdEdit,
  MdRefresh,
  MdPlayArrow,
  MdInfoOutline,
} from 'react-icons/md';

import type { ScriptData } from '@/utils/types';
import { useCreatorEngine } from '@/hooks/pageSpecific/useCreatorEngine';
import {
  PageTitle,
  SectionCard,
  Label,
  LabelSubText,
  SpeakerListContainer,
  TitleInput,
  VisuallyHiddenLabel,
  SpeakerItem,
  SpeakerIndicator,
  ScriptListWrapper,
  DialogueItemWrapper,
  DeleteLineButton,
  ActionButton,
  ActiveBadge,
  SidebarButtonGroup,
  MobileButtonGroup,
  ToastContainer,
  ToastWarningButton,
  ToastCancelButton,
  EmptyIconWrapper,
  EmptyText,
  BottomWrapper,
  InputHintWrapper,
  SendButton,
} from '@/components/Creator/CreatorLayout';

import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

// --- 레이아웃 관련 남은 컨테이너들 ---
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  font-family: 'lato', sans-serif;
  transition: background-color 0.3s ease;

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 32px;
    padding: 8px;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;

  @media (min-width: 1024px) {
    width: 320px;
    position: sticky;
    top: 24px;
    height: fit-content;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;

  @media (min-width: 1024px) {
    height: calc(100vh - 48px);
  }
`;

const InputSection = styled(SectionCard)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  bottom: 0;
  z-index: 10;
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 10px;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DialogueInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.textMain};
  border: 1px solid transparent;
  font-weight: 500;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    background-color: ${({ theme }) => theme.cardBg};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSub};
    opacity: 0.8;
  }
`;

export function CreatorPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const { saveNewScript, language } = useAppStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 로직을 담당하는 Engine 훅 사용
  const {
    speakers,
    activeSpeakerId,
    setActiveSpeakerId,
    scriptLines,
    scriptTitle,
    setScriptTitle,
    lineInput,
    setLineInput,
    editingLineId,
    setEditingLineId,
    messagesEndRef,
    activeSpeaker,
    activeColor,
    handleSpeakerNameChange,
    handleAddLine,
    handleDeleteLine,
    handleUpdateLine,
    wipeDraft,
  } = useCreatorEngine();

  const handleReset = () => {
    toast((toastInstance) => (
      <ToastContainer>
        <span>{t('creator.wipeConfirmTitle')}</span>
        <ToastWarningButton onClick={() => { wipeDraft(); toast.dismiss(toastInstance.id); }}>
          {t('creator.wipeConfirmButton')}
        </ToastWarningButton>
        <ToastCancelButton onClick={() => toast.dismiss(toastInstance.id)}>
          {t('common.button.cancel')}
        </ToastCancelButton>
      </ToastContainer>
    ), { duration: 4000 });
  };

  const handleSave = async (shouldPractice = false) => {
    if (scriptLines.length === 0 || !scriptTitle.trim()) {
      toast.error(t('creator.missingFields'));
      return;
    }

    const newScript: ScriptData = {
      id: generateUUID(),
      title: scriptTitle.trim(),
      createdAt: Date.now(),
      lines: scriptLines,
      characters: speakers,
    };

    try {
      await saveNewScript(newScript);
      wipeDraft();

      if (shouldPractice) {
        navigate(`/talk/${newScript.id}`, {
          state: { lines: newScript.lines, scriptId: newScript.id },
        });
        return;
      }
      toast.success(t('creator.saveSuccess'));
    } catch (error) {
      toast.error(t('creator.saveFailed'));
    }
  };

  const seoProps = language === 'en'
    ? { title: 'Create a New Script', description: 'Create your own English shadowing script.' }
    : { title: '새 스크립트 작성하기', description: '나만의 영어 쉐도잉 스크립트를 만드세요.' };

  return (
    <PageContainer>
      <Seo {...seoProps} />

      <Sidebar>
        <header><PageTitle>{t('creator.pageTitle')}</PageTitle></header>

        <SectionCard>
          <VisuallyHiddenLabel htmlFor="script-title-input">{t('creator.scriptTitle')}</VisuallyHiddenLabel>
          <Label>{t('creator.titleLabel')}</Label>
          <TitleInput
            id="script-title-input"
            placeholder={t('creator.newTitlePlaceholder')}
            value={scriptTitle}
            onChange={(e) => setScriptTitle(e.target.value)}
            aria-label={t('creator.scriptTitle')}
          />
        </SectionCard>

        <SectionCard>
          <Label>{t('creator.charactersLabel')} <LabelSubText>{t('creator.charactersHint')}</LabelSubText></Label>
          <SpeakerListContainer>
            {speakers.map((speaker) => (
              <SpeakerItem
                key={speaker.id}
                speaker={speaker}
                isActive={activeSpeakerId === speaker.id}
                onNameChange={handleSpeakerNameChange}
                onClick={() => setActiveSpeakerId(speaker.id)}
              />
            ))}
          </SpeakerListContainer>
        </SectionCard>

        <SidebarButtonGroup>
          <ActionButton onClick={handleReset} variant="secondary">
            <MdRefresh size={18} /> {t('creator.reset')}
          </ActionButton>
          <ActionButton onClick={() => handleSave(false)} variant="secondary" disabled={scriptLines.length === 0} aria-disabled={scriptLines.length === 0}>
            <MdSave size={20} /> {t('creator.saveScript')}
          </ActionButton>
          <ActionButton onClick={() => handleSave(true)} variant="primary" disabled={scriptLines.length === 0} aria-disabled={scriptLines.length === 0}>
            <MdPlayArrow size={20} /> {t('creator.saveAndPractice')}
          </ActionButton>
        </SidebarButtonGroup>
      </Sidebar>

      <Main>
        <ScriptListWrapper ref={scrollContainerRef} aria-live="polite">
          {scriptLines.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
              <EmptyIconWrapper>
                <MdEdit size={32} color={theme.colors.grey400} />
              </EmptyIconWrapper>
              <EmptyText>{t('creator.emptyState')}</EmptyText>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {scriptLines.map((line) => (
                <DialogueItemWrapper
                  key={line.id}
                  isEditing={editingLineId === line.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingLineId(line.id)}
                >
                  <SpeakerIndicator color={line.speakerColor} inDialogue />
                  <div className="content">
                    <div className="speaker-label">
                      {speakers.find((s) => s.id === line.speakerId)?.name || line.speakerId}
                    </div>
                    {editingLineId === line.id ? (
                      <textarea
                        className="edit-input"
                        value={line.originalLine}
                        onChange={(e) => handleUpdateLine(line.id, e.target.value)}
                        onBlur={() => setEditingLineId(null)}
                        autoFocus
                        rows={Math.max(1, Math.ceil(line.originalLine.length / 50))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            setEditingLineId(null);
                          }
                        }}
                        aria-label={t('creator.dialogueEditAria')}
                      />
                    ) : (
                      <p className="text-display">{line.originalLine}</p>
                    )}
                  </div>
                  <DeleteLineButton
                    onClick={(e) => { e.stopPropagation(); handleDeleteLine(line.id); }}
                    aria-label={t('creator.deleteLineAria')}
                  >
                    <MdDelete size={18} />
                  </DeleteLineButton>
                </DialogueItemWrapper>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </ScriptListWrapper>

        <BottomWrapper>
          <InputSection>
            <ActiveBadge color={activeColor}>{activeSpeaker?.name}</ActiveBadge>
            <InputGroup>
              <InputHintWrapper tabIndex={0} role="note" aria-label={t('creator.lineHint')}>
                <MdInfoOutline size={12} aria-hidden="true" /> {t('creator.lineHint')}
              </InputHintWrapper>
              <VisuallyHiddenLabel htmlFor="dialogue-text-input">{t('creator.dialogueInputAria')}</VisuallyHiddenLabel>
              <DialogueInput
                id="dialogue-text-input"
                value={lineInput}
                onChange={(e) => setLineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
                placeholder={t('creator.dialoguePlaceholder', { name: activeSpeaker?.name })}
                aria-label={t('creator.dialogueInputAria')}
              />
            </InputGroup>
            <SendButton onClick={handleAddLine} disabled={!lineInput.trim()} aria-label={t('creator.addLineAria')}>
              <MdAdd size={22} />
            </SendButton>
          </InputSection>

          {/* 모바일에서만 보이는 버튼 그룹 */}
          <MobileButtonGroup>
            <ActionButton onClick={handleReset} variant="secondary">
              <MdRefresh size={18} /> {t('creator.reset')}
            </ActionButton>
            <ActionButton onClick={() => handleSave(false)} variant="secondary" disabled={scriptLines.length === 0} aria-disabled={scriptLines.length === 0}>
              <MdSave size={18} /> {t('common.button.save')}
            </ActionButton>
            <ActionButton onClick={() => handleSave(true)} variant="primary" disabled={scriptLines.length === 0} aria-disabled={scriptLines.length === 0}>
              <MdPlayArrow size={18} /> {t('creator.practice')}
            </ActionButton>
          </MobileButtonGroup>
        </BottomWrapper>
      </Main>
    </PageContainer>
  );
}
