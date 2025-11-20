import toast, { Toaster } from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
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

// 화자
const SPEAKERS = [
  { id: 'Speaker 1', hex: '#e4e9f7', name: 'Person A' },
  { id: 'Speaker 2', hex: '#d1efed', name: 'Person B' },
  { id: 'Speaker 3', hex: '#ffe5c7', name: 'Person C' },
];

export function CreatorPage() {
  const navigate = useNavigate();
  const saveNewScript = useAppStore((state) => state.saveNewScript);

  const [activeSpeakerId, setActiveSpeakerId] = useState<string>(
    SPEAKERS[0].id
  );
  const [currentLineInput, setCurrentLineInput] = useState('');
  const [scriptLines, setScriptLines] = useState<DialogueLine[]>([]);
  const [scriptTitle, setScriptTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      toast.error('At least one line of dialogue is required to save.');
      return;
    }
    if (!scriptTitle.trim()) {
      toast.error('Please enter a script title.');
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
    setScriptTitle('');

    // 저장 알림
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-border-strong ring-opacity-5 p-3`}
      >
        <div className="flex-1 w-0">
          <div className="flex flex-col">
            <p className="text-base font-black text-accent font-display uppercase">
              Script Saved
            </p>
            <p className="mt-1 text-sm text-text-secondary truncate">
              "{newScript.title}"
            </p>
            <div className="flex mt-4 gap-2">
              <button
                onClick={() => {
                  navigate('/talk/practice', {
                    state: { lines: newScript.lines },
                  });
                  toast.dismiss(t.id);
                }}
                className="w-full px-3 py-2 text-sm font-bold text-primary uppercase bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                Practice Now
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full px-3 py-2 text-sm font-bold text-text-secondary uppercase bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                New Script
              </button>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const handleStartPractice = () => {
    if (scriptLines.length === 0) {
      toast.error('At least one line is required to start practice.');
      return;
    }
    navigate('/talk/practice', { state: { lines: scriptLines } });
  };

  const activeSpeaker = SPEAKERS.find((s) => s.id === activeSpeakerId);

  // 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [scriptLines]);

  return (
    <div
      className="flex flex-col lg:flex-row h-screen gap-4"
      role="main"
      aria-label="Script creator"
    >
      <Toaster position="top-center" />
      {/* 사이드바 */}
      <aside
        className="lg:w-80 shrink-0 space-y-4 flex flex-col "
        aria-label="Script settings and controls"
      >
        <header className="text-center lg:text-left">
          <h1 className="text-4xl font-black text-accent mb-1 uppercase font-display">
            Script Creator
          </h1>
          <p className="text-sm font-bold text-text-secondary">
            Build your practice dialogue
          </p>
        </header>
        <section
          className="bg-white rounded-2xl border-2 border-border-default p-3"
          aria-labelledby="title-section"
        >
          <label
            id="title-section"
            htmlFor="script-title"
            className="block text-sm font-black text-text-primary mb-3 uppercase tracking-wider font-display"
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
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border-2 border-border-default bg-white text-primary font-bold focus:outline-none "
                autoFocus
                aria-label="Edit script title"
              />
              <button
                onClick={() => setIsEditingTitle(false)}
                className="shrink-0 p-2.5 rounded-xl bg-primary text-text-primary border-2 border-border-default hover:bg-primary-hover transition-colors duration-300 font-black"
                aria-label="Confirm title"
              >
                <MdCheck className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="w-full group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors duration-300 border-2 border-border-default cursor-pointer"
              aria-label="Edit script title"
            >
              <span className="font-black text-accent">
                {scriptTitle || 'Untitled Script'}
              </span>
              <MdEdit className="w-5 h-5 text-text-primary/50 group-hover:text-primary transition-colors" />
            </div>
          )}
        </section>
        <section
          className="bg-white rounded-2xl border-2 border-border-default p-3"
          aria-labelledby="speakers-section"
        >
          <h2
            id="speakers-section"
            className="text-sm font-black text-text-primary mb-4 uppercase tracking-wider font-display"
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
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-border-default transition-colors duration-300 ${
                  activeSpeakerId === speaker.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-white hover:bg-primary/5'
                }`}
                role="radio"
                aria-checked={activeSpeakerId === speaker.id ? 'true' : 'false'}
                aria-label={`Select ${speaker.name}`}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 border-border-default shrink-0"
                  style={
                    { backgroundColor: speaker.hex } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
                <div className="flex-1 text-left">
                  <div
                    className={`font-display font-black text-sm uppercase ${
                      activeSpeakerId === speaker.id
                        ? 'text-primary'
                        : 'text-text-primary'
                    }`}
                  >
                    {speaker.id}
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      activeSpeakerId === speaker.id
                        ? 'text-primary/90'
                        : 'text-text-secondary'
                    }`}
                  >
                    {speaker.name}
                  </div>
                </div>
                {activeSpeakerId === speaker.id && (
                  <MdPerson
                    className="w-6 h-6 text-primary"
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>
        </section>
        {/* 데스크탑 액션 */}
        <div className="space-y-4 hidden lg:block">
          <button
            onClick={handleSaveScript}
            disabled={scriptLines.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-primary text-white border-2 border-border-default transition-colors duration-300 font-display font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none"
            aria-label="Save script"
          >
            <MdSave className="w-6 h-6" aria-hidden="true" />
            Save Script
          </button>
          <button
            onClick={handleStartPractice}
            disabled={scriptLines.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white text-text-primary border-2 border-border-default transition-colors duration-300 font-display font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none"
            aria-label="Start practice session"
          >
            <MdPlayArrow className="w-6 h-6" aria-hidden="true" />
            Start Practice
          </button>
          <div className="bg-primary/5 rounded-2xl border-2 border-border-default p-3 flex justify-between items-center">
            <span className="text-sm font-display font-black text-text-secondary uppercase">
              Total Lines
            </span>
            <span className="text-2xl font-black text-accent">
              {scriptLines.length}
            </span>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0">
        {/* 대화 목록 */}
        <div
          className="lg:mt-20
    flex-1
    min-h-[480px]
    max-h-[90vh]
    overflow-y-auto
    bg-white
    border-2
    border-border-default
    rounded-2xl
    p-3
    mb-4
    box-border
  "
        >
          <div className="h-full overflow-y-auto pr-2">
            {scriptLines.length === 0 ? ( // 초기 상태
              <div className="flex flex-col items-center justify-center min-h-full text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary border-2 border-border-default mb-4">
                  <MdEdit className="w-10 h-10 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-display font-black text-accent mb-3 uppercase">
                  Start Creating
                </h3>
                <p className="text-base font-bold text-text-secondary max-w-md">
                  Select a speaker and type dialogue below. Press Enter or click
                  Add to create lines.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {scriptLines.map((line, index) => (
                  <article
                    key={line.id}
                    className="group flex items-center gap-4 p-3 rounded-2xl border-2 border-border-default bg-white transition-all duration-300"
                    role="article"
                    aria-label={`Line ${index + 1} from ${line.speakerId}`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-border-default shrink-0"
                      style={
                        {
                          backgroundColor: line.speakerColor,
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-black text-sm text-text-primary mb-2 uppercase">
                        {line.speakerId}
                      </div>
                      <p className="text-base font-bold text-text-primary leading-relaxed whitespace-pre-wrap">
                        {line.originalLine}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteLine(line.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg border-2 border-border-default text-text-primary hover:bg-error/10 hover:text-error transition-all duration-300"
                      aria-label={`Delete line ${index + 1}`}
                    >
                      <MdDelete className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </article>
                ))}
                {/* 스크롤 기준점 */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
        <div
          className="bg-white rounded-2xl border-2 border-border-default p-3"
          role="form"
          aria-label="Add new dialogue line"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div
              className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:py-3 rounded-xl border-2 border-border-default shrink-0"
              style={
                { backgroundColor: activeSpeaker?.hex } as React.CSSProperties
              }
              aria-label={`Currently speaking as ${activeSpeaker?.id}`}
            >
              <span className="font-display font-black text-text-primary text-sm uppercase ">
                {activeSpeaker?.id}
              </span>
            </div>
            <label htmlFor="line-input" className="sr-only">
              Enter dialogue line
            </label>
            <div className="flex-1 flex items-center gap-3">
              <input
                id="line-input"
                type="text"
                value={currentLineInput}
                onChange={(e) => setCurrentLineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
                placeholder="Type dialogue and press Enter..."
                className="flex-1 w-full p-3 rounded-xl border-2 border-border-default bg-white text-text-primary font-bold focus:outline-none placeholder:text-secondary/50 caret-textPrimary"
                aria-describedby="input-help"
              />
              <span id="input-help" className="sr-only">
                Press Enter or click Add button to add line
              </span>
              <button
                onClick={handleAddLine}
                disabled={!currentLineInput.trim()}
                className="p-3 rounded-xl bg-primary text-white border-2 border-border-default transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none shrink-0"
                aria-label="Add dialogue line"
              >
                <MdAdd className="w-7 h-7" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        {/* 모바일 액션 */}
        <div className="space-y-4 block lg:hidden mt-4">
          <button
            onClick={handleSaveScript}
            disabled={scriptLines.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-primary text-white border-2 border-border-default transition-colors duration-300 font-display font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none"
            aria-label="Save script (mobile)"
          >
            <MdSave className="w-6 h-6" aria-hidden="true" />
            Save Script
          </button>
          <button
            onClick={handleStartPractice}
            disabled={scriptLines.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white text-text-primary border-2 border-border-default transition-colors duration-300 font-display font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none"
            aria-label="Start practice session (mobile)"
          >
            <MdPlayArrow className="w-6 h-6" aria-hidden="true" />
            Start Practice
          </button>
          <div className="bg-primary/5 rounded-2xl border-2 border-border-default p-3 flex justify-between items-center">
            <span className="text-sm font-display font-black text-text-secondary uppercase">
              Total Lines
            </span>
            <span className="text-2xl font-black text-accent">
              {scriptLines.length}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
