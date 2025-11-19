import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import type { DialogueLine, ScriptData } from '@/utils/types';
import { parseScript } from '@/utils/parser';
import {
  MdAdd,
  MdSave,
  MdPlayArrow,
  MdPerson,
  MdDelete,
  MdEdit,
  MdCheck,
} from 'react-icons/md';

// 화자 설정 - 커스텀 컬러 적용
const SPEAKERS = [
  { id: 'Speaker 1', hex: '#c4b5d5', name: 'Person A' },
  { id: 'Speaker 2', hex: '#b5d0b1', name: 'Person B' },
  { id: 'Speaker 3', hex: '#cbbfae', name: 'Person C' },
];

export function CreatorPage() {
  const navigate = useNavigate();
  const saveNewScript = useAppStore((state) => state.saveNewScript);
  const currentScripts = useAppStore((state) => state.allScripts);

  const [activeSpeakerId, setActiveSpeakerId] = useState<string>(
    SPEAKERS[0].id
  );
  const [currentLineInput, setCurrentLineInput] = useState('');
  const [scriptLines, setScriptLines] = useState<DialogueLine[]>([]);
  const [scriptTitle, setScriptTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const speakerColorMap = SPEAKERS.reduce((acc, speaker) => {
    acc[speaker.id] = speaker.hex;
    return acc;
  }, {} as Record<string, string>);

  const handleAddLine = () => {
    if (currentLineInput.trim() === '') return;
    const newLines = parseScript(
      `${activeSpeakerId}: ${currentLineInput}`,
      speakerColorMap
    );
    setScriptLines([...scriptLines, ...newLines]);
    setCurrentLineInput('');
  };

  const handleDeleteLine = (lineId: string) => {
    setScriptLines(scriptLines.filter((line) => line.id !== lineId));
  };

  const handleSaveScript = () => {
    if (scriptLines.length === 0) {
      alert('저장하려면 최소 한 줄 이상의 대사가 필요합니다.');
      return;
    }
    if (!scriptTitle.trim()) {
      alert('스크립트 제목을 입력해주세요.');
      return;
    }
    const newScript: ScriptData = {
      id: crypto.randomUUID(),
      title: scriptTitle.trim(),
      createdAt: Date.now(),
      lines: scriptLines,
    };
    saveNewScript(newScript);
    setScriptLines([]);
    setScriptTitle(`Untitled Script #${currentScripts.length + 2}`);
    alert(
      `[${newScript.title}] 스크립트가 저장되었습니다! (총 ${
        currentScripts.length + 1
      }개)`
    );
  };

  const handleStartPractice = () => {
    if (scriptLines.length === 0) {
      alert('연습을 시작하려면 대사가 필요합니다.');
      return;
    }
    navigate('/talk/practice', { state: { lines: scriptLines } });
  };

  const activeSpeaker = SPEAKERS.find((s) => s.id === activeSpeakerId);

  return (
    <div
      className="flex flex-col lg:flex-row h-screen gap-4"
      role="main"
      aria-label="Script creator"
    >
      {/* 사이드바 - 데스크탑에서만 주요 버튼/통계 표시 */}
      <aside
        className="lg:w-80 shrink-0 space-y-4 flex flex-col"
        aria-label="Script settings and controls"
      >
        {/* 헤더 */}
        <header>
          <h1 className="text-4xl font-black text-primary mb-2 uppercase font-display">
            Script Creator
          </h1>
          <p className="text-sm font-bold text-textSecondary">
            Build your practice dialogue
          </p>
        </header>
        {/* 제목 입력 */}
        <section
          className="bg-white rounded-2xl border-3 border-textPrimary p-4"
          aria-labelledby="title-section"
        >
          <label
            id="title-section"
            htmlFor="script-title"
            className="block text-sm font-black text-textPrimary mb-3 uppercase tracking-wider font-display"
          >
            Script Title
          </label>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                id="script-title"
                type="text"
                value={scriptTitle}
                onChange={(e) => setScriptTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                placeholder="Untitled Script"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border-3 border-textPrimary bg-white text-textPrimary font-bold focus:outline-none "
                autoFocus
                aria-label="Edit script title"
              />
              <button
                onClick={() => setIsEditingTitle(false)}
                className="shrink-0 p-2.5 rounded-xl bg-primary text-white border-3 border-textPrimary hover:bg-primary-hover transition-colors font-black"
                aria-label="Confirm title"
              >
                <MdCheck className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="w-full group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors border-3 border-black cursor-pointer"
              aria-label="Edit script title"
            >
              <span className="font-black text-primary">
                {scriptTitle || 'Untitled Script'}
              </span>
              <MdEdit className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors" />
            </div>
          )}
        </section>
        {/* 화자 선택 */}
        <section
          className="bg-white rounded-2xl border-3 border-textPrimary p-4"
          aria-labelledby="speakers-section"
        >
          <h2
            id="speakers-section"
            className="text-sm font-black text-textPrimary mb-4 uppercase tracking-wider"
          >
            Select Speaker
          </h2>
          <div
            className="space-y-3"
            role="radiogroup"
            aria-label="Choose active speaker"
          >
            {SPEAKERS.map((speaker) => (
              <button
                key={speaker.id}
                onClick={() => setActiveSpeakerId(speaker.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-3 border-textPrimary transition-all duration-200 ${
                  activeSpeakerId === speaker.id
                    ? 'bg-textDisabled text-white scale-[1.02]'
                    : 'bg-white hover:scale-[1.02]'
                }`}
                role="radio"
                aria-checked={activeSpeakerId === speaker.id ? 'true' : 'false'}
                aria-label={`Select ${speaker.name}`}
              >
                <div
                  className="w-5 h-5 rounded-full border-3 border-textPrimary shrink-0"
                  style={{ backgroundColor: speaker.hex }}
                  aria-hidden="true"
                />
                <div className="flex-1 text-left">
                  <div
                    className={`font-black text-sm uppercase ${
                      activeSpeakerId === speaker.id
                        ? 'text-white'
                        : 'text-textPrimary'
                    }`}
                  >
                    {speaker.id}
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      activeSpeakerId === speaker.id
                        ? 'text-white/90'
                        : 'text-textSecondary'
                    }`}
                  >
                    {speaker.name}
                  </div>
                </div>
                {activeSpeakerId === speaker.id && (
                  <MdPerson className="w-6 h-6 text-white" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </section>
        {/* 데스크탑: 버튼/통계 고정 */}
        <div className="space-y-4 hidden lg:block">
          <button
            onClick={handleSaveScript}
            disabled={scriptLines.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-primary text-white border-3 border-black hover:scale-[1.02] transition-all font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-black"
            aria-label="Save script"
          >
            <MdSave className="w-6 h-6" aria-hidden="true" />
            Save Script
          </button>
          <button
            onClick={handleStartPractice}
            disabled={scriptLines.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white text-black border-3 border-black hover:scale-[1.02] transition-all font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-black"
            aria-label="Start practice session"
          >
            <MdPlayArrow className="w-6 h-6" aria-hidden="true" />
            Start Practice
          </button>
          <div className="bg-textDisabled rounded-2xl border-3 border-textPrimary p-4 flex justify-between items-center">
            <span className="text-sm font-black text-white uppercase">
              Total Lines
            </span>
            <span className="text-3xl font-black text-white">
              {scriptLines.length}
            </span>
          </div>
        </div>
      </aside>
      {/* 메인 에디터 */}
      <main className="flex-1 flex flex-col min-h-0 md:mt-20">
        {/* 대화 리스트 (세로 사이즈 넉넉, 커스텀 스크롤) */}
        <div
          className="
    flex-1
    min-h-[480px]
    max-h-[90vh]
    overflow-y-auto
    bg-white
    border-3
    border-textPrimary
    rounded-2xl
    p-4
    mb-4
    box-border
    scrollbar-hide
  "
        >
          {scriptLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary border-3 border-textPrimary mb-4">
                <MdEdit className="w-10 h-10 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-3 uppercase">
                Start Creating
              </h3>
              <p className="text-base font-bold text-textSecondary max-w-md">
                Select a speaker and type dialogue below. Press Enter or click
                Add to create lines.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scriptLines.map((line, index) => (
                <article
                  key={line.id}
                  className="group flex items-start gap-4 p-4 rounded-2xl border-3 border-black bg-white hover:scale-[1.01] transition-all"
                  role="article"
                  aria-label={`Line ${index + 1} from ${line.speakerId}`}
                >
                  <div
                    className="w-4 h-4 rounded-full border-3 border-textPrimary mt-1 shrink-0"
                    style={{ backgroundColor: line.speakerColor }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-textPrimary mb-2 uppercase">
                      {line.speakerId}
                    </div>
                    <p className="text-base font-bold text-textPrimary leading-relaxed whitespace-pre-wrap">
                      {line.originalLine}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteLine(line.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg border-3 border-black text-black hover:bg-primary-hover hover:text-white transition-all"
                    aria-label={`Delete line ${index + 1}`}
                  >
                    <MdDelete className="w-5 h-5" aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
        {/* 입력 영역 */}
        <div
          className="bg-white rounded-2xl border-3 border-textPrimary p-4"
          role="form"
          aria-label="Add new dialogue line"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl border-3 border-textPrimary shrink-0"
              style={{ backgroundColor: activeSpeaker?.hex }}
              aria-label={`Currently speaking as ${activeSpeaker?.id}`}
            >
              <span className="font-black text-black text-sm uppercase">
                {activeSpeaker?.id}
              </span>
            </div>
            <label htmlFor="line-input" className="sr-only">
              Enter dialogue line
            </label>
            <input
              id="line-input"
              type="text"
              value={currentLineInput}
              onChange={(e) => setCurrentLineInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
              placeholder="Type dialogue and press Enter..."
              className="flex-1 p-3 rounded-xl border-3 border-textPrimary bg-white text-primary font-bold focus:outline-none   placeholder:text-secondary/50 caret-textPrimary"
              aria-describedby="input-help"
            />
            <span id="input-help" className="sr-only">
              Press Enter or click Add button to add line
            </span>
            <button
              onClick={handleAddLine}
              disabled={!currentLineInput.trim()}
              className="p-3 rounded-xl bg-primary text-white border-3 border-textPrimary hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-textPrimary shrink-0"
              aria-label="Add dialogue line"
            >
              <MdAdd className="w-7 h-7" aria-hidden="true" />
            </button>
          </div>
        </div>
        {/* 모바일: 입력창 아래에 버튼/통계 */}
        <div className="space-y-4 block lg:hidden mt-4">
          <button
            onClick={handleSaveScript}
            disabled={scriptLines.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-primary text-white border-3 border-textPrimary hover:scale-[1.02] transition-all font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-textPrimary"
            aria-label="Save script (mobile)"
          >
            <MdSave className="w-6 h-6" aria-hidden="true" />
            Save Script
          </button>
          <button
            onClick={handleStartPractice}
            disabled={scriptLines.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white text-textPrimary border-3 border-textPrimary hover:scale-[1.02] transition-all font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-3 focus:ring-textPrimary"
            aria-label="Start practice session (mobile)"
          >
            <MdPlayArrow className="w-6 h-6" aria-hidden="true" />
            Start Practice
          </button>
          <div className="bg-speaker2 rounded-2xl border-3 border-black p-4 flex justify-between items-center">
            <span className="text-sm font-black text-textPrimary uppercase">
              Total Lines
            </span>
            <span className="text-xl font-black text-textPrimary">
              {scriptLines.length}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
