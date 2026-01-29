import axios from 'axios';
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
} from '@ppop/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export async function searchCustomers(query: string): Promise<Customer[]> {
  const res = await api.get<ApiResponse<Customer[]>>(`/customers/search?q=${encodeURIComponent(query)}`);
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
export async function importFile(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<ApiResponse<ImportResult>>('/import/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data!;
}

export async function importFromBuffer(base64: string, filename: string): Promise<ImportResult> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes]);
  const file = new File([blob], filename);
  return importFile(file);
}
