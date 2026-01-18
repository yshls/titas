/**
 * 대화 한 줄 데이터 모델
 */
export interface DialogueLine {
  id: string; // 고유 ID
  speakerId: string; // 화자 식별자
  speakerColor: string; // 할당 컬러
  originalLine: string; // 정답 원본 대사
  isUserTurn: boolean; // 사용자 차례 여부
}

/**
 * 스크립트 전체 데이터 모델
 */
export interface ScriptData {
  id: string; // 스크립트 고유 ID
  title: string; // 스크립트 제목
  createdAt: number; // 생성 타임스탬프
  lines: DialogueLine[]; // 파싱된 대화 배열
}

/**
 * 약점 분석용 오류 데이터 모델
 */
export interface WeakSpot {
  id: string;
  timestamp: number;
  original: string; // 정답 단어
  spoken: string; // 사용자 입력 단어
  scriptId: string; // 오류 발생 스크립트
}

/**
 * 연습 기록 데이터 모델
 */
export interface PracticeLog {
  id: string;
  date: number;
  scriptId: string;
  accuracy: number;
  timeSpent: number;
  errors: WeakSpot[];
}

// 미션 데이터
export interface Mission {
  id: string; // UUID
  text: string;
  completed: boolean;
}
