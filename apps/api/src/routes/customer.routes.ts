import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error.middleware';
import * as customerService from '../services/customer.service';
import { AppError } from '@ppop/utils';

export const customerRouter = Router();

const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
});

// GET /api/customers
customerRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await customerService.getCustomers(page, pageSize);
    res.json({ success: true, data: result });
  })
);

// GET /api/customers/search
customerRouter.get(
  '/search',
  asyncHandler(async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      throw new AppError('Search query is required', 'INVALID_INPUT', 400);
    }

    const customers = await customerService.searchCustomers(query);
    res.json({ success: true, data: customers });
  })
);

// GET /api/customers/:id
customerRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) {
      throw new AppError('Customer not found', 'NOT_FOUND', 404);
    }
    res.json({ success: true, data: customer });
  })
);

// POST /api/customers
customerRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const customer = await customerService.createCustomer(parsed.data);
    res.status(201).json({ success: true, data: customer });
  })
);

// PATCH /api/customers/:id
customerRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const customer = await customerService.updateCustomer(req.params.id, parsed.data);
    res.json({ success: true, data: customer });
  })
);

// DELETE /api/customers/:id
customerRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await customerService.deleteCustomer(req.params.id);
    res.json({ success: true });
  })
);
