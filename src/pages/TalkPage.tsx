import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import type { DialogueLine, PracticeLog, WeakSpot } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';
import { checkWordDiff } from '@/utils/diffChecker';
import { useTTS } from '@/utils/useTTS';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';
import { useAppStore } from '@/store/appStore';
import { FiMic } from 'react-icons/fi';
import { MdKeyboard, MdLightbulb, MdSend, MdPerson } from 'react-icons/md';

export function TalkPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const addNewPracticeLog = useAppStore((state) => state.addNewPracticeLog);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const initialScriptLines: DialogueLine[] = useMemo(() => {
    return location.state?.lines || [];
  }, [location.state]);

  const speakerIds = useMemo(
    () => [...new Set(initialScriptLines.map((line) => line.speakerId))],
    [initialScriptLines]
  );

  const speakerColors = useMemo(() => {
    const colors: Record<string, string> = {};
    speakerIds.forEach((id, index) => {
      colors[id] = `var(--color-speaker${index + 1})`;
    });
    return colors;
  }, [speakerIds]);

  const [script] = useState<DialogueLine[]>(initialScriptLines);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, DiffResult[]>>(
    {}
  );
  const [userInputMap, setUserInputMap] = useState<Record<number, string>>({});
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [userSpeakerId, setUserSpeakerId] = useState<string | null>(null);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [inputMode, setInputMode] = useState<'mic' | 'keyboard'>('mic');
  const [typedInput, setTypedInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [sessionErrors, setSessionErrors] = useState<WeakSpot[]>([]);
  const [showSpeakerSelector, setShowSpeakerSelector] = useState(false);

  const { transcript, isListening, startListening } = useSpeechRecognition();
  const { speak, isSpeaking } = useTTS();

  const currentLine = script[currentLineIndex];
  const isFinished = currentLineIndex >= script.length;
  const isMyTurn = currentLine?.speakerId === userSpeakerId;
  const progress = (currentLineIndex / script.length) * 100;

  const DIFF_COLOR_MAP = {
    correct: 'text-success font-bold',
    removed: 'text-error font-bold',
    added: 'text-text-secondary/60 line-through',
    neutral: 'text-text-primary',
  };

  // 스크롤
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [currentLineIndex, feedbackMap]);

  // 자동 재생
  useEffect(() => {
    if (
      currentLine &&
      !isMyTurn &&
      !isSpeaking &&
      !isListening &&
      isPracticeStarted &&
      !isFinished
    ) {
      speak(currentLine.originalLine, () => {
        setCurrentLineIndex((prev) => prev + 1);
      });
    }
  }, [
    currentLine,
    isMyTurn,
    isSpeaking,
    isListening,
    isPracticeStarted,
    isFinished,
    speak,
  ]);

  useEffect(() => {
    if (transcript && !isListening) {
      processUserInput(transcript);
    }
  }, [transcript, isListening]);

  const processUserInput = (inputText: string) => {
    if (!currentLine || !isMyTurn || feedbackMap[currentLineIndex]) return;

    const diffResult = checkWordDiff(currentLine.originalLine, inputText);
    setFeedbackMap((prev) => ({ ...prev, [currentLineIndex]: diffResult }));
    setUserInputMap((prev) => ({ ...prev, [currentLineIndex]: inputText }));
    setShowHint(false);
    setTypedInput('');

    const newErrors: WeakSpot[] = diffResult
      .filter((part) => part.status === 'removed' || part.status === 'added')
      .map((part) => ({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        original: part.status === 'removed' ? part.value : '',
        spoken: part.status === 'added' ? part.value : '',
        scriptId: script[0]?.id || 'NEW_SESSION',
      }));
    setSessionErrors((prev) => [...prev, ...newErrors]);

    // 다음 대사
    setTimeout(() => {
      setCurrentLineIndex((prev) => prev + 1);
    }, 1500);
  };

  const handleMicClick = () => {
    if (currentLine && isMyTurn && !feedbackMap[currentLineIndex]) {
      setShowHint(false);
      setTypedInput('');
      startListening();
    }
  };

  const handleKeyboardSubmit = () => {
    if (typedInput.trim() && currentLine && isMyTurn) {
      processUserInput(typedInput.trim());
    }
  };

  const handleEndPractice = () => {
    const newLogEntry: PracticeLog = {
      id: crypto.randomUUID(),
      date: Date.now(),
      scriptId: location.state?.scriptId || 'NEW_SESSION',
      accuracy: 0,
      timeSpent: Math.floor((Date.now() - sessionStartTime) / 1000),
      errors: sessionErrors,
    };
    addNewPracticeLog(newLogEntry);
    toast.success('Practice saved!', { duration: 2000, icon: '✅' });
    setTimeout(() => navigate('/'), 2000);
  };

  const handleStartPractice = (speakerId: string) => {
    if (script.length === 0) {
      toast.error('No script available');
      return;
    }
    setUserSpeakerId(speakerId);
    setIsPracticeStarted(true);
    setCurrentLineIndex(0);
    setFeedbackMap({});
    setUserInputMap({});
    setSessionStartTime(Date.now());
    setSessionErrors([]);
    setShowSpeakerSelector(false);
  };

  const handleRetryPractice = () => {
    setCurrentLineIndex(0);
    setFeedbackMap({});
    setUserInputMap({});
    setSessionStartTime(Date.now());
    setSessionErrors([]);
    toast('Restarting...', { icon: '🔄', duration: 1500 });
  };

  const handleCompletePractice = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-2">
          <p className="font-display font-bold text-text-primary text-center">
            Practice Complete! 🎉
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleRetryPractice();
              }}
              className="flex-1 px-4 py-2 border border-accent bg-accent/20 text-accent rounded-lg font-display font-bold text-sm hover:bg-accent/30 whitespace-nowrap"
            >
              Retry
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleEndPractice();
              }}
              className="flex-1 px-4 py-2 border border-primary bg-primary/20 text-primary rounded-lg font-display font-bold text-sm hover:bg-primary/30 whitespace-nowrap"
            >
              Save &amp; Exit
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-center',
      }
    );
  };

  useEffect(() => {
    if (isFinished && isPracticeStarted) {
      handleCompletePractice();
    }
  }, [isFinished, isPracticeStarted]);

  // 역할 선택
  if (!isPracticeStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-bg-main">
        <Toaster position="top-center" />
        <div className="w-full max-w-3xl p-4">
          <header className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-black text-accent mb-2 uppercase">
              Choose Your Role
            </h1>
            <p className="font-sans font-bold text-sm text-text-secondary">
              Select your character
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {speakerIds.map((id) => {
              const lineCount = script.filter(
                (line) => line.speakerId === id
              ).length;
              return (
                <button
                  key={id}
                  onClick={() => {
                    handleStartPractice(id);
                  }}
                  className="bg-white rounded-xl border-2 border-border-default p-5 hover:border-primary transition-all min-h-[120px] flex flex-col items-center justify-center gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: speakerColors[id] }}
                  >
                    <MdPerson className="w-6 h-6 text-text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-black text-text-primary uppercase">
                      {id}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {lineCount} lines
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-main ">
      <Toaster position="top-center" />

      {/* 상단 바 */}
      <div className="bg-border-subtle/30 border-b px-4 border-border-default py-2 flex-shrink-0">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-y-2">
          {/* 왼쪽: Speaker 라디오 버튼 그룹 */}
          <div className="flex items-center gap-3">
            {speakerIds.map((id) => (
              <button
                key={id}
                onClick={() => {
                  setUserSpeakerId(id);
                  toast.success(`Switched to ${id}`, { duration: 1000 });
                }}
                className="flex items-center gap-1 focus:outline-none"
                role="radio"
                aria-checked={userSpeakerId === id}
                aria-label={`Select ${id}`}
                tabIndex={0}
              >
                <span
                  className={`rounded-full border transition-all duration-150 ${
                    userSpeakerId === id
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border-default'
                  }`}
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: speakerColors[id],
                    display: 'inline-block',
                    boxShadow:
                      userSpeakerId === id
                        ? '0 0 0 1.5px var(--color-primary)'
                        : undefined,
                  }}
                />
                <span
                  className={`font-display font-medium text-xs uppercase transition-colors ${
                    userSpeakerId === id
                      ? 'text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {id}
                </span>
              </button>
            ))}
          </div>
          {/* 오른쪽: 진행 정보 */}
          <div className="flex items-center gap-2 text-xs text-text-secondary font-sans">
            <span className="font-bold shrink-0">Role: {userSpeakerId}</span>
            <span className="">•</span>
            <span className="shrink-0">
              {currentLineIndex + 1} / {script.length} lines
            </span>
          </div>
        </div>
      </div>

      {/* 대화 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto  py-4 px-2"
        style={{ maxHeight: 'calc(100vh - 200px)' } as React.CSSProperties}
      >
        <div className="mx-auto space-y-3">
          {script
            .slice(0, currentLineIndex + (isFinished ? 0 : 1))
            .map((line, idx) => {
              const isUser = line.speakerId === userSpeakerId;
              return (
                <div
                  key={line.id || idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[80%] md:max-w-[70%] p-3 rounded-xl border border-border-default"
                    style={{ backgroundColor: speakerColors[line.speakerId] }}
                  >
                    <p className="font-display font-bold text-xs uppercase text-text-primary mb-1">
                      {line.speakerId}
                    </p>
                    <div className="font-sans text-sm text-text-primary">
                      {isUser ? (
                        <>
                          {typeof userInputMap[idx] !== 'undefined' ||
                          feedbackMap[idx] ? (
                            <>
                              <p className="mb-2">{userInputMap[idx]}</p>
                              {feedbackMap[idx] && (
                                <div className="mt-2 pt-2 border-t border-border-subtle text-xs flex flex-wrap gap-1">
                                  {feedbackMap[idx].map((part, i) => (
                                    <span
                                      key={i}
                                      className={
                                        part.status === 'removed'
                                          ? DIFF_COLOR_MAP.removed
                                          : part.status === 'added'
                                          ? DIFF_COLOR_MAP.added
                                          : part.status === 'correct'
                                          ? DIFF_COLOR_MAP.correct
                                          : DIFF_COLOR_MAP.neutral
                                      }
                                    >
                                      {part.value}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            idx === currentLineIndex &&
                            (showHint ? (
                              <p className="italic text-text-secondary">
                                {line.originalLine}
                              </p>
                            ) : (
                              <p className="italic text-text-muted">
                                Your turn...
                              </p>
                            ))
                          )}
                        </>
                      ) : (
                        <p>{line.originalLine}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 하단 */}
      <div className="bg-bg-main border-t-2 border-border-default px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {inputMode === 'keyboard' && (
            <div className="mb-4 flex gap-3">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleKeyboardSubmit()}
                placeholder={
                  isMyTurn && !feedbackMap[currentLineIndex]
                    ? 'Type your line here...'
                    : 'Please wait...'
                }
                className="flex-1 px-4 py-3 border-2 border-border-default rounded-xl focus:outline-none focus:ring-1 focus:ring-border-strong focus:border-ring-border-strong text-sm bg-white"
                autoFocus
                disabled={!isMyTurn || !!feedbackMap[currentLineIndex]}
              />
              <button
                onClick={handleKeyboardSubmit}
                disabled={
                  !typedInput.trim() ||
                  !isMyTurn ||
                  !!feedbackMap[currentLineIndex]
                }
                className="px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:bg-border-subtle "
                aria-label="Send"
              >
                <MdSend className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 컨트롤 버튼 */}
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={() => {
                setInputMode(inputMode === 'keyboard' ? 'mic' : 'keyboard');
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                inputMode === 'keyboard'
                  ? 'bg-primary text-white '
                  : 'bg-bg-main text-text-secondary border-2 border-border-default hover:border-primary hover:bg-white'
              }`}
              aria-label={
                inputMode === 'keyboard'
                  ? 'Switch to microphone'
                  : 'Switch to keyboard'
              }
            >
              <MdKeyboard className="w-5 h-5" />
            </button>

            <button
              onClick={handleMicClick}
              disabled={
                inputMode === 'keyboard' ||
                isListening ||
                isSpeaking ||
                isFinished ||
                !isMyTurn ||
                !!feedbackMap[currentLineIndex]
              }
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-error text-white animate-pulse scale-105'
                  : 'bg-white text-text-primary border-2 border-primary hover:bg-primary hover:text-white '
              } disabled:opacity-30 disabled:cursor-not-allowed disabled:border-border-subtle disabled:text-text-muted disabled:shadow-none`}
              aria-label={isListening ? 'Listening...' : 'Tap to speak'}
            >
              <FiMic className="w-7 h-7" />
            </button>

            <button
              onClick={() => setShowHint(!showHint)}
              disabled={!isMyTurn || !!feedbackMap[currentLineIndex]}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                showHint
                  ? 'bg-accent text-white '
                  : 'bg-bg-main text-text-secondary border-2 border-border-default hover:border-accent hover:bg-white'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
              aria-label={showHint ? 'Hide hint' : 'Show hint'}
            >
              <MdLightbulb className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
