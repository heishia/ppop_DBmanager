import { prisma } from '../lib/prisma';
import type { ContactHistory, CreateContactDto } from '@ppop/types';
import { AppError } from '@ppop/utils';

export async function getContactsByCustomer(customerId: string): Promise<ContactHistory[]> {
  return prisma.contactHistory.findMany({
    where: { customerId },
    orderBy: { contactedAt: 'desc' },
  });
}

export async function createContact(dto: CreateContactDto): Promise<ContactHistory> {
  const customer = await prisma.customer.findUnique({
    where: { id: dto.customerId },
  });

  if (!customer) {
    throw new AppError('Customer not found', 'NOT_FOUND', 404);
  }

  return prisma.contactHistory.create({
    data: {
      customerId: dto.customerId,
      type: dto.type,
      note: dto.note,
    },
  });
}

export async function deleteContact(id: string): Promise<void> {
  const contact = await prisma.contactHistory.findUnique({ where: { id } });
  if (!contact) {
    throw new AppError('Contact history not found', 'NOT_FOUND', 404);
  }

  await prisma.contactHistory.delete({ where: { id } });
}

export async function getContactStats(customerId: string) {
  const [total, recent] = await Promise.all([
    prisma.contactHistory.count({ where: { customerId } }),
    prisma.contactHistory.findMany({
      where: { customerId },
      orderBy: { contactedAt: 'desc' },
      take: 3,
    }),
  ]);

  return { total, recent };
}

export interface EmailHistoryItem {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  contactedAt: Date;
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
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.contactHistory.findMany({
      where: { type: 'email' },
      orderBy: { contactedAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.contactHistory.count({ where: { type: 'email' } }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      customerId: item.customer.id,
      customerName: item.customer.name,
      customerEmail: item.customer.email,
      contactedAt: item.contactedAt,
      note: item.note,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
