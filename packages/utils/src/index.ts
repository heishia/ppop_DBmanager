import { VALIDATION_PATTERNS } from '@ppop/config';

// Validation utilities
export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.EMAIL.test(email);
}

export function isValidPhone(phone: string): boolean {
  return VALIDATION_PATTERNS.PHONE.test(phone);
}

// String utilities
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

// ID generation
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Pagination utilities
export function calculatePagination(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  
  return {
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Error utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
