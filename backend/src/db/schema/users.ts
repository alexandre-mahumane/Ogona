import { date, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 32 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  photoUrl: varchar('photo_url', { length: 2048 }),
  birthDate: date('birth_date', { mode: 'date' }).notNull(),
  role: userRoleEnum('role').notNull().default('guest'),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
