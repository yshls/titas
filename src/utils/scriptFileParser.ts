import { generateUUID } from '@/utils/uuid';
import { SPEAKER_COLORS } from '@/components/Creator/CreatorLayout';
import { INITIAL_SPEAKERS } from '@/hooks/pageSpecific/useCreatorEngine';
import type { DialogueLine, Character } from '@/utils/types';
import i18n from '@/i18n';

export interface ParsedScript {
  title: string;
  characters: Character[];
  lines: DialogueLine[];
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^./]+$/, '');
}

// 대사 텍스트 배열을 화자 A/B가 번갈아 말하는 스크립트로 변환
function buildScriptFromLines(title: string, rawLines: string[]): ParsedScript {
  const speakers = INITIAL_SPEAKERS.slice(0, 2);

  const lines: DialogueLine[] = rawLines.map((text, index) => {
    const speaker = speakers[index % speakers.length];
    return {
      id: generateUUID(),
      speakerId: speaker.id,
      speakerColor: SPEAKER_COLORS[speaker.colorKey] || '#f3f4f6',
      originalLine: text,
      isUserTurn: false,
    };
  });

  return {
    title,
    characters: speakers.map(({ id, name, colorKey }) => ({ id, name, colorKey })),
    lines,
  };
}

// 엑셀/CSV: 첫 번째 시트의 A열을 대사로 사용, 한 행 = 한 줄
export async function parseExcelFile(file: File): Promise<ParsedScript> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error(i18n.t('scripts.noSheetFound'));
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
  });

  const rawLines = rows
    .map((row) => String(row?.[0] ?? '').trim())
    .filter((text) => text.length > 0);

  if (rawLines.length === 0) {
    throw new Error(i18n.t('scripts.noDialogueLines'));
  }

  return buildScriptFromLines(stripExtension(file.name), rawLines);
}

// PDF: 페이지별 텍스트를 줄바꿈(Y좌표 변화) 기준으로 추출
export async function parsePdfFile(file: File): Promise<ParsedScript> {
  const pdfjsLib = await import('pdfjs-dist');
  const workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const rawLines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let currentLine = '';
    let lastY: number | null = null;

    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const y = item.transform?.[5] ?? null;

      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
        if (currentLine.trim()) rawLines.push(currentLine.trim());
        currentLine = '';
      }

      currentLine += item.str;
      lastY = y;
    }

    if (currentLine.trim()) rawLines.push(currentLine.trim());
  }

  const cleanedLines = rawLines.map((line) => line.trim()).filter((line) => line.length > 0);

  if (cleanedLines.length === 0) {
    throw new Error(i18n.t('scripts.noPdfText'));
  }

  return buildScriptFromLines(stripExtension(file.name), cleanedLines);
}

export async function parseScriptFile(file: File): Promise<ParsedScript> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    return parsePdfFile(file);
  }

  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
    return parseExcelFile(file);
  }

  throw new Error(i18n.t('scripts.unsupportedFileType'));
}
