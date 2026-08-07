import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { reservations } from './reservations';
import { rooms } from './rooms';
import { users } from './users';

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reservationId: uuid('reservation_id')
      .notNull()
      .references(() => reservations.id, { onDelete: 'cascade' }),
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    guestId: uuid('guest_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    hostId: uuid('host_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('reviews_reservation_uidx').on(table.reservationId)],
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reviews.reservationId],
    references: [reservations.id],
  }),
  guest: one(users, {
    fields: [reviews.guestId],
    references: [users.id],
  }),
}));
