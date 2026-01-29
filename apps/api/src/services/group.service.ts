import { prisma } from '../lib/prisma';
import type {
  CreateGroupDto,
  UpdateGroupDto,
  CustomerGroupWithCount,
  CustomerGroupWithMembers,
} from '@ppop/types';
import { AppError } from '@ppop/utils';

export async function getGroups(): Promise<CustomerGroupWithCount[]> {
  const groups = await prisma.customerGroup.findMany({
    include: {
      _count: {
        select: { members: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description ?? undefined,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    memberCount: g._count.members,
  }));
}

export async function getGroupById(id: string): Promise<CustomerGroupWithMembers> {
  const group = await prisma.customerGroup.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          customer: true,
        },
        orderBy: { addedAt: 'desc' },
      },
    },
  });

  if (!group) {
    throw new AppError('Group not found', 'NOT_FOUND', 404);
  }

  return {
    id: group.id,
    name: group.name,
    description: group.description ?? undefined,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    members: group.members.map((m) => ({
      id: m.customer.id,
      name: m.customer.name,
      email: m.customer.email,
      phone: m.customer.phone,
      createdAt: m.customer.createdAt,
      updatedAt: m.customer.updatedAt,
    })),
  };
}

export async function createGroup(dto: CreateGroupDto): Promise<CustomerGroupWithCount> {
  const existing = await prisma.customerGroup.findUnique({
    where: { name: dto.name },
  });

  if (existing) {
    throw new AppError('Group name already exists', 'DUPLICATE', 409);
  }

  const group = await prisma.customerGroup.create({
    data: {
      name: dto.name,
      description: dto.description,
    },
  });

  return {
    id: group.id,
    name: group.name,
    description: group.description ?? undefined,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    memberCount: 0,
  };
}

export async function updateGroup(
  id: string,
  dto: UpdateGroupDto
): Promise<CustomerGroupWithCount> {
  const existing = await prisma.customerGroup.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Group not found', 'NOT_FOUND', 404);
  }

  if (dto.name && dto.name !== existing.name) {
    const duplicate = await prisma.customerGroup.findUnique({
      where: { name: dto.name },
    });
    if (duplicate) {
      throw new AppError('Group name already exists', 'DUPLICATE', 409);
    }
  }

  const group = await prisma.customerGroup.update({
    where: { id },
    data: {
      name: dto.name,
      description: dto.description,
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  return {
    id: group.id,
    name: group.name,
    description: group.description ?? undefined,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    memberCount: group._count.members,
  };
}

export async function deleteGroup(id: string): Promise<void> {
  const existing = await prisma.customerGroup.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Group not found', 'NOT_FOUND', 404);
  }

  await prisma.customerGroup.delete({
    where: { id },
  });
}

export async function addMembers(groupId: string, customerIds: string[]): Promise<number> {
  const group = await prisma.customerGroup.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError('Group not found', 'NOT_FOUND', 404);
  }

  // Get existing members to avoid duplicates
  const existingMembers = await prisma.customerGroupMember.findMany({
    where: {
      groupId,
      customerId: { in: customerIds },
    },
    select: { customerId: true },
  });

  const existingIds = new Set(existingMembers.map((m) => m.customerId));
  const newIds = customerIds.filter((id) => !existingIds.has(id));

  if (newIds.length === 0) {
    return 0;
  }

  await prisma.customerGroupMember.createMany({
    data: newIds.map((customerId) => ({
      groupId,
      customerId,
    })),
  });

  return newIds.length;
}

export async function removeMembers(groupId: string, customerIds: string[]): Promise<number> {
  const result = await prisma.customerGroupMember.deleteMany({
    where: {
      groupId,
      customerId: { in: customerIds },
    },
  });

  return result.count;
}

export async function getGroupCustomerIds(groupId: string): Promise<string[]> {
  const members = await prisma.customerGroupMember.findMany({
    where: { groupId },
    select: { customerId: true },
  });

  return members.map((m) => m.customerId);
}
