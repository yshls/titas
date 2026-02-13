/**
 * 화자(캐릭터) 설정 정보 모델
 * (CreatorPage에서 설정한 이름과 색상 테마 저장용)
 */
export interface Character {
  id: string; // 예: 'A', 'B'
  name: string; // 예: 'Harry', 'Teacher' (사용자가 변경 가능)
  colorKey: string; // 예: 'blue50', 'red50' (theme.colors 키값)
}

/**
 * 대화 한 줄 데이터 모델
 */
export interface DialogueLine {
  id: string; // 고유 ID
  speakerId: string; // 화자 이름 (Character.name과 매핑됨)
  speakerColor: string; // 할당된 실제 Hex 컬러 코드
  originalLine: string; // 대사 내용
  isUserTurn?: boolean; // 사용자 차례 여부 (연습 모드용, 선택적)
}

/**
 * 스크립트 전체 데이터 모델
 * (Supabase 'scripts' 테이블의 JSONB 구조와 일치)
 */
export interface ScriptData {
  id: string; // 스크립트 고유 ID (UUID)
  user_id?: string; // 소유자 UUID (Supabase Auth)
  title: string; // 스크립트 제목
  createdAt: number; // 생성 타임스탬프
  lines: DialogueLine[]; // 대화 내용 배열
  characters: Character[]; //  화자 설정 정보 (이름/색상 매핑 저장)
  tags?: string[]; // (옵션) 태그 배열
}

/**
 * 약점 분석용 오류 데이터 모델
 */
export interface WeakSpot {
  id: string;
  timestamp: number;
  original: string; // 정답 단어
  spoken: string; // 사용자 입력 단어
  scriptId: string; // 오류 발생 스크립트 ID
  lineIndex: number; // 오류 발생 라인 인덱스
  lineContent: string; // 오류 발생 라인 내용
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

/**
 * 미션 데이터 모델
 */
export interface Mission {
  id: string; // UUID
  text: string;
  completed: boolean;
  created_at?: string; // DB 타임스탬프
}
