import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import type { DialogueLine, ScriptData } from '@/utils/types';
import { parseScript } from '@/utils/parser';

// 화자 설정
const SPEAKERS = [
  {
    id: 'Speaker 1',
    colorClass: 'bg-blue-300',
    textClass: 'text-blue-500',
    hex: '#60A5FA',
  },
  {
    id: 'Speaker 2',
    colorClass: 'bg-green-300',
    textClass: 'text-green-500',
    hex: '#34D399',
  },
  {
    id: 'Speaker 3',
    colorClass: 'bg-purple-300',
    textClass: 'text-purple-500',
    hex: '#A78BFA',
  },
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
  const [scriptTitle, setScriptTitle] = useState('Untitled Script');

  // 화자 색상 매핑
  const speakerColorMap = SPEAKERS.reduce((acc, speaker) => {
    acc[speaker.id] = speaker.hex;
    return acc;
  }, {} as Record<string, string>);

  // 대사 추가
  const handleAddLine = () => {
    if (currentLineInput.trim() === '') return;

    const newLines = parseScript(
      `${activeSpeakerId}: ${currentLineInput}`,
      speakerColorMap
    );

    setScriptLines([...scriptLines, ...newLines]);
    setCurrentLineInput('');
  };

  // 스크립트 저장
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
    setScriptTitle(`Untitled Script #${currentScripts.length + 1}`);
    alert(
      `[${newScript.title}] 스크립트가 저장되었습니다! (총 ${
        currentScripts.length + 1
      }개)`
    );
  };

  // 연습 시작
  const handleStartPractice = () => {
    if (scriptLines.length === 0) {
      alert('연습을 시작하려면 대사가 필요합니다.');
      return;
    }

    navigate('/talk/practice', { state: { lines: scriptLines } });
  };

  const activeSpeaker = SPEAKERS.find((s) => s.id === activeSpeakerId);

  return (
    <div className="flex h-[80vh] gap-6 p-8 bg-gray-900 text-gray-200">
      {/* 왼쪽 패널 */}
      <div className="w-1/4 min-w-[250px] border-r border-gray-700 pr-6 flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-orange-400">Creator</h1>

        <label className="text-sm font-medium text-gray-400">
          Script Title
        </label>
        <input
          type="text"
          value={scriptTitle}
          onChange={(e) => setScriptTitle(e.target.value)}
          placeholder="스크립트 제목 입력"
          className="w-full p-2 border border-gray-600 rounded-md mt-1 mb-6 bg-gray-700 text-white"
        />

        <button
          onClick={handleSaveScript}
          className="w-full p-3 mb-6 text-white bg-orange-600 rounded-lg hover:bg-orange-700 font-bold transition duration-200 shadow-md"
        >
          💾 Save Script
        </button>

        <label className="text-sm font-medium text-gray-400">Speakers</label>
        <div className="space-y-2 mt-2">
          {SPEAKERS.map((speaker) => (
            <button
              key={speaker.id}
              onClick={() => setActiveSpeakerId(speaker.id)}
              className={`w-full p-3 text-left rounded-lg border-2 transition duration-150 ${
                activeSpeakerId === speaker.id
                  ? 'border-orange-500 bg-gray-700 shadow-lg'
                  : 'border-transparent hover:bg-gray-700/50'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full inline-block mr-3 ${speaker.colorClass}`}
              ></span>
              <span className={speaker.textClass}>{speaker.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 오른쪽 메인 영역 */}
      <div className="flex-1 flex flex-col pt-2 pb-6">
        <h2 className="text-2xl font-semibold mb-4">Editor: {scriptTitle}</h2>

        {/* 대화 리스트 */}
        <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-6 overflow-y-auto shadow-inner">
          {scriptLines.length === 0 ? (
            <p className="text-gray-500">
              {activeSpeaker?.id}의 대사를 입력하고 Enter를 누르세요.
            </p>
          ) : (
            <div className="space-y-4">
              {scriptLines.map((line) => (
                <div key={line.id} className="flex items-start">
                  <span
                    className="w-3 h-3 rounded-full inline-block mt-2 mr-3 flex-shrink-0"
                    style={{ backgroundColor: line.speakerColor }}
                  ></span>

                  <div>
                    <span
                      className={`font-semibold ${
                        line.isUserTurn ? 'text-orange-400' : 'text-gray-400'
                      }`}
                    >
                      [{line.speakerId}]
                    </span>
                    <span className="ml-2 text-gray-200 whitespace-pre-wrap">
                      {line.originalLine}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="mt-4 flex space-x-3 items-center">
          <span
            className={`font-bold ${activeSpeaker?.textClass} flex-shrink-0`}
          >
            [{activeSpeaker?.id}]
          </span>
          <input
            type="text"
            value={currentLineInput}
            onChange={(e) => setCurrentLineInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
            placeholder="대사를 입력하고 Enter"
            className="flex-1 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:border-blue-400"
          />
          <button
            onClick={handleAddLine}
            className="p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200"
          >
            Add
          </button>
        </div>

        {/* 연습 시작 버튼 */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleStartPractice}
            className="p-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-bold shadow-xl transition duration-200"
          >
            Start Practice →
          </button>
        </div>
      </div>
    </div>
  );
}
