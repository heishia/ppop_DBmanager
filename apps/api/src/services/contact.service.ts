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
