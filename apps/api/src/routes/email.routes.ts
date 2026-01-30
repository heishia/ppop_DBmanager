import { Router, type Router as IRouter } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error.middleware';
import { sendEmail, verifyEmailConfig } from '../lib/email';
import * as emailService from '../services/email.service';
import { AppError } from '@ppop/utils';

export const emailRouter: IRouter = Router();

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

const sendBulkEmailSchema = z.object({
  customerIds: z.array(z.string()).min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
});

// GET /api/email/verify
emailRouter.get(
  '/verify',
  asyncHandler(async (_req, res) => {
    const valid = await verifyEmailConfig();
    res.json({ success: true, data: { configured: valid } });
  })
);

// POST /api/email/send
emailRouter.post(
  '/send',
  asyncHandler(async (req, res) => {
    const parsed = sendEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const result = await sendEmail(parsed.data);
    res.json({ success: true, data: result });
  })
);

// POST /api/email/bulk
emailRouter.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const parsed = sendBulkEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', 'INVALID_INPUT', 400);
    }

    const result = await emailService.sendBulkEmail(parsed.data);
    res.json({ success: true, data: result });
  })
);
