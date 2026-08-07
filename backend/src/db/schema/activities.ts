import { relations } from 'drizzle-orm';
import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { activityTypeEnum } from './enums';
import { users } from './users';

export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  hostId: uuid('host_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: activityTypeEnum('type').notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  description: varchar('description', { length: 500 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  host: one(users, {
    fields: [activities.hostId],
    references: [users.id],
  }),
}));
