import { useState, useRef, useEffect } from 'react';
import { generateUUID } from '@/utils/uuid';
import { SPEAKER_COLORS } from '@/components/Creator/CreatorLayout';

export interface Speaker {
  id: string;
  name: string;
  colorKey: string;
}

export type CreatorDialogueLine = {
  id: string;
  speakerId: string;
  originalLine: string;
  speakerColor: string;
  isUserTurn: boolean;
};

export const INITIAL_SPEAKERS: Speaker[] = [
  { id: 'A', name: 'Person A', colorKey: 'blue50' },
  { id: 'B', name: 'Person B', colorKey: 'red50' },
  { id: 'C', name: 'Person C', colorKey: 'green50' },
];

export function useCreatorEngine() {
  const [speakers, setSpeakers] = useState<Speaker[]>(INITIAL_SPEAKERS);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('A');
  const [scriptLines, setScriptLines] = useState<CreatorDialogueLine[]>([]);
  const [scriptTitle, setScriptTitle] = useState('');
  const [lineInput, setLineInput] = useState('');
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 임시저장 데이터 로드 시작 시 딱 1번 실행
  useEffect(() => {
    const draft = localStorage.getItem('titas_draft');
    if (draft) {
      try {
        const { title, lines, savedSpeakers } = JSON.parse(draft);
        if (title) setScriptTitle(title);
        if (lines) setScriptLines(lines);
        if (savedSpeakers) setSpeakers(savedSpeakers);
      } catch (e) {
        console.error('Failed to parse draft', e);
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

  const activeSpeaker = speakers.find((s) => s.id === activeSpeakerId);
  const activeColor = SPEAKER_COLORS[activeSpeaker?.colorKey || 'grey50'] || '#f3f4f6';

  const handleSpeakerNameChange = (id: string, newName: string) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    );
  };

  const handleAddLine = () => {
    if (!lineInput.trim()) return;

    // 구두점을 기준으로 문장 분리 로직 (비즈니스 로직 핵심)
    const matches = lineInput.match(/[^.?!]+[.?!]+|[^.?!]+$/g);
    if (!matches) return;

    const newLines: CreatorDialogueLine[] = matches
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .map((text) => {
        return {
          id: generateUUID(),
          speakerId: activeSpeaker?.id || 'A',
          originalLine: text,
          speakerColor: SPEAKER_COLORS[activeSpeaker?.colorKey || 'grey50'] || '#f3f4f6',
          isUserTurn: false,
        };
      });

    setScriptLines((prev) => [...prev, ...newLines]);
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

  const wipeDraft = () => {
    setScriptLines([]);
    setScriptTitle('');
    setSpeakers(INITIAL_SPEAKERS);
    localStorage.removeItem('titas_draft');
  };

  return {
    speakers,
    setSpeakers,
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
  };
}
