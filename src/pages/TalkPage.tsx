import { useState, useEffect } from 'react';
import type { DialogueLine } from '@/utils/types';
import type { DiffResult } from './diffChecker';
import { useTTS } from '@/utils/useTTS';
import { checkWordDiff } from './diffChecker';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';

// --- 목데이터 ---
const MOCK_SCRIPT: DialogueLine[] = [
  {
    id: '1',
    speakerId: 'Speaker 1',
    speakerColor: '#C8F0EB',
    originalLine: 'Hello, how are you?',
    isUserTurn: false,
  },
  {
    id: '2',
    speakerId: 'Speaker 2',
    speakerColor: '#FFF4CC',
    originalLine: "I'm doing well, thank you.",
    isUserTurn: true,
  },
  {
    id: '3',
    speakerId: 'Speaker 1',
    speakerColor: '#C8F0EB',
    originalLine: "I understand. It's important to take breaks.",
    isUserTurn: false,
  },
  {
    id: '4',
    speakerId: 'Speaker 2',
    speakerColor: '#FFF4CC',
    originalLine: 'Anyway, do you remember Kayla?',
    isUserTurn: true,
  },
];
// ---------------------------------

export function TalkPage() {
  const [script, setScript] = useState(MOCK_SCRIPT);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [feedback, setFeedback] = useState<DiffResult[] | null>(null);

  // 음성 인식 엔진 (STT) 훅
  const { transcript, isListening, startListening } = useSpeechRecognition();

  // 음성 재생 훅(TTS)
  const { speak, isSpeaking } = useTTS();
  // 현재 대사 가져오기
  const currentLine = script[currentLineIndex];

  useEffect(() => {
    // 음성 인식이 끝나면 채점 실행
    if (transcript && !isListening) {
      const currentLine = script[currentLineIndex];
      if (!currentLine || !currentLine.isUserTurn) return;

      const diffResult = checkWordDiff(currentLine.originalLine, transcript);
      setFeedback(diffResult);

      const timer = setTimeout(() => {
        setCurrentLineIndex(currentLineIndex + 1);
        setFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transcript, isListening, currentLineIndex, script]);

  useEffect(() => {
    if (currentLine && !currentLine.isUserTurn && !isSpeaking && !isListening) {
      speak(currentLine.originalLine, () => {
        // 말이 끝나면 다음 대사 즉! 사용자한테 자동으로 넘긴다.
        setCurrentLineIndex(currentLineIndex + 1);
      });
    }
  }, [
    currentLine,
    isSpeaking,
    speak,
    currentLineIndex,
    isListening,
    setCurrentLineIndex,
  ]); // 의존성 배열 업데이트

  const handleMicClick = () => {
    setFeedback(null);
    startListening();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* === Header === */}
      <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
        <img src="/titas_logo.png" alt="TiTaS Logo" className="h-8" />
        <button className="text-sm font-medium text-gray-600 hover:text-black">
          [ End Session ]
        </button>
      </header>

      {/* === Chat Display === */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {currentLine ? (
          <div
            className={`flex ${
              currentLine.isUserTurn ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* 말풍선 UI */}
            <div
              className={`p-4 rounded-lg max-w-2xl shadow-sm ${
                currentLine.isUserTurn
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <span className="font-bold mr-2">{currentLine.speakerId}:</span>
              <span>{currentLine.originalLine}</span>

              {/* 피드백 표시 영역 */}
              {currentLine.isUserTurn && feedback && (
                <div className="mt-2 p-2 rounded-md bg-white text-gray-700 text-sm border">
                  <p>
                    {feedback.map((part, i) => (
                      <span
                        key={i}
                        className={
                          part.status === 'removed'
                            ? 'line-through text-red-500' // 빠진 단어
                            : part.status === 'added'
                            ? 'bg-green-200 font-bold' // 잘못 말한 단어
                            : 'opacity-70' // 맞는 단어
                        }
                      >
                        {part.value}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Script finished.</div>
        )}
      </div>

      {/* === Controls === */}
      <footer className="flex items-center justify-between p-4 border-t border-gray-200 bg-white space-x-4">
        <button className="p-2 w-12 h-12 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-xl">
          ⌨️
        </button>
        <button
          onClick={handleMicClick}
          disabled={
            isListening || isSpeaking || !currentLine || !currentLine.isUserTurn
          }
          className="flex-1 flex flex-col items-center justify-center text-blue-600 disabled:opacity-50"
        >
          <div
            className={`w-16 h-16 rounded-full text-white flex items-center justify-center text-3xl transition-colors ${
              isListening ? 'bg-red-500' : 'bg-blue-600' // 듣는 중에는 빨간색
            }`}
          >
            🎤
          </div>
          <span className="mt-1 text-sm">
            {isListening
              ? 'Listening...'
              : isSpeaking
              ? "Computer's Turn..."
              : currentLine?.isUserTurn
              ? 'Click to Speak'
              : "Computer's Turn"}
          </span>
        </button>
        <button className="w-12 h-12 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-xl font-bold">
          ?
        </button>
      </footer>
    </div>
  );
}
