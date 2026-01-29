import { prisma } from '../lib/prisma';
import { sendEmail } from '../lib/email';
import type { SendBulkEmailDto, EmailResult } from '@ppop/types';
import { AppError } from '@ppop/utils';

export async function sendBulkEmail(dto: SendBulkEmailDto): Promise<{
  total: number;
  success: number;
  failed: number;
  results: Array<{ customerId: string; email: string; result: EmailResult }>;
}> {
  const customers = await prisma.customer.findMany({
    where: { id: { in: dto.customerIds } },
    select: { id: true, email: true },
  });

  if (customers.length === 0) {
    throw new AppError('No customers found', 'NOT_FOUND', 404);
  }

  const results: Array<{ customerId: string; email: string; result: EmailResult }> = [];
  let successCount = 0;
  let failedCount = 0;

  for (const customer of customers) {
    const result = await sendEmail({
      to: customer.email,
      subject: dto.subject,
      body: dto.body,
    });

    results.push({
      customerId: customer.id,
      email: customer.email,
      result,
    });

    if (result.success) {
      successCount++;
      // Record contact history
      await prisma.contactHistory.create({
        data: {
          customerId: customer.id,
          type: 'email',
          note: `Subject: ${dto.subject}`,
        },
      });
    } else {
      failedCount++;
    }
  }

  return {
    total: customers.length,
    success: successCount,
    failed: failedCount,
    results,
  };
}
