import type { DialogueLine } from '@/utils/types';

// 문장 종결 부호(. ? !) 와 그 뒤 공백을 찾는 정규식
const SENTENCE_SPLIT_REGEX = /(.*?[.?!])\s*/g;

/**
RAW 텍스트를 입력받아 문장 단위로 분리하고 화자 정보를 할당
*/

export function parseScript(
  rawText: string,
  speakerMap: Record<string, string> // {'Speaker 1': '#C8F0EB'}
): DialogueLine[] {
  // 1. 텍스트 정리 및 화자 식별자 추출 로직 시작
  const resultLines: DialogueLine[] = [];

  // 화자랑 패턴 정의
  const speakerPattern = /(Speaker\s*\d+:)\s*/g;
  const parts = rawText
    .trim()
    .split(speakerPattern)
    .filter((p) => p.trim() !== '');

  for (let i = 0; i < parts.length; i += 2) {
    const speakerIdPrefix = parts[i] ? parts[i].trim() : '';
    const rawLineBlock = parts[i + 1] ? parts[i + 1].trim() : ''; // 긴 단락

    const speakerId = speakerIdPrefix.replace(':', '');
    // 회자 id 추출
    if (rawLineBlock.length > 0 && speakerId) {
      const sentences = rawLineBlock.match(SENTENCE_SPLIT_REGEX);
      if (sentences && sentences.length > 0) {
        for (const sentence of sentences) {
          const trimmedLine = sentence.trim();
          if (trimmedLine.length > 0) {
            resultLines.push({
              id: crypto.randomUUID(), // 고유 ID
              speakerId: speakerId,
              speakerColor: speakerMap[speakerId] || '#AAAAAA', // 맵에 없으면 회색
              originalLine: trimmedLine,
              isUserTurn: speakerId === 'Speaker 1', // 사용자가 첫 화자라고 가정 => 임시 설정
            });
          }
        }
      } else {
        // 문장 분리가 안된 경우 전체 블록을 하나의 라인으로 처리
        resultLines.push({
          id: crypto.randomUUID(),
          speakerId: speakerId,
          speakerColor: speakerMap[speakerId] || '#AAAAAA',
          originalLine: rawLineBlock,
          isUserTurn: speakerId === 'Speaker 1',
        });
      }
    }
  }
  return resultLines;
}
