import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { reviews } from '../db/schema';

export class ReviewRepository {
  async create(input: {
    reservationId: string;
    propertyId: string;
    roomId: string;
    guestId: string;
    hostId: string;
    rating: number;
    comment?: string;
  }) {
    const [row] = await db
      .insert(reviews)
      .values({
        reservationId: input.reservationId,
        propertyId: input.propertyId,
        roomId: input.roomId,
        guestId: input.guestId,
        hostId: input.hostId,
        rating: input.rating,
        comment: input.comment,
      })
      .returning();

    if (!row) throw new Error('Failed to create review');
    return row;
  }

  async findByReservation(reservationId: string) {
    const [row] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.reservationId, reservationId))
      .limit(1);
    return row ?? null;
  }
}

export const reviewRepository = new ReviewRepository();
