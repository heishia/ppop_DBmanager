import nodemailer from 'nodemailer';
import type { SendEmailDto, EmailResult } from '@ppop/types';
import { getSmtpSettings, isSmtpConfigured } from '../services/settings.service';

// 매번 최신 설정으로 transporter 생성 (설정이 변경될 수 있으므로)
function createTransporter(): nodemailer.Transporter {
  const smtp = getSmtpSettings();
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
}

export async function sendEmail(dto: SendEmailDto): Promise<EmailResult> {
  try {
    const smtp = getSmtpSettings();
    const transport = createTransporter();
    const info = await transport.sendMail({
      from: smtp.from,
      to: dto.to,
      subject: dto.subject,
      html: dto.body,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!isSmtpConfigured()) {
      return false;
    }
    const transport = createTransporter();
    await transport.verify();
    return true;
  } catch {
    return false;
  }
}
