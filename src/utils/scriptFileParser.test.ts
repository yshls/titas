import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseExcelFile } from './scriptFileParser';

/** 시트 배열을 실제 업로드처럼 .xlsx File로 만든다. */
function makeXlsxFile(rows: unknown[][], name = 'Bootcamp 2.0.xlsx'): File {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Sheet1');
  const buffer: ArrayBuffer = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
  return new File([buffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('parseExcelFile', () => {
  it('A열은 대사, B열은 한국어 뜻으로 읽는다', async () => {
    const script = await parseExcelFile(
      makeXlsxFile([
        ['I am looking for a new job.', '새 직장을 찾고 있어요'],
        ['Good luck with it.', '잘되길 바라요'],
      ]),
    );

    expect(script.lines.map((l) => l.originalLine)).toEqual([
      'I am looking for a new job.',
      'Good luck with it.',
    ]);
    expect(script.lines.map((l) => l.translatedLine)).toEqual([
      '새 직장을 찾고 있어요',
      '잘되길 바라요',
    ]);
  });

  it('B열이 비어 있으면 뜻 없이 둔다', async () => {
    const script = await parseExcelFile(makeXlsxFile([['Hello there.', '']]));
    expect(script.lines[0].translatedLine).toBeUndefined();
  });

  it('파일명을 제목으로 쓰고 확장자는 뗀다', async () => {
    const script = await parseExcelFile(makeXlsxFile([['Hello.', '안녕']]));
    expect(script.title).toBe('Bootcamp 2.0');
  });

  it('화자 A와 B가 번갈아 배정된다', async () => {
    const script = await parseExcelFile(
      makeXlsxFile([['one', '하나'], ['two', '둘'], ['three', '셋']]),
    );
    expect(script.lines.map((l) => l.speakerId)).toEqual(['A', 'B', 'A']);
  });

  it('A열이 빈 행은 건너뛴다', async () => {
    const script = await parseExcelFile(
      makeXlsxFile([['Hello.', '안녕'], ['', '버려질 뜻'], ['Bye.', '잘 가']]),
    );
    expect(script.lines).toHaveLength(2);
  });

  it('대사가 하나도 없으면 에러를 던진다', async () => {
    await expect(parseExcelFile(makeXlsxFile([['', '']]))).rejects.toThrow();
  });
});
