import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { users } from './users';

export const favorites = pgTable(
  'favorites',
  {
    guestId: uuid('guest_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.guestId, table.propertyId] })],
);
