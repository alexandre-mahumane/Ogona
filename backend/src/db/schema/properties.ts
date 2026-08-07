import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  communityEnum,
  propertyStatusEnum,
  propertyTypeEnum,
  provinceEnum,
} from './enums';
import { users } from './users';

export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  hostId: uuid('host_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 160 }).notNull(),
  type: propertyTypeEnum('type').notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 32 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 32 }),
  coverImageUrl: varchar('cover_image_url', { length: 2048 }),

  province: provinceEnum('province').notNull(),
  city: varchar('city', { length: 120 }).notNull(),
  community: communityEnum('community'),
  neighborhood: varchar('neighborhood', { length: 120 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),

  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),

  bathrooms: integer('bathrooms').notNull().default(1),
  parkingSpots: integer('parking_spots').notNull().default(0),
  houseRules: jsonb('house_rules').$type<string[]>().default([]),

  status: propertyStatusEnum('status').notNull().default('draft'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
