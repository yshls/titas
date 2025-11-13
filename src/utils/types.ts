/**
 * 대화 한줄을 정의하는 데이터 모델
 * 파서(Algo 1)가 이 형태의 데이터를 만듦
 */
export interface DialogueLine {
  id: string; // '고유' ID (crypto.randomUUID())
  speakerId: string; // '화자' '식별자' (예: "Speaker 1")
  speakerColor: string; // '할당'된 '컬러'
  originalLine: string; // '정답' '원본' '대사'
  isUserTurn: boolean; // '사용자' '차례'인지 '여부'
}

/**
 * 스크립트전체를 정의하는 데이터 모델
 * 로컬 스토리지에 저장될 단위
 */
export interface ScriptData {
  id: string; // 스크립트 고유 ID
  title: string; // 스크립트 제목 (예: "공항에서")
  createdAt: number; // 생성 날짜 (Timestamp)
  lines: DialogueLine[]; // 파싱된 대화 라인 배열
}

/**
 * 약점 분석을 위한 오류 데이터 모델
 * Diff(Algo 2)가 이 데이터를 만들어 누적하게 할 것
 */
export interface WeakSpot {
  id: string;
  timestamp: number;
  original: string; // 정답 단어
  spoken: string; // 사용자가 틀린 단어
  scriptId: string; // 어떤 스크립트에서 틀렸는지
}
