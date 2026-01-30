import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error.middleware';
import * as contactService from '../services/contact.service';
import { AppError } from '@ppop/utils';

export const contactRouter = Router();

const createContactSchema = z.object({
  customerId: z.string().min(1),
  type: z.enum(['email', 'phone', 'other']),
  note: z.string().optional(),
});

// GET /api/contacts/email-history
contactRouter.get(
  '/email-history',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const history = await contactService.getEmailHistory(page, pageSize);
    res.json({ success: true, data: history });
  })
);

// GET /api/contacts/customer/:customerId
contactRouter.get(
  '/customer/:customerId',
  asyncHandler(async (req, res) => {
    const contacts = await contactService.getContactsByCustomer(req.params.customerId);
    res.json({ success: true, data: contacts });
  })
);

// GET /api/contacts/stats/:customerId
contactRouter.get(
  '/stats/:customerId',
  asyncHandler(async (req, res) => {
    const stats = await contactService.getContactStats(req.params.customerId);
    res.json({ success: true, data: stats });
  })
);

// POST /api/contacts
contactRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const contact = await contactService.createContact(parsed.data);
    res.status(201).json({ success: true, data: contact });
  })
);

// DELETE /api/contacts/:id
contactRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await contactService.deleteContact(req.params.id);
    res.json({ success: true });
  })
);
