import { Router, type Router as IRouter } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error.middleware';
import { getSmtpSettings, updateSmtpSettings, isSmtpConfigured } from '../services/settings.service';
import { AppError } from '@ppop/utils';

export const settingsRouter: IRouter = Router();

const smtpSettingsSchema = z.object({
  host: z.string().min(1, 'SMTP 호스트를 입력해주세요'),
  port: z.number().min(1).max(65535),
  user: z.string().min(1, 'SMTP 사용자명을 입력해주세요'),
  pass: z.string().min(1, 'SMTP 비밀번호를 입력해주세요'),
  from: z.string().email('올바른 발신 이메일을 입력해주세요'),
});

// GET /api/settings/smtp
settingsRouter.get(
  '/smtp',
  asyncHandler(async (_req, res) => {
    const smtp = getSmtpSettings();
    // 비밀번호는 마스킹 처리
    res.json({
      success: true,
      data: {
        host: smtp.host,
        port: smtp.port,
        user: smtp.user,
        pass: smtp.pass ? '********' : '',
        from: smtp.from,
        configured: isSmtpConfigured(),
      },
    });
  })
);

// PUT /api/settings/smtp
settingsRouter.put(
  '/smtp',
  asyncHandler(async (req, res) => {
    const parsed = smtpSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message || 'Invalid input',
        'INVALID_INPUT',
        400
      );
    }

    const updated = updateSmtpSettings(parsed.data);
    res.json({
      success: true,
      data: {
        host: updated.host,
        port: updated.port,
        user: updated.user,
        pass: '********',
        from: updated.from,
        configured: isSmtpConfigured(),
      },
    });
  })
);

// POST /api/settings/smtp/test
settingsRouter.post(
  '/smtp/test',
  asyncHandler(async (req, res) => {
    const parsed = smtpSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message || 'Invalid input',
        'INVALID_INPUT',
        400
      );
    }

    // 테스트용 transporter 생성
    const nodemailer = await import('nodemailer');
    const testTransporter = nodemailer.default.createTransport({
      host: parsed.data.host,
      port: parsed.data.port,
      secure: parsed.data.port === 465,
      auth: {
        user: parsed.data.user,
        pass: parsed.data.pass,
      },
    });

    try {
      await testTransporter.verify();
      res.json({ success: true, data: { valid: true, message: 'SMTP 연결 성공' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.json({ success: true, data: { valid: false, message: `SMTP 연결 실패: ${message}` } });
    }
  })
);
