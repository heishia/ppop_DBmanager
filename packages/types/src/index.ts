// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
}

// Contact history types
export interface ContactHistory {
  id: string;
  customerId: string;
  contactedAt: Date;
  type: ContactType;
  note?: string;
}

export type ContactType = 'email' | 'phone' | 'other';

export interface CreateContactDto {
  customerId: string;
  type: ContactType;
  note?: string;
}

// Customer with contact summary
export interface CustomerWithContacts extends Customer {
  totalContacts: number;
  recentContacts: ContactHistory[];
}

// Email types
export interface SendEmailDto {
  to: string;
  subject: string;
  body: string;
}

export interface SendBulkEmailDto {
  customerIds: string[];
  subject: string;
  body: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Import types
export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
