import { Link } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useState, useEffect } from 'react';

import { loadAllScripts, loadPracticeLogs } from '@/utils/storageService';
import type { PracticeLog } from '@/utils/storageService';

import type { ScriptData } from '@/utils/types';

export function GrowthHubPage() {
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [logs, setLogs] = useState<PracticeLog[]>([]);

  // 스크립트 및 연습 기록 로드
  useEffect(() => {
    setScripts(loadAllScripts());
    setLogs(loadPracticeLogs());
  }, []);

  // 연습 기록을 날짜 배열로 가공
  const practicedDays = logs.map((log) => new Date(log.date));

  // 캘린더 스타일 정의
  const modifiers = {
    practiced: practicedDays, // 연습한 날짜
    today: new Date(),
  };

  const modifiersStyles = {
    practiced: {
      backgroundColor: '#C0D5FF', // 연습일 배경색
      color: 'white',
    },
    today: {
      fontWeight: 'bold',
      color: '#3A76F0',
    },
  };

  return (
    <>
      {/* 영역 1: 캘린더 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">My Activity</h2>
        <div className="p-4 rounded-lg shadow-sm border border-gray-200 flex justify-center">
          <DayPicker
            mode="single"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </div>
      </div>

      {/* 영역 2: 통계 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Avg. Accuracy</h3>
            <p className="text-2xl font-bold">N/A</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Scripts</h3>
            <p className="text-2xl font-bold">{scripts.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Lines</h3>
            <p className="text-2xl font-bold">
              {scripts.reduce((acc, script) => acc + script.lines.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* 영역 3: 핵심 버튼 */}
      <div className="flex flex-col space-y-4">
        <Link
          to="#"
          className="w-full text-center bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          Load My Scripts
        </Link>
        <Link
          to="#"
          className="w-full text-center text-gray-600 py-2 hover:text-black transition"
        >
          Review My Weak Spots
        </Link>
      </div>
    </>
  );
}
