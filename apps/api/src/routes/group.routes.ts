import { Router, type Router as IRouter } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error.middleware';
import * as groupService from '../services/group.service';
import { AppError } from '@ppop/utils';

export const groupRouter: IRouter = Router();

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

const addMembersSchema = z.object({
  customerIds: z.array(z.string()).min(1),
});

// GET /api/groups - 모든 그룹 조회
groupRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const groups = await groupService.getGroups();
    res.json({ success: true, data: groups });
  })
);

// GET /api/groups/:id - 그룹 상세 조회 (멤버 포함)
groupRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const group = await groupService.getGroupById(req.params.id);
    res.json({ success: true, data: group });
  })
);

// POST /api/groups - 그룹 생성
groupRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const group = await groupService.createGroup(parsed.data);
    res.status(201).json({ success: true, data: group });
  })
);

// PATCH /api/groups/:id - 그룹 수정
groupRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const parsed = updateGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const group = await groupService.updateGroup(req.params.id, parsed.data);
    res.json({ success: true, data: group });
  })
);

// DELETE /api/groups/:id - 그룹 삭제
groupRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await groupService.deleteGroup(req.params.id);
    res.json({ success: true });
  })
);

// POST /api/groups/:id/members - 멤버 추가
groupRouter.post(
  '/:id/members',
  asyncHandler(async (req, res) => {
    const parsed = addMembersSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const added = await groupService.addMembers(req.params.id, parsed.data.customerIds);
    res.json({ success: true, data: { added } });
  })
);

// DELETE /api/groups/:id/members - 멤버 제거
groupRouter.delete(
  '/:id/members',
  asyncHandler(async (req, res) => {
    const parsed = addMembersSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const removed = await groupService.removeMembers(req.params.id, parsed.data.customerIds);
    res.json({ success: true, data: { removed } });
  })
);

// GET /api/groups/:id/customer-ids - 그룹 멤버 ID 목록 조회
groupRouter.get(
  '/:id/customer-ids',
  asyncHandler(async (req, res) => {
    const customerIds = await groupService.getGroupCustomerIds(req.params.id);
    res.json({ success: true, data: customerIds });
  })
);
