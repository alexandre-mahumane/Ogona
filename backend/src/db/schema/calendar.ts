import { relations } from 'drizzle-orm';
import { date, numeric, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { calendarDayKindEnum } from './enums';
import { rooms } from './rooms';

export const roomCalendarDays = pgTable(
  'room_calendar_days',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    date: date('date', { mode: 'date' }).notNull(),
    kind: calendarDayKindEnum('kind').notNull(),
    priceAmount: numeric('price_amount', { precision: 12, scale: 2 }),
    currency: varchar('currency', { length: 3 }).default('MZN'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('room_calendar_days_room_date_uidx').on(table.roomId, table.date)],
);

export const roomCalendarDaysRelations = relations(roomCalendarDays, ({ one }) => ({
  room: one(rooms, {
    fields: [roomCalendarDays.roomId],
    references: [rooms.id],
  }),
}));
