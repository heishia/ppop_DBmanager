// API configuration
export const API_CONFIG = {
  DEFAULT_PORT: 3001,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Email configuration
export const EMAIL_CONFIG = {
  DEFAULT_SMTP_PORT: 587,
  MAX_BULK_RECIPIENTS: 50,
} as const;

// Import configuration
export const IMPORT_CONFIG = {
  SUPPORTED_EXTENSIONS: ['.csv', '.xlsx', '.xls'],
  MAX_FILE_SIZE_MB: 10,
  REQUIRED_COLUMNS: ['name', 'email', 'phone'],
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-+()]+$/,
} as const;
