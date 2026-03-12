import * as XLSX from 'xlsx';
import { logger } from '@task-tracker/utils';

export interface ParsedRow {
  [key: string]: string | number | boolean | null | undefined;
}

export function parseFileBuffer(buffer: Buffer, originalName: string): ParsedRow[] {
  logger.debug('parseFile', { originalName, bufferLength: buffer.length });

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw Object.assign(new Error('File contains no sheets'), { status: 400 });
  }

  const rows: ParsedRow[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: '',
    raw: false,
  });

  logger.debug('parseFile result', { rows: rows.length, columns: rows.length > 0 ? Object.keys(rows[0]) : [] });
  return rows;
}
