import type { DialogueLine } from '@/utils/types';

// 문장 종결 부호 분리 정규식
const SENTENCE_SPLIT_REGEX = /(.*?[.?!])\s*/g;

/**
 * 원본 텍스트를 파싱하여 대화 라인 배열 생성
 * @param rawText - 콜론과 줄바꿈으로 구분된 원본 스크립트
 * @param speakerMap - 화자 ID와 컬러 매핑 객체
 * @returns DialogueLine 배열
 */

export function parseScript(
  rawText: string,
  speakerMap: Record<string, string>
): DialogueLine[] {
  const resultLines: DialogueLine[] = [];

  // 화자 식별자 패턴
  const speakerPattern = /(Speaker\s*\d+:)/g;

  // 텍스트를 화자 기준으로 분리
  const parts = rawText.trim().split(speakerPattern);

  // 화자와 대사 추출
  for (let i = 1; i < parts.length; i += 2) {
    const speakerIdPrefix = parts[i].trim();
    const rawLineBlock = parts[i + 1] ? parts[i + 1].trim() : '';

    const speakerId = speakerIdPrefix.replace(':', '').trim();

    if (rawLineBlock.length > 0 && speakerId) {
      // 대사를 문장 단위로 분리
      const sentences = rawLineBlock.match(SENTENCE_SPLIT_REGEX);

      if (sentences && sentences.length > 0) {
        for (const sentence of sentences) {
          const trimmedLine = sentence.trim();

          if (trimmedLine.length > 0) {
            resultLines.push({
              id: crypto.randomUUID(),
              speakerId: speakerId,
              speakerColor: speakerMap[speakerId] || '#AAAAAA',
              originalLine: trimmedLine,
              isUserTurn: speakerId === 'Speaker 1',
            });
          }
        }
      } else {
        // 문장 부호 없는 경우 전체를 하나의 라인으로 처리
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
