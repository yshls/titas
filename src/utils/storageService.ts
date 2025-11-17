import type { ScriptData, WeakSpot } from '@/utils/types';

// 로컬 스토리지 키 정의
const SCRIPTS_KEY = 'titas_scripts'; // Creator(2페이지) 스크립트 저장 키
const PRACTICE_LOG_KEY = 'titas_practice_log'; // Talk(3페이지) 연습 기록 저장 키

// GrowthHub용 데이터 모델
export interface PracticeLog {
  id: string;
  date: number; // 연습 날짜
  scriptId: string;
  accuracy: number; // 평균 정확도
  timeSpent: number; // 연습 시간 (초)
  errors: WeakSpot[]; // 틀린 단어 목록
}

/**
 * 모든 스크립트 목록 로드 (GrowthHub 페이지용)
 */
export function loadAllScripts(): ScriptData[] {
  try {
    const data = localStorage.getItem(SCRIPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load scripts:', error);
    return [];
  }
}

/**
 * 새 스크립트 저장 (Creator 페이지용)
 */
export function saveScript(script: ScriptData): void {
  try {
    const scripts = loadAllScripts();
    scripts.push(script); // 새 스크립트 추가
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
  } catch (error) {
    console.error('Failed to save script:', error);
  }
}

/**
 * 모든 연습 기록 로드 (GrowthHub 페이지용)
 */
export function loadPracticeLogs(): PracticeLog[] {
  try {
    const data = localStorage.getItem(PRACTICE_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load practice logs:', error);
    return [];
  }
}

/**
 * 새 연습 기록 추가 (Talk 페이지용)
 */
export function addPracticeLog(logEntry: PracticeLog): void {
  try {
    const logs = loadPracticeLogs();
    logs.push(logEntry); // 새 기록 추가
    localStorage.setItem(PRACTICE_LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to save practice log:', error);
  }
}
