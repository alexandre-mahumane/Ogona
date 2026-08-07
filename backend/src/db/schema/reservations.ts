import { relations } from 'drizzle-orm';
import {
  date,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  bookingModalityEnum,
  paymentMethodEnum,
  reservationStatusEnum,
} from './enums';
import { properties } from './properties';
import { rooms } from './rooms';
import { users } from './users';

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
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

  modality: bookingModalityEnum('modality').notNull(),
  checkInDate: date('check_in_date', { mode: 'date' }).notNull(),
  checkOutDate: date('check_out_date', { mode: 'date' }).notNull(),
  startTime: varchar('start_time', { length: 5 }),
  units: integer('units').notNull().default(1),
  guestCount: integer('guest_count').notNull().default(1),

  status: reservationStatusEnum('status').notNull().default('pending'),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  subtotalAmount: numeric('subtotal_amount', { precision: 12, scale: 2 }).notNull(),
  feePercent: numeric('fee_percent', { precision: 5, scale: 2 }).notNull().default('3.30'),
  feeAmount: numeric('fee_amount', { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('MZN'),

  paymentMethod: paymentMethodEnum('payment_method'),
  paymentExpiresAt: timestamp('payment_expires_at', { withTimezone: true }),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reservationsRelations = relations(reservations, ({ one }) => ({
  property: one(properties, {
    fields: [reservations.propertyId],
    references: [properties.id],
  }),
  room: one(rooms, {
    fields: [reservations.roomId],
    references: [rooms.id],
  }),
  guest: one(users, {
    fields: [reservations.guestId],
    references: [users.id],
  }),
  host: one(users, {
    fields: [reservations.hostId],
    references: [users.id],
  }),
}));
