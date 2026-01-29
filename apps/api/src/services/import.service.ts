import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';
import type { ImportResult, ImportError } from '@ppop/types';
import { IMPORT_CONFIG } from '@ppop/config';
import { isValidEmail, isValidPhone, normalizeEmail } from '@ppop/utils';
import { analyzeAndTransformData, applyMapping, ColumnMapping } from '../lib/gemini';

interface RawRow {
  [key: string]: unknown;
}

interface CustomerRow {
  name: string;
  email: string;
  phone: string;
}

export interface PreviewResult {
  success: boolean;
  columns: string[];
  sampleRows: RawRow[];
  totalRows: number;
  mapping?: ColumnMapping;
  preview?: CustomerRow[];
  error?: string;
}

/**
 * Excel 파일 미리보기 및 AI 매핑 분석
 */
export async function previewFile(buffer: Buffer): Promise<PreviewResult> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: RawRow[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return { success: false, columns: [], sampleRows: [], totalRows: 0, error: '데이터가 없습니다' };
    }

    // 열 이름 추출
    const columns = Object.keys(rows[0]);
    const sampleRows = rows.slice(0, 5);

    // AI로 매핑 분석
    const aiResult = await analyzeAndTransformData(columns, sampleRows);

    if (!aiResult.success || !aiResult.mapping) {
      return {
        success: true,
        columns,
        sampleRows,
        totalRows: rows.length,
        error: aiResult.error || 'AI 매핑 분석 실패',
      };
    }

    // 미리보기 데이터 생성
    const preview = applyMapping(sampleRows, aiResult.mapping);

    return {
      success: true,
      columns,
      sampleRows,
      totalRows: rows.length,
      mapping: aiResult.mapping,
      preview,
    };
  } catch (error) {
    return {
      success: false,
      columns: [],
      sampleRows: [],
      totalRows: 0,
      error: error instanceof Error ? error.message : '파일 분석 중 오류 발생',
    };
  }
}

/**
 * AI 매핑을 적용하여 파일 임포트
 */
export async function importFromFile(
  buffer: Buffer,
  filename: string,
  mapping?: ColumnMapping
): Promise<ImportResult> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows: RawRow[] = XLSX.utils.sheet_to_json(sheet);

  // 매핑이 없으면 AI로 분석
  let finalMapping = mapping;
  if (!finalMapping) {
    const columns = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
    const aiResult = await analyzeAndTransformData(columns, rawRows.slice(0, 5));
    if (aiResult.success && aiResult.mapping) {
      finalMapping = aiResult.mapping;
    }
  }

  // 매핑 적용하여 데이터 변환
  const rows: CustomerRow[] = finalMapping
    ? applyMapping(rawRows, finalMapping)
    : rawRows.map((row) => ({
        name: String(row.name || row['이름'] || row['고객명'] || row['성명'] || ''),
        email: String(row.email || row['이메일'] || row['메일'] || ''),
        phone: String(row.phone || row['전화번호'] || row['연락처'] || row['핸드폰'] || ''),
      }));

  const errors: ImportError[] = [];
  let successCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // Excel row number (1-indexed + header)

    // Validate required fields
    if (!row.name) {
      errors.push({ row: rowNum, field: 'name', message: 'Name is required' });
      continue;
    }

    if (!row.email) {
      errors.push({ row: rowNum, field: 'email', message: 'Email is required' });
      continue;
    }

    if (!row.phone) {
      errors.push({ row: rowNum, field: 'phone', message: 'Phone is required' });
      continue;
    }

    // Validate formats
    const email = normalizeEmail(row.email);
    if (!isValidEmail(email)) {
      errors.push({ row: rowNum, field: 'email', message: 'Invalid email format' });
      continue;
    }

    if (!isValidPhone(row.phone)) {
      errors.push({ row: rowNum, field: 'phone', message: 'Invalid phone format' });
      continue;
    }

    // Check duplicate
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      errors.push({ row: rowNum, field: 'email', message: 'Email already exists' });
      continue;
    }

    // Create customer
    try {
      await prisma.customer.create({
        data: {
          name: row.name.trim(),
          email,
          phone: row.phone.trim(),
        },
      });
      successCount++;
    } catch (error) {
      errors.push({
        row: rowNum,
        field: 'unknown',
        message: error instanceof Error ? error.message : 'Failed to create customer',
      });
    }
  }

  return {
    total: rows.length,
    success: successCount,
    failed: errors.length,
    errors,
  };
}
