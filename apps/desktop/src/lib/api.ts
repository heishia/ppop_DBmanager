import axios, { AxiosError } from 'axios';
import type {
  Customer,
  CustomerWithContacts,
  CreateCustomerDto,
  UpdateCustomerDto,
  ContactHistory,
  CreateContactDto,
  SendBulkEmailDto,
  ImportResult,
  PaginatedResponse,
  ApiResponse,
  CustomerGroupWithCount,
  CustomerGroupWithMembers,
  CreateGroupDto,
  UpdateGroupDto,
} from '@ppop/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 에러에서 사용자 친화적 메시지 추출
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // 네트워크 에러 (서버 연결 실패)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return `서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인해주세요. (${API_URL})`;
    }
    
    // 서버가 응답한 에러
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.error || error.response.data?.message;
      
      switch (status) {
        case 400:
          return serverMessage || '잘못된 요청입니다.';
        case 401:
          return '인증이 필요합니다.';
        case 403:
          return '권한이 없습니다.';
        case 404:
          return serverMessage || '요청한 리소스를 찾을 수 없습니다.';
        case 500:
          return serverMessage || '서버 내부 오류가 발생했습니다.';
        default:
          return serverMessage || `서버 오류가 발생했습니다. (${status})`;
      }
    }
    
    // 요청이 만들어졌지만 응답 없음
    if (error.request) {
      return '서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.';
    }
  }
  
  // 일반 에러
  if (error instanceof Error) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
}

// Customer API
export async function getCustomers(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<CustomerWithContacts>> {
  const res = await api.get<ApiResponse<PaginatedResponse<CustomerWithContacts>>>(
    `/customers?page=${page}&pageSize=${pageSize}`
  );
  return res.data.data!;
}

export async function getCustomer(id: string): Promise<CustomerWithContacts> {
  const res = await api.get<ApiResponse<CustomerWithContacts>>(`/customers/${id}`);
  return res.data.data!;
}

export async function createCustomer(dto: CreateCustomerDto): Promise<Customer> {
  const res = await api.post<ApiResponse<Customer>>('/customers', dto);
  return res.data.data!;
}

export async function updateCustomer(id: string, dto: UpdateCustomerDto): Promise<Customer> {
  const res = await api.patch<ApiResponse<Customer>>(`/customers/${id}`, dto);
  return res.data.data!;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}

export async function searchCustomers(query: string): Promise<CustomerWithContacts[]> {
  const res = await api.get<ApiResponse<CustomerWithContacts[]>>(`/customers/search?q=${encodeURIComponent(query)}`);
  return res.data.data!;
}

// Contact API
export async function getContacts(customerId: string): Promise<ContactHistory[]> {
  const res = await api.get<ApiResponse<ContactHistory[]>>(`/contacts/customer/${customerId}`);
  return res.data.data!;
}

export async function createContact(dto: CreateContactDto): Promise<ContactHistory> {
  const res = await api.post<ApiResponse<ContactHistory>>('/contacts', dto);
  return res.data.data!;
}

// Email API
export async function sendBulkEmail(dto: SendBulkEmailDto): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  const res = await api.post<ApiResponse<{ total: number; success: number; failed: number }>>(
    '/email/bulk',
    dto
  );
  return res.data.data!;
}

export async function verifyEmailConfig(): Promise<boolean> {
  const res = await api.get<ApiResponse<{ configured: boolean }>>('/email/verify');
  return res.data.data!.configured;
}

// Import API
export interface ColumnMapping {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface PreviewResult {
  success: boolean;
  columns: string[];
  sampleRows: Record<string, unknown>[];
  totalRows: number;
  mapping?: ColumnMapping;
  preview?: Array<{ name: string; email: string; phone: string }>;
  error?: string;
}

export async function importFile(file: File, mapping?: ColumnMapping): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (mapping) {
    formData.append('mapping', JSON.stringify(mapping));
  }

  const res = await api.post<ApiResponse<ImportResult>>('/import/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data!;
}

export async function previewFile(file: File): Promise<PreviewResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<ApiResponse<PreviewResult>>('/import/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data!;
}

export async function importFromBuffer(
  base64: string,
  filename: string,
  mapping?: ColumnMapping
): Promise<ImportResult> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes]);
  const file = new File([blob], filename);
  return importFile(file, mapping);
}

export async function previewFromBuffer(base64: string, filename: string): Promise<PreviewResult> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes]);
  const file = new File([blob], filename);
  return previewFile(file);
}

// Group API
export async function getGroups(): Promise<CustomerGroupWithCount[]> {
  const res = await api.get<ApiResponse<CustomerGroupWithCount[]>>('/groups');
  return res.data.data!;
}

export async function getGroup(id: string): Promise<CustomerGroupWithMembers> {
  const res = await api.get<ApiResponse<CustomerGroupWithMembers>>(`/groups/${id}`);
  return res.data.data!;
}

export async function createGroup(dto: CreateGroupDto): Promise<CustomerGroupWithCount> {
  const res = await api.post<ApiResponse<CustomerGroupWithCount>>('/groups', dto);
  return res.data.data!;
}

export async function updateGroup(id: string, dto: UpdateGroupDto): Promise<CustomerGroupWithCount> {
  const res = await api.patch<ApiResponse<CustomerGroupWithCount>>(`/groups/${id}`, dto);
  return res.data.data!;
}

export async function deleteGroup(id: string): Promise<void> {
  await api.delete(`/groups/${id}`);
}

export async function addGroupMembers(groupId: string, customerIds: string[]): Promise<number> {
  const res = await api.post<ApiResponse<{ added: number }>>(`/groups/${groupId}/members`, {
    customerIds,
  });
  return res.data.data!.added;
}

export async function removeGroupMembers(groupId: string, customerIds: string[]): Promise<number> {
  const res = await api.delete<ApiResponse<{ removed: number }>>(`/groups/${groupId}/members`, {
    data: { customerIds },
  });
  return res.data.data!.removed;
}

export async function getGroupCustomerIds(groupId: string): Promise<string[]> {
  const res = await api.get<ApiResponse<string[]>>(`/groups/${groupId}/customer-ids`);
  return res.data.data!;
}

// Settings API
export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  configured?: boolean;
}

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const res = await api.get<ApiResponse<SmtpSettings>>('/settings/smtp');
  return res.data.data!;
}

export async function updateSmtpSettings(settings: SmtpSettings): Promise<SmtpSettings> {
  const res = await api.put<ApiResponse<SmtpSettings>>('/settings/smtp', settings);
  return res.data.data!;
}

export async function testSmtpConnection(settings: SmtpSettings): Promise<{ valid: boolean; message: string }> {
  const res = await api.post<ApiResponse<{ valid: boolean; message: string }>>('/settings/smtp/test', settings);
  return res.data.data!;
}

// Email History API
export interface EmailHistoryItem {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  contactedAt: string;
  note: string | null;
}

export interface PaginatedEmailHistory {
  items: EmailHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getEmailHistory(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedEmailHistory> {
  const res = await api.get<ApiResponse<PaginatedEmailHistory>>(
    `/contacts/email-history?page=${page}&pageSize=${pageSize}`
  );
  return res.data.data!;
}
