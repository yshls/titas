import toast, { Toaster } from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, type AppState } from '@/store/appStore';
import type { DialogueLine, ScriptData } from '@/utils/types';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MdAdd,
  MdSave,
  MdDelete,
  MdEdit,
  MdCheck,
  MdRefresh,
} from 'react-icons/md';

// --- [상수] ---

const INITIAL_SPEAKERS = [
  { id: 'A', name: 'Person A', colorKey: 'blue50' },
  { id: 'B', name: 'Person B', colorKey: 'red50' },
  { id: 'C', name: 'Person C', colorKey: 'green50' },
];

const SPEAKER_COLORS: Record<string, string> = {
  blue50: '#e8f3ff',
  red50: '#ffeeee',
  green50: '#f0faf6',
  grey50: '#f2f4f6',
};

// DialogueLine 타입에는 speakerColor가 없음, UI 표시를 위해 타입을 확장하여 사용
type CreatorDialogueLine = DialogueLine & { speakerColor: string };

// --- [스타일 컴포넌트] ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.modes.light.background};
  font-family: 'lato', sans-serif;

  @media (min-width: 1024px) {
    flex-direction: row;

    gap: 32px;
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
    height: calc(100vh - 48px);
    overflow-y: auto;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 8px;
  @media (min-width: 1024px) {
    text-align: left;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textMain};
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const SectionCard = styled.section`
  background-color: ${({ theme }) => theme.modes.light.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.modes.light.border};
  padding: 8px;
`;

const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grey700};
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TitleInput = styled.input`
  width: 100%;
  padding: 8px 0;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.modes.light.border};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textMain};
  font-weight: 700;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.textMain};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

const SpeakerRow = styled.div<{ isActive: boolean; activeBg: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.grey100 : 'transparent'};
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: ${({ isActive, theme }) =>
      isActive ? theme.colors.grey100 : theme.colors.grey50};
  }
`;

const SpeakerNameInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMain};
  outline: none;
  padding: 4px;
  border-radius: 4px;

  &:focus {
    background-color: white;
  }
`;

// 화자 색상 표시기 (원형)
const SpeakerIndicator = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  /* 테마의 border 색상을 사용하여 은은한 테두리 적용 */
  border: 1px solid ${({ theme }) => theme.modes.light.border};
  flex-shrink: 0;
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

const ScriptList = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.modes.light.cardBg};
  border: 1px solid ${({ theme }) => theme.modes.light.border};
  border-radius: 12px;
  padding: 8px;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.grey200};
    border-radius: 10px;
  }
`;

const DialogueItem = styled(motion.article)<{
  speakerColor: string;
  isEditing: boolean;
}>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.modes.light.border};
  background-color: ${({ isEditing, theme }) =>
    isEditing ? theme.colors.grey50 : 'transparent'};
  border-radius: ${({ isEditing }) => (isEditing ? '8px' : '0')};
  border-bottom-color: ${({ isEditing }) => (isEditing ? 'transparent' : '')};

  &:last-child {
    border-bottom: none;
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  .speaker-label {
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.grey700};

    margin-bottom: 4px;
  }

  .text-display {
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textMain};
    line-height: 1.6;
    cursor: text;
  }

  .edit-input {
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textMain};
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    line-height: 1.6;
    font-family: inherit;
    padding: 0;
  }
`;

const InputSection = styled(SectionCard)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  bottom: 0;
  z-index: 10;
  border-top: 1px solid ${({ theme }) => theme.modes.light.border};
  border-radius: 12px;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
  }
`;

const DialogueInput = styled.input`
  flex: 1;
  padding: 8px;
  border-radius: 8px;

  background-color: ${({ theme }) => theme.colors.grey100};
  color: ${({ theme }) => theme.colors.textMain};
  font-weight: 500;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
`;

const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger';
}>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 13px;
  transition: all 0.2s;

  ${({ variant, theme }) =>
    variant === 'primary' &&
    `
    background-color: ${theme.colors.primary};
    color: white;
    &:hover { background-color: ${theme.colors.primaryHover}; }
  `}

  ${({ variant, theme }) =>
    variant === 'secondary' &&
    `
    background-color: ${theme.colors.grey100};
    color: ${theme.colors.textMain};
    &:hover { background-color: ${theme.colors.grey200}; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActiveBadge = styled.div<{ color: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  background-color: ${({ color }) => color};
  font-weight: 800;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMain};
  white-space: nowrap;
`;

// --- [로직] ---

interface Speaker {
  id: string;
  name: string;
  colorKey: string;
}

export function CreatorPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const saveNewScript = useAppStore((state: AppState) => state.saveNewScript);

  const [speakers, setSpeakers] = useState<Speaker[]>(INITIAL_SPEAKERS);

  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('A');
  const [scriptLines, setScriptLines] = useState<CreatorDialogueLine[]>([]);
  const [scriptTitle, setScriptTitle] = useState('');
  const [lineInput, setLineInput] = useState('');
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 임시 저장 불러오기
  useEffect(() => {
    const draft = localStorage.getItem('titas_draft');
    if (draft) {
      try {
        const { title, lines, savedSpeakers } = JSON.parse(draft);
        if (title) setScriptTitle(title);
        if (lines) setScriptLines(lines);
        if (savedSpeakers) setSpeakers(savedSpeakers);
        toast('Draft restored', { icon: '📂', position: 'bottom-center' });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 자동 임시 저장
  useEffect(() => {
    const draftData = {
      title: scriptTitle,
      lines: scriptLines,
      savedSpeakers: speakers,
    };
    localStorage.setItem('titas_draft', JSON.stringify(draftData));
  }, [scriptTitle, scriptLines, speakers]);

  const handleSpeakerNameChange = (id: string, newName: string) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    );
  };

  const activeSpeaker = speakers.find((s) => s.id === activeSpeakerId);
  const activeColor = SPEAKER_COLORS[activeSpeaker?.colorKey || 'grey50'];

  const handleAddLine = () => {
    if (!lineInput.trim()) return;
    const newLine: CreatorDialogueLine = {
      id: crypto.randomUUID(),
      speakerId: activeSpeaker?.name || 'Unknown',
      originalLine: lineInput,
      speakerColor: SPEAKER_COLORS[activeSpeaker?.colorKey || 'grey50'],
      isUserTurn: false,
    };
    setScriptLines((prev) => [...prev, newLine]);
    setLineInput('');
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteLine = (id: string) => {
    setScriptLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleUpdateLine = (id: string, newText: string) => {
    setScriptLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, originalLine: newText } : line,
      ),
    );
  };

  const handleReset = () => {
    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            Clear all content?
          </span>
          <button
            onClick={() => {
              setScriptLines([]);
              setScriptTitle('');
              setSpeakers(INITIAL_SPEAKERS);
              localStorage.removeItem('titas_draft');
              toast.dismiss(t.id);
            }}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              fontSize: '12px',
              color: '#6b7684',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      ),
      { duration: 4000, style: { padding: '8px 12px' } },
    );
  };

  const handleSave = async () => {
    if (scriptLines.length === 0 || !scriptTitle.trim()) {
      toast.error('Title and lines are required.');
      return;
    }

    const newScript: ScriptData = {
      id: crypto.randomUUID(),
      title: scriptTitle.trim(),
      createdAt: Date.now(),
      lines: scriptLines,
    };

    try {
      await saveNewScript(newScript);

      setScriptLines([]);
      setScriptTitle('');
      setSpeakers(INITIAL_SPEAKERS);
      localStorage.removeItem('titas_draft');

      toast.success('Script Saved!', { icon: '✅' });
      navigate(`/talk/${newScript.id}`, {
        state: { lines: newScript.lines, scriptId: newScript.id },
      });
    } catch (error) {
      console.error('Failed to save script:', error);
      toast.error('Failed to save script.');
    }
  };

  return (
    <PageContainer>
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '12px',
          },
        }}
      />

      <Sidebar>
        <Header>
          <PageTitle>Studio</PageTitle>
        </Header>

        <SectionCard>
          <Label>Title</Label>
          <TitleInput
            placeholder="e.g. Ordering Coffee"
            value={scriptTitle}
            onChange={(e) => setScriptTitle(e.target.value)}
          />
        </SectionCard>

        <SectionCard>
          <Label>
            Characters
            <span
              style={{ fontSize: '10px', color: '#b0b8c1', fontWeight: 400 }}
            >
              Rename if needed
            </span>
          </Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {speakers.map((speaker) => {
              const bgColor = SPEAKER_COLORS[speaker.colorKey];
              const isActive = activeSpeakerId === speaker.id;

              return (
                <SpeakerRow
                  key={speaker.id}
                  isActive={isActive}
                  activeBg={bgColor}
                  onClick={() => setActiveSpeakerId(speaker.id)}
                >
                  {/* 화자 색상 표시 */}
                  <SpeakerIndicator color={bgColor} />
                  <SpeakerNameInput
                    value={speaker.name}
                    onChange={(e) =>
                      handleSpeakerNameChange(speaker.id, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Character Name"
                  />
                  {isActive && <MdCheck size={16} color="#333d4b" />}
                </SpeakerRow>
              );
            })}
          </div>
        </SectionCard>

        <div className="hidden lg:flex flex-col gap-3 mt-auto">
          <ActionButton onClick={handleReset} variant="secondary">
            <MdRefresh size={18} /> Reset
          </ActionButton>
          <ActionButton
            onClick={handleSave}
            variant="primary"
            disabled={scriptLines.length === 0}
          >
            <MdSave size={18} /> Save Script
          </ActionButton>
        </div>
      </Sidebar>

      <Main>
        <ScriptList ref={scrollContainerRef}>
          {scriptLines.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.4,
              }}
            >
              <MdEdit size={40} color={theme.colors.textDisabled} />
              <p
                style={{
                  marginTop: '16px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Start by typing a dialogue below
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {scriptLines.map((line) => (
                <DialogueItem
                  key={line.id}
                  speakerColor={line.speakerColor}
                  isEditing={editingLineId === line.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingLineId(line.id)}
                >
                  {/* 화자 색상 표시 (작게) */}
                  <SpeakerIndicator
                    color={line.speakerColor}
                    style={{
                      marginTop: '2px',
                      width: '16px', // 대화 목록에서는 조금 더 작게
                      height: '16px',
                    }}
                  />

                  <div className="content">
                    <div className="speaker-label">{line.speakerId}</div>

                    {editingLineId === line.id ? (
                      <textarea
                        className="edit-input"
                        value={line.originalLine}
                        onChange={(e) =>
                          handleUpdateLine(line.id, e.target.value)
                        }
                        onBlur={() => setEditingLineId(null)}
                        autoFocus
                        rows={Math.max(
                          1,
                          Math.ceil(line.originalLine.length / 50),
                        )}
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLine(line.id);
                    }}
                    style={{
                      padding: '4px',
                      color: theme.colors.textDisabled,
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                    }}
                  >
                    <MdDelete
                      size={16}
                      className="hover:text-red-500 transition-colors"
                    />
                  </button>
                </DialogueItem>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </ScriptList>

        <InputSection>
          <ActiveBadge color={activeColor}>{activeSpeaker?.name}</ActiveBadge>

          <DialogueInput
            value={lineInput}
            onChange={(e) => setLineInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
            placeholder={`What does ${activeSpeaker?.name} say?`}
            aria-label="Dialogue line input"
          />

          <button
            onClick={handleAddLine}
            disabled={!lineInput.trim()}
            style={{
              padding: '8px',
              backgroundColor: theme.colors.primary,
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              opacity: lineInput.trim() ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Add line"
          >
            <MdAdd size={20} />
          </button>
        </InputSection>

        <div className="flex lg:hidden gap-3">
          <ActionButton
            onClick={handleReset}
            variant="secondary"
            style={{ flex: 1 }}
            aria-label="Reset script"
          >
            <MdRefresh />
          </ActionButton>
          <ActionButton
            onClick={handleSave}
            variant="primary"
            style={{ flex: 2 }}
            disabled={scriptLines.length === 0}
          >
            Save
          </ActionButton>
        </div>
      </Main>
    </PageContainer>
  );
}
