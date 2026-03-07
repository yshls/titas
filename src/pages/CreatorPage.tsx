import toast from 'react-hot-toast';
import { useRef } from 'react';
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
import { useCreatorEngine, INITIAL_SPEAKERS } from '@/hooks/pageSpecific/useCreatorEngine';
import {
  PageTitle,
  SectionCard,
  Label,
  LabelSubText,
  SpeakerListContainer,
  TitleInput,
  SpeakerItem,
  SpeakerIndicator,
  ScriptListWrapper,
  DialogueItemWrapper,
  DeleteLineButton,
  ActionButton,
  ActiveBadge,
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
    color: ${({ theme }) => theme.textDisabled};
  }
`;

// 간소화된 토스트 컴포넌트
const EmptyScriptContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
`;

export function CreatorPage() {
  const navigate = useNavigate();
  const theme = useTheme();
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
    toast((t) => (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>Wipe everything?</span>
        <button
          style={{ background: theme.colors.error, color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => { wipeDraft(); toast.dismiss(t.id); }}
        >
          Clear
        </button>
        <button
          style={{ background: 'none', border: 'none', color: theme.textSub, cursor: 'pointer' }}
          onClick={() => toast.dismiss(t.id)}
        >
          Cancel
        </button>
      </div>
    ), { duration: 4000 });
  };

  const handleSave = async (shouldPractice = false) => {
    if (scriptLines.length === 0 || !scriptTitle.trim()) {
      toast.error('Missing title or lines!');
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
      toast.success('Script saved successfully! 🎉');
    } catch (error) {
      toast.error('Failed to save script.');
    }
  };

  const seoProps = language === 'en'
    ? { title: 'Create a New Script', description: 'Create your own English shadowing script.' }
    : { title: '새 스크립트 작성하기', description: '나만의 영어 쉐도잉 스크립트를 만드세요.' };

  return (
    <PageContainer>
      <Seo {...seoProps} />

      <Sidebar>
        <header><PageTitle>New Script</PageTitle></header>

        <SectionCard>
          <Label>Title</Label>
          <TitleInput
            placeholder="e.g. Ordering Coffee"
            value={scriptTitle}
            onChange={(e) => setScriptTitle(e.target.value)}
          />
        </SectionCard>

        <SectionCard>
          <Label>Characters <LabelSubText>Tap names to customize</LabelSubText></Label>
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

        {/* 데스크탑에서만 보이는 버튼 그룹 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <ActionButton onClick={handleReset} variant="secondary">
            <MdRefresh size={18} /> Reset
          </ActionButton>
          <ActionButton onClick={() => handleSave(false)} variant="secondary" disabled={scriptLines.length === 0}>
            <MdSave size={20} /> Save Script
          </ActionButton>
          <ActionButton onClick={() => handleSave(true)} variant="primary" disabled={scriptLines.length === 0}>
            <MdPlayArrow size={20} /> Save & Practice
          </ActionButton>
        </div>
      </Sidebar>

      <Main>
        <ScriptListWrapper ref={scrollContainerRef}>
          {scriptLines.length === 0 ? (
            <EmptyScriptContainer>
              <div style={{ background: theme.colors.grey50, padding: '8px', borderRadius: '50%', marginBottom: '16px' }}>
                <MdEdit size={32} color={theme.colors.grey400} />
              </div>
              <p style={{ fontWeight: 600, color: theme.textSub }}>Start by typing a dialogue below</p>
            </EmptyScriptContainer>
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
                    <div className="speaker-label">{line.speakerId}</div>
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
                      />
                    ) : (
                      <p className="text-display">{line.originalLine}</p>
                    )}
                  </div>
                  <DeleteLineButton onClick={(e) => { e.stopPropagation(); handleDeleteLine(line.id); }}>
                    <MdDelete size={18} />
                  </DeleteLineButton>
                </DialogueItemWrapper>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </ScriptListWrapper>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <InputSection>
            <ActiveBadge color={activeColor}>{activeSpeaker?.name}</ActiveBadge>
            <InputGroup>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: theme.textSub, fontWeight: 600 }}>
                <MdInfoOutline size={12} /> Lines split automatically by punctuation (. ? !)
              </div>
              <DialogueInput
                value={lineInput}
                onChange={(e) => setLineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
                placeholder={`What does ${activeSpeaker?.name} say?`}
              />
            </InputGroup>
            <button
              onClick={handleAddLine}
              disabled={!lineInput.trim()}
              style={{ padding: '12px', background: theme.colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: !lineInput.trim() ? 0.6 : 1 }}
            >
              <MdAdd size={22} />
            </button>
          </InputSection>
        </div>
      </Main>
    </PageContainer>
  );
}
