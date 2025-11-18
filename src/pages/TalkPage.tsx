import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { DialogueLine, PracticeLog, WeakSpot } from '@/utils/types';
import type { DiffResult } from '@/utils/diffChecker';
import { checkWordDiff } from '@/utils/diffChecker';
import { useTTS } from '@/utils/useTTS';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';
import { useAppStore } from '@/store/appStore';

export function TalkPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const addNewPracticeLog = useAppStore((state) => state.addNewPracticeLog);

  // 스크립트 데이터 로드
  const initialScriptLines: DialogueLine[] = useMemo(() => {
    return location.state?.lines || [];
  }, [location.state]);

  // 화자 ID 목록 추출
  const speakerIds = useMemo(
    () => [...new Set(initialScriptLines.map((line) => line.speakerId))],
    [initialScriptLines]
  );

  // 핵심 상태
  const [script] = useState<DialogueLine[]>(initialScriptLines);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [feedback, setFeedback] = useState<DiffResult[] | null>(null);
  const [sessionStartTime] = useState(Date.now());

  const [userSpeakerId, setUserSpeakerId] = useState<string | null>(null);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [userLastInput, setUserLastInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [sessionErrors, setSessionErrors] = useState<WeakSpot[]>([]);

  // 음성 인식 및 TTS
  const { transcript, isListening, startListening } = useSpeechRecognition();
  const { speak, isSpeaking } = useTTS();

  const currentLine = script[currentLineIndex];
  const isFinished = currentLineIndex >= script.length;
  const isMyTurn = currentLine?.speakerId === userSpeakerId;

  // 사용자 입력 처리
  const processUserInput = (inputText: string) => {
    if (!currentLine || !isMyTurn || feedback) return;

    setUserLastInput(inputText);
    const diffResult = checkWordDiff(currentLine.originalLine, inputText);
    setFeedback(diffResult);
    setShowHint(false);

    // 약점 데이터 수집
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
  };

  // 음성 인식 결과 처리
  useEffect(() => {
    if (transcript && !isListening) {
      processUserInput(transcript);
    }
  }, [transcript, isListening]);

  // 컴퓨터 턴 TTS 자동 재생
  useEffect(() => {
    if (
      currentLine &&
      !isMyTurn &&
      !isSpeaking &&
      !isListening &&
      isPracticeStarted
    ) {
      speak(currentLine.originalLine, () => {
        setCurrentLineIndex((prev) => prev + 1);
      });
    }
  }, [currentLine, isMyTurn, isSpeaking, isListening, isPracticeStarted]);

  // 재시도 핸들러
  const handleRetry = () => {
    setFeedback(null);
    setUserLastInput('');
    setTypedInput('');
    setShowHint(false);
  };

  // 다음 라인 핸들러
  const handleNext = () => {
    setCurrentLineIndex((prev) => prev + 1);
    setFeedback(null);
    setUserLastInput('');
    setTypedInput('');
    setShowHint(false);
  };

  // 마이크 버튼 핸들러
  const handleMicClick = () => {
    if (currentLine && isMyTurn) {
      setFeedback(null);
      startListening();
    }
  };

  // 연습 종료 및 데이터 저장
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

  // 연습 시작 핸들러
  const handleStartPractice = (speakerId: string) => {
    if (script.length === 0) {
      alert('저장된 스크립트가 없습니다...');
      return;
    }
    setUserSpeakerId(speakerId);
    setIsPracticeStarted(true);
    setCurrentLineIndex(0);
  };

  // 역할 선택 화면
  if (!isPracticeStarted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-900 text-gray-200 h-full">
        <h1 className="text-3xl font-bold mb-4 text-white">Choose Your Role</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          어떤 역할로 연습하시겠습니까?
          <br />
          선택한 역할의 대사는 화면에 표시되지 않습니다.
        </p>
        <div className="flex gap-4">
          {speakerIds.map((id) => (
            <button
              key={id}
              onClick={() => handleStartPractice(id)}
              className="p-4 px-8 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-xl"
            >
              Practice as {id}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 연습 화면
  return (
    <div className="flex flex-col h-full">
      {/* 대화 표시 영역 */}
      <div
        className="flex-1 p-8 overflow-y-auto space-y-6 bg-gray-900 text-gray-200"
        style={{ minHeight: '60vh' }}
      >
        {/* 진행된 대화 */}
        {script
          .slice(0, isFinished ? script.length : currentLineIndex)
          .map((line, index) => (
            <div
              key={line.id || index}
              className={`flex ${
                line.speakerId === userSpeakerId
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`p-4 rounded-lg max-w-2xl shadow-lg text-white ${
                  line.speakerId === userSpeakerId ? 'ml-auto' : ''
                }`}
                style={{ backgroundColor: line.speakerColor }}
              >
                <span className="font-bold mr-2">{line.speakerId}:</span>
                <span>{line.originalLine}</span>
              </div>
            </div>
          ))}

        {/* 현재 턴 라인 */}
        {currentLine && !isFinished && (
          <div
            className={`flex flex-col ${
              isMyTurn ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`p-4 rounded-lg max-w-2xl shadow-lg border-2 text-white ${
                isMyTurn
                  ? isListening
                    ? 'border-red-500'
                    : 'border-transparent'
                  : isSpeaking
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: currentLine.speakerColor }}
            >
              {isMyTurn && feedback ? (
                <>
                  <span className="font-bold mr-2">
                    [{currentLine.speakerId}]:
                  </span>
                  <span className="italic">{userLastInput}</span>
                </>
              ) : isMyTurn && !feedback ? (
                showHint ? (
                  <div className="italic px-4 py-2">
                    <span className="font-bold mr-2">
                      [{currentLine.speakerId}]:
                    </span>
                    <span>{currentLine.originalLine}</span>
                  </div>
                ) : (
                  <div className="italic px-4 py-2">
                    <span className="font-bold mr-2">
                      [{currentLine.speakerId}]:
                    </span>
                    (Your Turn: Speak or Type now)
                  </div>
                )
              ) : (
                <>
                  <span className="font-bold mr-2">
                    {currentLine.speakerId}:
                  </span>
                  <span>{currentLine.originalLine}</span>
                  {isSpeaking && (
                    <span className="ml-3 text-sm text-blue-300 animate-pulse">
                      🔊 Playing...
                    </span>
                  )}
                </>
              )}
            </div>

            {/* 피드백 영역 */}
            {isMyTurn && feedback && (
              <div className="text-lg mt-2 p-2 max-w-2xl w-full text-right">
                {feedback.map((part, i) => (
                  <span
                    key={i}
                    className={
                      part.status === 'removed'
                        ? 'text-green-400 font-bold mr-1'
                        : part.status === 'added'
                        ? 'text-red-500 line-through mr-1'
                        : 'text-gray-400 opacity-90 mr-1'
                    }
                  >
                    {part.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 연습 종료 메시지 */}
        {isFinished && (
          <div className="text-center text-green-500 text-2xl font-bold mt-10">
            Script Finished!
            <p className="text-lg text-gray-400 font-normal">
              Press Finish & Save to record your session.
            </p>
          </div>
        )}
      </div>

      {/* 컨트롤 영역 */}
      <footer className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800 space-x-4 flex-shrink-0">
        {/* 종료 버튼 */}
        <button
          onClick={() => {
            if (isFinished) handleEndPractice();
            navigate('/');
          }}
          disabled={!isPracticeStarted}
          className="p-2 px-4 rounded-lg border border-red-500 text-red-500 hover:bg-red-900 transition duration-200 disabled:opacity-30"
        >
          {isFinished ? 'Finish & Save' : 'Give Up & Exit'}
        </button>

        {/* 키보드 입력 토글 */}
        <button
          onClick={() => setIsTyping(!isTyping)}
          className={`p-3 rounded-lg border ${
            isTyping ? 'bg-blue-600 border-blue-400' : 'border-gray-600'
          } text-white text-2xl`}
        >
          ⌨️
        </button>

        {/* 중앙 컨트롤 영역 */}
        {isTyping ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') processUserInput(typedInput);
              }}
              placeholder="Type your line and press Enter..."
              className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              disabled={!isMyTurn || !!feedback || isFinished}
            />
            <button
              onClick={() => processUserInput(typedInput)}
              className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={!isMyTurn || !!feedback || isFinished}
            >
              Send
            </button>
          </div>
        ) : isMyTurn && feedback ? (
          <div className="flex-1 flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="p-4 rounded-lg bg-yellow-600 text-white font-bold hover:bg-yellow-700"
            >
              Retry 🔄
            </button>
            <button
              onClick={handleNext}
              className="p-4 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700"
            >
              Next →
            </button>
          </div>
        ) : isMyTurn && !feedback ? (
          <div className="flex-1 flex gap-4 justify-center items-center">
            <button
              onClick={() => setShowHint(!showHint)}
              className={`p-3 rounded-lg text-white text-2xl ${
                showHint ? 'bg-yellow-600' : 'bg-gray-600'
              }`}
            >
              💡
            </button>
            <button
              onClick={handleMicClick}
              disabled={isListening || isSpeaking || isFinished}
              className="flex flex-col items-center justify-center disabled:opacity-50"
            >
              <div
                className={`w-16 h-16 rounded-full text-white flex items-center justify-center text-3xl transition-colors shadow-2xl ${
                  isListening
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                🎤
              </div>
              <span className="mt-1 text-sm text-gray-300">
                {isListening ? 'Listening...' : 'Click to Speak'}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="mt-1 text-sm text-gray-300">
              {isFinished
                ? 'Practice Finished'
                : isSpeaking
                ? 'Computer Speaking...'
                : 'Waiting for Computer...'}
            </span>
          </div>
        )}

        {/* 진도 표시 */}
        <div className="text-sm text-gray-400 font-mono">
          {currentLineIndex < script.length
            ? `${currentLineIndex} / ${script.length} Lines`
            : 'FINISHED'}
        </div>
      </footer>
    </div>
  );
}
