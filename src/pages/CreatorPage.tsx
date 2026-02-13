import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';

import type { DialogueLine, ScriptData } from '@/utils/types';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateUUID } from '@/utils/uuid';
import {
  MdAdd,
  MdSave,
  MdDelete,
  MdEdit,
  MdCheck,
  MdRefresh,
  MdPlayArrow,
  MdInfoOutline,
} from 'react-icons/md';

// 상수 정의

const INITIAL_SPEAKERS = [
  { id: 'A', name: 'Person A', colorKey: 'blue50' },
  { id: 'B', name: 'Person B', colorKey: 'red50' },
  { id: 'C', name: 'Person C', colorKey: 'green50' },
];

const SPEAKER_COLORS: Record<string, string> = {
  blue50: '#e8f3ff',
  red50: '#ffeeee',
  green50: '#f0faf6',
};

type CreatorDialogueLine = DialogueLine & { speakerColor: string };

// 스타일 컴포넌트 정의

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

const Header = styled.header`
  text-align: left;
  // margin-bottom: 8px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
`;

const SectionCard = styled.section`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 10px;
`;

const Label = styled.label`
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

const LabelSubText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SpeakerListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TitleInput = styled.input`
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
    color: ${({ theme }) => theme.textDisabled};
  }
`;

const SpeakerRow = styled.div<{ isActive: boolean; activeBg: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.border : 'transparent'};
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

const SpeakerIndicator = styled.div<{ color: string; inDialogue?: boolean }>`
  width: ${({ inDialogue }) => (inDialogue ? '24px' : '20px')};
  height: ${({ inDialogue }) => (inDialogue ? '24px' : '20px')};
  margin-top: ${({ inDialogue }) => (inDialogue ? '4px' : '0')};
  border-radius: 6px;
  background-color: ${({ color }) => color};
  border: 1px solid rgba(0, 0, 0, 0.05);
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

const EmptyScriptContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
`;

const EmptyScriptIconWrapper = styled.div`
  background: ${({ theme }) => theme.colors.grey50};
  padding: 8px;
  border-radius: 50%;
  margin-bottom: 16px;
`;

const EmptyScriptText = styled.p`
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.textSub};
`;

const DeleteLineButton = styled.button`
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

const DialogueItem = styled(motion.article)<{
  isEditing: boolean;
}>`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ isEditing, theme }) =>
    isEditing ? theme.background : 'transparent'};
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

// 입력 힌트 텍스트 스타일
const InputHintText = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 600;
  margin-bottom: -4px;
  margin-left: 4px;
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

const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger';
}>`
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
    &:hover { 
      background-color: ${theme.colors.primaryHover}; 
      transform: translateY(-1px);
    }
    &:active { transform: translateY(0); }
  `}

  ${({ variant, theme }) =>
    variant === 'secondary' &&
    `
    background-color: ${theme.cardBg};
    border: 1px solid ${theme.border};
    color: ${theme.textSub};
    &:hover { 
      background-color: ${theme.border};
      color: ${theme.textMain};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActiveBadge = styled.div<{ color: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  background-color: ${({ color }) => color};
  font-weight: 700;
  font-size: 13px;
  color: #333d4b;
  white-space: nowrap;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const SidebarButtonGroup = styled.div`
  display: none;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

const MobileButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const InputAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AddLineButton = styled.button`
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 토스트 메시지 컴포넌트
const ToastContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ToastRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ToastMessage = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const ToastTitle = styled.div`
  font-weight: bold;
  font-size: 15px;
`;

const ToastSubtitle = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSub};
`;

const ResetConfirmButton = styled.button`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  border: none;
  cursor: pointer;
`;

const ResetCancelButton = styled.button`
  font-size: 12px;
  color: ${({ theme }) => theme.textSub};
  background: none;
  border: none;
  cursor: pointer;
`;

const ToastButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const ToastButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: ${({ primary, theme }) =>
    primary ? 'none' : `1px solid ${theme.border}`};
  background: ${({ primary, theme }) =>
    primary ? theme.colors.primary : theme.cardBg};
  color: ${({ primary, theme }) => (primary ? 'white' : theme.textMain)};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

// 로직 구현

interface Speaker {
  id: string;
  name: string;
  colorKey: string;
}

export function CreatorPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { saveNewScript, language } = useAppStore();

  const [speakers, setSpeakers] = useState<Speaker[]>(INITIAL_SPEAKERS);

  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('A');
  const [scriptLines, setScriptLines] = useState<CreatorDialogueLine[]>([]);
  const [scriptTitle, setScriptTitle] = useState('');
  const [lineInput, setLineInput] = useState('');
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);



  // 임시저장 데이터 로드
  useEffect(() => {
    const draft = localStorage.getItem('titas_draft');
    if (draft) {
      try {
        const { title, lines, savedSpeakers } = JSON.parse(draft);
        if (title) setScriptTitle(title);
        if (lines) setScriptLines(lines);
        if (savedSpeakers) setSpeakers(savedSpeakers);


      } catch (e) {
        // 에러 무시
      }
    }
  }, []);

  // 변경사항 자동 저장
  useEffect(() => {
    const draftData = {
      title: scriptTitle,
      lines: scriptLines,
      savedSpeakers: speakers,
    };
    localStorage.setItem('titas_draft', JSON.stringify(draftData));
  }, [scriptTitle, scriptLines, speakers]);

  // 화자 이름 변경
  const handleSpeakerNameChange = (id: string, newName: string) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    );
  };

  const activeSpeaker = speakers.find((s) => s.id === activeSpeakerId);
  const activeColor =
    SPEAKER_COLORS[activeSpeaker?.colorKey || 'grey50'] || theme.colors.grey50;

  // 대사 추가 및 문장 자동 분리
  const handleAddLine = () => {
    if (!lineInput.trim()) return;

    // 정규식 활용: 구두점(.?!) 뒤에서 분리
    const matches = lineInput.match(/[^.?!]+[.?!]+|[^.?!]+$/g);

    if (!matches) return;

    const newLines = matches
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .map((text) => {
        return {
          id: generateUUID(),
          speakerId: activeSpeaker?.name || 'Unknown',
          originalLine: text,
          speakerColor:
            SPEAKER_COLORS[activeSpeaker?.colorKey || 'grey50'] ||
            theme.colors.grey50,
          isUserTurn: false,
        };
      });

    setScriptLines((prev) => [...prev, ...newLines]);
    setLineInput('');
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 대사 삭제
  const handleDeleteLine = (id: string) => {
    setScriptLines((prev) => prev.filter((line) => line.id !== id));
  };

  // 대사 수정
  const handleUpdateLine = (id: string, newText: string) => {
    setScriptLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, originalLine: newText } : line,
      ),
    );
  };

  // 초기화
  const handleReset = () => {
    toast(
      (t) => (
        <ToastRow>
          <ToastMessage>Wipe everything?</ToastMessage>
          <ResetConfirmButton
            onClick={() => {
              setScriptLines([]);
              setScriptTitle('');
              setSpeakers(INITIAL_SPEAKERS);
              localStorage.removeItem('titas_draft');
              toast.dismiss(t.id);
            }}
            aria-label="Confirm Clear"
          >
            Clear
          </ResetConfirmButton>
          <ResetCancelButton
            onClick={() => toast.dismiss(t.id)}
            aria-label="Cancel Clear"
          >
            Cancel
          </ResetCancelButton>
        </ToastRow>
      ),
      {
        duration: 4000,
        style: {
          padding: '8px 12px',
          background: theme.cardBg,
          color: theme.textMain,
          border: `1px solid ${theme.border}`,
          boxShadow: 'none',
        },
      },
    );
  };

  // 스크립트 저장 및 연습 이동
  const handleSave = async (shouldPractice = false) => {
    if (scriptLines.length === 0 || !scriptTitle.trim()) {
      toast.error('Missing title or lines!', {
        style: {
          border: `1px solid ${theme.colors.red100}`,
          color: theme.colors.red800,
          background: theme.colors.red50,
        },
      });
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

      setScriptLines([]);
      setScriptTitle('');
      setSpeakers(INITIAL_SPEAKERS);
      localStorage.removeItem('titas_draft');

      if (shouldPractice === true) {
        navigate(`/talk/${newScript.id}`, {
          state: { lines: newScript.lines, scriptId: newScript.id },
        });
        return;
      }

      toast(
        (t) => (
          <ToastContent>
            <ToastTitle>Script saved successfully! 🎉</ToastTitle>
            <ToastSubtitle>What's next?</ToastSubtitle>
            <ToastButtonRow>
              <ToastButton onClick={() => toast.dismiss(t.id)}>
                <MdAdd size={16} /> Create New
              </ToastButton>
              <ToastButton
                primary
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/talk/${newScript.id}`, {
                    state: {
                      lines: newScript.lines,
                      scriptId: newScript.id,
                    },
                  });
                }}
              >
                <MdPlayArrow size={16} /> Practice
              </ToastButton>
            </ToastButtonRow>
          </ToastContent>
        ),
        {
          duration: 6000,
          style: {
            background: theme.cardBg,
            color: theme.textMain,
            border: `1px solid ${theme.border}`,
            boxShadow: 'none',
          },
        },
      );
    } catch (error) {
      toast.error('Failed to save script.');
    }
  };

  const seoProps =
    language === 'en'
      ? {
          title: 'Create a New Script',
          description:
            'Create your own English shadowing script and start practicing conversation with the sentences you want.',
        }
      : {
          title: '새 스크립트 작성하기',
          description:
            '나만의 영어 쉐도잉 스크립트를 만들고, 원하는 문장으로 회화 연습을 시작하세요.',
        };

  return (
    <PageContainer>
      <Seo {...seoProps} />



      <Sidebar>
        <Header>
          <PageTitle>New Script</PageTitle>
        </Header>

        <SectionCard>
          <Label>Title</Label>
          <TitleInput
            placeholder="e.g. Ordering Coffee"
            value={scriptTitle}
            onChange={(e) => setScriptTitle(e.target.value)}
            aria-label="Script Title"
          />
        </SectionCard>

        <SectionCard>
          <Label>
            Characters
            {/* 캐릭터 이름 변경 안내 */}
            <LabelSubText>Tap names to customize</LabelSubText>
          </Label>
          <SpeakerListContainer>
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
                  <SpeakerIndicator color={bgColor} />
                  <SpeakerNameInput
                    value={speaker.name}
                    onChange={(e) =>
                      handleSpeakerNameChange(speaker.id, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Name"
                    aria-label={`Character Name ${speaker.id}`}
                  />
                  {isActive && (
                    <MdCheck size={18} color={theme.colors.primary} />
                  )}
                </SpeakerRow>
              );
            })}
          </SpeakerListContainer>
        </SectionCard>

        <SidebarButtonGroup>
          <ActionButton
            onClick={handleReset}
            variant="secondary"
            aria-label="Reset script"
          >
            <MdRefresh size={18} /> Reset
          </ActionButton>
          <ActionButton
            onClick={() => handleSave(false)}
            variant="secondary"
            disabled={scriptLines.length === 0}
            aria-label="Save Script"
          >
            <MdSave size={20} /> Save Script
          </ActionButton>
          <ActionButton
            onClick={() => handleSave(true)}
            variant="primary"
            disabled={scriptLines.length === 0}
            aria-label="Save and Practice"
          >
            <MdPlayArrow size={20} /> Save & Practice
          </ActionButton>
        </SidebarButtonGroup>
      </Sidebar>

      <Main>
        <ScriptList ref={scrollContainerRef}>
          {scriptLines.length === 0 ? (
            <EmptyScriptContainer>
              <EmptyScriptIconWrapper>
                <MdEdit size={32} color={theme.colors.grey400} />
              </EmptyScriptIconWrapper>
              <EmptyScriptText>
                Start by typing a dialogue below
              </EmptyScriptText>
            </EmptyScriptContainer>
          ) : (
            <AnimatePresence initial={false}>
              {scriptLines.map((line) => (
                <DialogueItem
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
                        aria-label="Edit dialogue line"
                      />
                    ) : (
                      <p className="text-display">{line.originalLine}</p>
                    )}
                  </div>

                  <DeleteLineButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLine(line.id);
                    }}
                    aria-label="Delete line"
                  >
                    <MdDelete size={18} />
                  </DeleteLineButton>
                </DialogueItem>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </ScriptList>

        <InputAreaContainer>
          <InputSection>
            <ActiveBadge color={activeColor}>{activeSpeaker?.name}</ActiveBadge>

            <InputGroup>
              {/* 문장 자동 분리 안내 */}
              <InputHintText>
                <MdInfoOutline size={12} />
                Pro tip: Lines split automatically by punctuation (. ? !)
              </InputHintText>
              <DialogueInput
                value={lineInput}
                onChange={(e) => setLineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
                placeholder={`What does ${activeSpeaker?.name} say?`}
                aria-label="Dialogue line input"
              />
            </InputGroup>

            <AddLineButton
              onClick={handleAddLine}
              disabled={!lineInput.trim()}
              aria-label="Add line"
            >
              <MdAdd size={22} />
            </AddLineButton>
          </InputSection>

          <MobileButtonGroup>
            <ActionButton
              onClick={handleReset}
              variant="secondary"
              aria-label="Reset script"
            >
              <MdRefresh size={18} /> Reset
            </ActionButton>
            <ActionButton
              onClick={() => handleSave(false)}
              variant="secondary"
              disabled={scriptLines.length === 0}
              aria-label="Save Script"
            >
              <MdSave size={18} /> Save
            </ActionButton>
            <ActionButton
              onClick={() => handleSave(true)}
              variant="primary"
              disabled={scriptLines.length === 0}
              aria-label="Save and Practice"
            >
              <MdPlayArrow size={18} /> Practice
            </ActionButton>
          </MobileButtonGroup>
        </InputAreaContainer>
      </Main>
    </PageContainer>
  );
}
