import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { payments } from '../db/schema';

export class PaymentRepository {
  async create(input: {
    reservationId: string;
    amount: string;
    reference: string;
    status?: 'pending' | 'paid' | 'failed' | 'refunded';
    method?: 'm_pesa' | 'e_mola' | null;
    paidAt?: Date;
  }) {
    const [row] = await db
      .insert(payments)
      .values({
        reservationId: input.reservationId,
        amount: input.amount,
        reference: input.reference,
        status: input.status ?? 'pending',
        method: input.method ?? null,
        paidAt: input.paidAt,
      })
      .returning();

    if (!row) throw new Error('Failed to create payment');
    return row;
  }

  async markPaid(id: string, method: 'm_pesa' | 'e_mola') {
    const [row] = await db
      .update(payments)
      .set({
        status: 'paid',
        method,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();
    return row ?? null;
  }

  async findByReservation(reservationId: string) {
    return db.select().from(payments).where(eq(payments.reservationId, reservationId));
  }
}

export const paymentRepository = new PaymentRepository();
