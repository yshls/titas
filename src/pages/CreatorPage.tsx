import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동
import type { DialogueLine } from '@/utils/types';
import { parseScript } from '@/utils/parser'; // 스크립트 파서

// 임시 스피커 목록
const SPEAKERS = [
  { id: 'Speaker 1', color: '#C8F0EB' },
  { id: 'Speaker 2', color: '#FFF4CC' },
  { id: 'Speaker 3', color: '#DED9F2' },
];

export function CreatorPage() {
  const navigate = useNavigate();
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>(
    SPEAKERS[0].id
  );
  const [currentLineInput, setCurrentLineInput] = useState('');
  const [scriptLines, setScriptLines] = useState<DialogueLine[]>([]); // 파싱된 대사
  const [scriptTitle, setScriptTitle] = useState('Untitled Script');

  // 대사 추가 핸들러
  const handleAddLine = () => {
    if (currentLineInput.trim() === '') return;

    const speakerColorMap = SPEAKERS.reduce((acc, speaker) => {
      acc[speaker.id] = speaker.color;
      return acc;
    }, {} as Record<string, string>);

    // 스크립트 파싱
    const newLines = parseScript(
      `${activeSpeakerId}: ${currentLineInput}`,
      speakerColorMap
    );

    setScriptLines([...scriptLines, ...newLines]);
    setCurrentLineInput('');
  };

  // 연습 시작
  const handleStartPractice = () => {
    if (scriptLines.length === 0) {
      alert('Please add at least one line to the script.');
      return;
    }

    navigate(
      `/talk/new-script`, // 임시 ID
      { state: { script: scriptLines } } // 데이터 전달
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 왼쪽 패널 */}
      <div className="w-1/4 min-w-[250px] bg-white border-r border-gray-200 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">TiTaS Creator</h1>

        <label className="text-sm font-medium text-gray-500">
          Script Title
        </label>
        <input
          type="text"
          value={scriptTitle}
          onChange={(e) => setScriptTitle(e.target.value)}
          placeholder="Enter script title"
          className="w-full p-2 border border-gray-300 rounded-md mt-1 mb-6"
        />

        <button className="w-full p-2 mb-6 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Save Script
        </button>

        <label className="text-sm font-medium text-gray-500">Speakers</label>
        <div className="space-y-2 mt-2">
          {SPEAKERS.map((speaker) => (
            <button
              key={speaker.id}
              onClick={() => setActiveSpeakerId(speaker.id)}
              className={`w-full p-3 text-left rounded-md border-2 ${
                activeSpeakerId === speaker.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-transparent hover:bg-gray-100'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full inline-block mr-3"
                style={{ backgroundColor: speaker.color }}
              ></span>
              {speaker.id}
            </button>
          ))}
        </div>
        <button className="w-full p-2 mt-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
          + Add Speaker
        </button>
      </div>

      {/* 오른쪽 메인 영역 */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Script Editor</h2>
          {/* 세션 종료 */}
          <a
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            [ End Session ]
          </a>
        </div>

        {/* 대화 리스트 */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto">
          {scriptLines.length === 0 ? (
            <p className="text-gray-400">
              Select a speaker and start writing your dialogue below...
            </p>
          ) : (
            <div className="space-y-3">
              {scriptLines.map((line) => (
                <div key={line.id}>
                  <span
                    className="font-semibold"
                    style={{ color: line.speakerColor }}
                  >
                    [{line.speakerId}]
                  </span>
                  <span className="ml-2 text-gray-800">
                    {line.originalLine}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 명령 입력 창 */}
        <div className="mt-4 flex space-x-3">
          <input
            type="text"
            value={currentLineInput}
            onChange={(e) => setCurrentLineInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLine()}
            placeholder="Type a line of dialogue and press Enter"
            className="flex-1 p-3 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleAddLine}
            className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleStartPractice}
            className="p-3 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 text-lg font-bold"
          >
            Start Practice →
          </button>
        </div>
      </div>
    </div>
  );
}
