import { prisma } from '../lib/prisma';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerWithContacts,
  PaginatedResponse,
} from '@ppop/types';
import { API_CONFIG } from '@ppop/config';
import { AppError, normalizeEmail } from '@ppop/utils';

export async function getCustomers(
  page: number = 1,
  pageSize: number = API_CONFIG.DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<CustomerWithContacts>> {
  const skip = (page - 1) * pageSize;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        contacts: {
          orderBy: { contactedAt: 'desc' },
          take: 3,
        },
        _count: {
          select: { contacts: true },
        },
      },
    }),
    prisma.customer.count(),
  ]);

  const items: CustomerWithContacts[] = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    totalContacts: c._count.contacts,
    recentContacts: c.contacts,
  }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCustomerById(id: string): Promise<CustomerWithContacts | null> {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      contacts: {
        orderBy: { contactedAt: 'desc' },
        take: 3,
      },
      _count: {
        select: { contacts: true },
      },
    },
  });

  if (!customer) return null;

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    totalContacts: customer._count.contacts,
    recentContacts: customer.contacts,
  };
}

export async function createCustomer(dto: CreateCustomerDto): Promise<Customer> {
  const email = normalizeEmail(dto.email);

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Customer with this email already exists', 'DUPLICATE_EMAIL', 409);
  }

  return prisma.customer.create({
    data: {
      name: dto.name,
      email,
      phone: dto.phone,
    },
  });
}

export async function updateCustomer(id: string, dto: UpdateCustomerDto): Promise<Customer> {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new AppError('Customer not found', 'NOT_FOUND', 404);
  }

  const data: Partial<{ name: string; email: string; phone: string }> = {};
  if (dto.name) data.name = dto.name;
  if (dto.email) data.email = normalizeEmail(dto.email);
  if (dto.phone) data.phone = dto.phone;

  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new AppError('Customer not found', 'NOT_FOUND', 404);
  }

  await prisma.customer.delete({ where: { id } });
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  return prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
      ],
    },
    take: 20,
  });
}
