import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { DialogueLine, PracticeLog, WeakSpot } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';
import { checkWordDiff } from '@/utils/diffChecker';
import { useTTS } from '@/utils/useTTS';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';
import { useAppStore } from '@/store/appStore';
import { FiMic, FiSend } from 'react-icons/fi';
import {
  MdKeyboard,
  MdLightbulb,
  MdCheckCircle,
  MdVolumeUp,
  MdReplay,
} from 'react-icons/md';

export function TalkPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const addNewPracticeLog = useAppStore((state) => state.addNewPracticeLog);

  const initialScriptLines: DialogueLine[] = useMemo(() => {
    return location.state?.lines || [];
  }, [location.state]);
  const speakerIds = useMemo(
    () => [...new Set(initialScriptLines.map((line) => line.speakerId))],
    [initialScriptLines]
  );

  const [script] = useState<DialogueLine[]>(initialScriptLines);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, DiffResult[]>>(
    {}
  );
  const [userInputMap, setUserInputMap] = useState<Record<number, string>>({});
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [userSpeakerId, setUserSpeakerId] = useState<string | null>(null);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [userLastInput, setUserLastInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [sessionErrors, setSessionErrors] = useState<WeakSpot[]>([]);
  const { transcript, isListening, startListening } = useSpeechRecognition();
  const { speak, isSpeaking } = useTTS();

  const currentLine = script[currentLineIndex];
  const isFinished = currentLineIndex >= script.length;
  const isMyTurn = currentLine?.speakerId === userSpeakerId;
  const progress = (currentLineIndex / script.length) * 100;

  // 말풍선 색상
  const speakerColorMap = {
    'Speaker 1': 'var(--color-speaker1)',
    'Speaker 2': 'var(--color-speaker2)',
    'Speaker 3': 'var(--color-speaker3)',
  };

  // 비교 색상
  const DIFF_COLOR_MAP = {
    correct: 'text-green-600 font-bold',
    removed: 'text-red-500 font-bold',
    added: 'text-textSecondary/60 line-through',
    neutral: 'text-textPrimary',
  };

  useEffect(() => {
    // AI 자동 진행
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
    setUserLastInput(inputText);

    const diffResult = checkWordDiff(currentLine.originalLine, inputText);
    setFeedbackMap((prev) => ({ ...prev, [currentLineIndex]: diffResult }));
    setUserInputMap((prev) => ({ ...prev, [currentLineIndex]: inputText }));
    setShowHint(false);

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

    if (currentLineIndex < script.length - 1) {
      setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setUserLastInput('');
        setTypedInput('');
        setShowHint(false);
      }, 1200);
    }
  };

  const handleMicClick = () => {
    if (currentLine && isMyTurn) {
      setUserLastInput('');
      setTypedInput('');
      setShowHint(false);
      startListening();
    }
  };

  const handleEndPractice = () => {
    const newLogEntry: PracticeLog = {
      id: crypto.randomUUID(),
      date: Date.now(),
      scriptId: script[0]?.id || 'NEW_SESSION',
      accuracy: 0,
      timeSpent: Math.floor((Date.now() - sessionStartTime) / 1000),
      errors: sessionErrors,
    };
    addNewPracticeLog(newLogEntry);
  };

  const handleStartPractice = (speakerId: string) => {
    if (script.length === 0) {
      alert('저장된 스크립트가 없습니다...');
      return;
    }
    setUserSpeakerId(speakerId);
    setIsPracticeStarted(true);
    setCurrentLineIndex(0);
    setFeedbackMap({});
    setUserInputMap({});
    setSessionStartTime(Date.now());
    setSessionErrors([]);
  };

  const handleRetryPractice = () => {
    // 연습 다시 시작
    setIsPracticeStarted(true);
    setCurrentLineIndex(0);
    setFeedbackMap({});
    setUserInputMap({});
    setSessionStartTime(Date.now());
    setSessionErrors([]);
  };

  // 역할 선택
  if (!isPracticeStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          <header className="text-center mb-8">
            <h1 className="font-display text-4xl font-black text-primary mb-4 uppercase tracking-tight">
              Choose Your Role
            </h1>
            <p className="font-sans text-base text-textSecondary">
              Select which character you'll play in the conversation
            </p>
          </header>
          <div className="space-y-6">
            {speakerIds.map((id) => (
              <button
                key={id}
                onClick={() => handleStartPractice(id)}
                className="group relative w-full p-6 bg-white rounded-xl border-2 border-textPrimary font-display text-base font-bold uppercase text-textPrimary hover:bg-primary hover:text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Start practicing as ${id}`}
              >
                <span className="relative z-10">Practice as {id}</span>
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 rounded-xl transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 진행 바 */}
      <nav className="sticky top-0 z-20 bg-white border-b-2 border-textPrimary p-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-base font-bold text-primary min-w-[3.5rem]">
              {currentLineIndex + 1} / {script.length}
            </span>
            <div className="w-44 h-3 bg-primary/20 rounded-full overflow-hidden border border-primary/30">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              if (isFinished) handleEndPractice();
              navigate('/');
            }}
            className="px-4 py-2 bg-primary text-white rounded-xl border-2 border-textPrimary font-display font-bold uppercase hover:bg-primary-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {isFinished ? 'Save & Exit' : 'Exit'}
          </button>
        </div>
      </nav>

      {/* 대화 */}
      <main className="flex-1 w-full min-h-0 flex flex-col justify-end px-0 py-4">
        <div className="w-full flex flex-col gap-0.5 pb-10">
          {script
            .slice(0, currentLineIndex + (isFinished ? 0 : 1))
            .map((line, idx) => {
              const isUser = line.speakerId === userSpeakerId;
              const alignClass = isUser ? 'justify-end' : 'justify-start';
              const bubbleStyle = {
                backgroundColor: speakerColorMap[line.speakerId] || '#f3f4f6',
                marginRight: isUser ? 0 : undefined,
                marginLeft: !isUser ? 0 : undefined,
              };
              return (
                <div
                  key={line.id || idx}
                  className={`flex ${alignClass} w-full mb-1`}
                >
                  <div
                    className={`max-w-[70%] w-auto p-2 rounded-xl border border-textPrimary text-sm`}
                    style={bubbleStyle}
                  >
                    <span
                      className={`font-bold uppercase text-xs ${
                        isUser ? 'text-primary' : 'text-textPrimary'
                      }`}
                    >
                      {line.speakerId}
                    </span>
                    <div className="mt-1 whitespace-pre-line">
                      {isUser ? (
                        <>
                          {/* 사용자 입력 */}
                          {typeof userInputMap[idx] !== 'undefined' ||
                          feedbackMap[idx] ? (
                            <>
                              <span className="italic">
                                {userInputMap[idx]}
                              </span>
                              {feedbackMap[idx] && (
                                <div className="mt-2 border-t pt-2 border-borderPrimary text-xs flex flex-wrap gap-y-1">
                                  {feedbackMap[idx].map((part, i) => (
                                    <span
                                      key={i}
                                      className={
                                        part.status === 'removed'
                                          ? DIFF_COLOR_MAP.removed + ' mr-1'
                                          : part.status === 'added'
                                          ? DIFF_COLOR_MAP.added + ' mr-1'
                                          : part.status === 'correct'
                                          ? DIFF_COLOR_MAP.correct + ' mr-1'
                                          : DIFF_COLOR_MAP.neutral + ' mr-1'
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
                              line.originalLine
                            ) : (
                              <span className="italic opacity-70">
                                Your turn to speak...
                              </span>
                            ))
                          )}
                        </>
                      ) : (
                        line.originalLine
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          {/* 완료 */}
          {isFinished && (
            <div className="flex flex-col items-center mt-6">
              <div className="text-center p-6 bg-success rounded-xl border-2 border-textPrimary max-w-md mx-auto mb-4">
                <div className="w-12 h-12 bg-white rounded-full border-2 border-textPrimary flex items-center justify-center mx-auto mb-3">
                  <MdCheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-xl font-black text-primary mb-2 uppercase">
                  Script Complete!
                </h2>
                <p className="font-sans text-textPrimary text-base">
                  Great work! Click "Save & Exit" to record your progress.
                </p>
              </div>
              <button
                onClick={handleRetryPractice}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-display font-bold uppercase border border-textPrimary hover:bg-primary-hover transition-all duration-200"
              >
                <MdReplay className="w-5 h-5" />
                연습 다시하기
              </button>
            </div>
          )}
        </div>
      </main>
      {/* 하단 컨트롤러 */}
      <footer className="sticky bottom-0 bg-white border-t-2 border-textPrimary py-2">
        <div className="w-full flex justify-center items-center gap-3 px-2 py-4">
          <button
            onClick={() => setIsTyping(true)}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-primary bg-white hover:bg-primary/10 transition-all"
            aria-label="Use keyboard input"
          >
            <MdKeyboard className="w-6 h-6 text-primary mb-0.5" />
            <span className="text-xs text-primary font-bold">키보드</span>
          </button>
          <button
            onClick={handleMicClick}
            disabled={isListening || isSpeaking || isFinished}
            className={`
        flex flex-col items-center justify-center 
        w-20 h-20 rounded-full border-2 
        ${
          isListening
            ? 'bg-primary text-white border-primary'
            : 'bg-white border-primary'
        }
        shadow-none transition-all
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
            aria-label={isListening ? 'Listening...' : 'Tap to speak'}
          >
            <FiMic
              className={`w-7 h-7 mx-auto mb-1 ${
                isListening ? 'animate-pulse' : 'text-primary'
              }`}
            />
            <span
              className={`text-sm font-bold ${
                isListening ? 'text-white' : 'text-primary'
              }`}
            >
              TAP TO SPEAK
            </span>
          </button>
          <button
            onClick={() => setShowHint(!showHint)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-primary bg-white hover:bg-primary/10 transition-all
        ${showHint ? 'bg-primary text-white' : 'text-primary'}
      `}
            aria-label={showHint ? 'Hide hint' : 'Show hint'}
          >
            <MdLightbulb className={`w-6 h-6 mb-0.5`} />
            <span
              className={`text-xs font-bold ${
                showHint ? 'text-white' : 'text-primary'
              }`}
            >
              힌트
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
