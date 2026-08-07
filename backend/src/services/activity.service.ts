import { desc, eq } from 'drizzle-orm';
import { db } from '../config/database';
import { activities } from '../db/schema';

export class ActivityService {
  async log(input: {
    hostId: string;
    type:
      | 'reservation_created'
      | 'reservation_accepted'
      | 'reservation_rejected'
      | 'reservation_cancelled'
      | 'payment_received'
      | 'review_created';
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) {
    const [row] = await db
      .insert(activities)
      .values({
        hostId: input.hostId,
        type: input.type,
        title: input.title,
        description: input.description,
        metadata: input.metadata,
      })
      .returning();

    return row;
  }

  async listForHost(hostId: string, limit = 20) {
    const rows = await db
      .select()
      .from(activities)
      .where(eq(activities.hostId, hostId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}

export const activityService = new ActivityService();
