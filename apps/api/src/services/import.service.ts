import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';
import type { ImportResult, ImportError } from '@ppop/types';
import { IMPORT_CONFIG } from '@ppop/config';
import { isValidEmail, isValidPhone, normalizeEmail } from '@ppop/utils';

interface RawRow {
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export async function importFromFile(buffer: Buffer, filename: string): Promise<ImportResult> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: RawRow[] = XLSX.utils.sheet_to_json(sheet);

  const errors: ImportError[] = [];
  let successCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // Excel row number (1-indexed + header)

    // Validate required fields
    if (!row.name || typeof row.name !== 'string') {
      errors.push({ row: rowNum, field: 'name', message: 'Name is required' });
      continue;
    }

    if (!row.email || typeof row.email !== 'string') {
      errors.push({ row: rowNum, field: 'email', message: 'Email is required' });
      continue;
    }

    if (!row.phone || typeof row.phone !== 'string') {
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
