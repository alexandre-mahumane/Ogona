import { and, eq, gte, lte } from 'drizzle-orm';
import { db } from '../config/database';
import { roomCalendarDays } from '../db/schema';
import { eachDateInclusive, formatDateOnly, toDateOnly } from '../utils/dates';

export class CalendarRepository {
  async listInRange(roomId: string, from: Date, to: Date) {
    return db
      .select()
      .from(roomCalendarDays)
      .where(
        and(
          eq(roomCalendarDays.roomId, roomId),
          gte(roomCalendarDays.date, from),
          lte(roomCalendarDays.date, to),
        ),
      );
  }

  async upsertBlocked(roomId: string, dates: Date[]) {
    for (const date of dates) {
      await db
        .insert(roomCalendarDays)
        .values({
          roomId,
          date: toDateOnly(date),
          kind: 'blocked',
          priceAmount: null,
        })
        .onConflictDoUpdate({
          target: [roomCalendarDays.roomId, roomCalendarDays.date],
          set: {
            kind: 'blocked',
            priceAmount: null,
            updatedAt: new Date(),
          },
        });
    }
  }

  async removeBlocked(roomId: string, dates: Date[]) {
    for (const date of dates) {
      await db
        .delete(roomCalendarDays)
        .where(
          and(
            eq(roomCalendarDays.roomId, roomId),
            eq(roomCalendarDays.date, toDateOnly(date)),
            eq(roomCalendarDays.kind, 'blocked'),
          ),
        );
    }
  }

  async upsertPriceOverride(roomId: string, dates: Date[], amount: string) {
    for (const date of dates) {
      await db
        .insert(roomCalendarDays)
        .values({
          roomId,
          date: toDateOnly(date),
          kind: 'price_override',
          priceAmount: amount,
          currency: 'MZN',
        })
        .onConflictDoUpdate({
          target: [roomCalendarDays.roomId, roomCalendarDays.date],
          set: {
            kind: 'price_override',
            priceAmount: amount,
            currency: 'MZN',
            updatedAt: new Date(),
          },
        });
    }
  }

  async hasBlockedInRange(roomId: string, from: Date, toExclusive: Date) {
    const days = eachDateInclusive(from, new Date(toExclusive.getTime() - 86400000));
    if (days.length === 0) return false;

    for (const day of days) {
      const [row] = await db
        .select()
        .from(roomCalendarDays)
        .where(
          and(
            eq(roomCalendarDays.roomId, roomId),
            eq(roomCalendarDays.date, toDateOnly(day)),
            eq(roomCalendarDays.kind, 'blocked'),
          ),
        )
        .limit(1);
      if (row) return true;
    }
    return false;
  }
}

export const calendarRepository = new CalendarRepository();

export function serializeCalendarDay(row: typeof roomCalendarDays.$inferSelect) {
  return {
    id: row.id,
    roomId: row.roomId,
    date: formatDateOnly(row.date instanceof Date ? row.date : new Date(row.date)),
    kind: row.kind,
    priceAmount: row.priceAmount != null ? Number(row.priceAmount) : null,
    currency: row.currency,
  };
}
