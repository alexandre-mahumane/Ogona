import { relations } from 'drizzle-orm';
import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  amenityEnum,
  bookingModalityEnum,
  roomStatusEnum,
  roomTypeEnum,
} from './enums';
import { properties } from './properties';

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 160 }).notNull(),
  type: roomTypeEnum('type').notNull(),
  status: roomStatusEnum('status').notNull().default('disponivel'),
  description: varchar('description', { length: 500 }).notNull(),
  maxCapacity: integer('max_capacity').notNull().default(1),
  bedLabel: varchar('bed_label', { length: 80 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const roomPrices = pgTable(
  'room_prices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    modality: bookingModalityEnum('modality').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('MZN'),
    minUnits: integer('min_units').notNull().default(1),
    maxUnits: integer('max_units').notNull().default(30),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('room_prices_room_modality_uidx').on(table.roomId, table.modality)],
);

export const roomAmenities = pgTable(
  'room_amenities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    amenity: amenityEnum('amenity').notNull(),
  },
  (table) => [uniqueIndex('room_amenities_room_amenity_uidx').on(table.roomId, table.amenity)],
);

export const roomImages = pgTable(
  'room_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    url: varchar('url', { length: 2048 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('room_images_room_url_uidx').on(table.roomId, table.url)],
);

export const propertiesRelations = relations(properties, ({ many }) => ({
  rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  property: one(properties, {
    fields: [rooms.propertyId],
    references: [properties.id],
  }),
  prices: many(roomPrices),
  amenities: many(roomAmenities),
  images: many(roomImages),
}));

export const roomPricesRelations = relations(roomPrices, ({ one }) => ({
  room: one(rooms, {
    fields: [roomPrices.roomId],
    references: [rooms.id],
  }),
}));

export const roomAmenitiesRelations = relations(roomAmenities, ({ one }) => ({
  room: one(rooms, {
    fields: [roomAmenities.roomId],
    references: [rooms.id],
  }),
}));

export const roomImagesRelations = relations(roomImages, ({ one }) => ({
  room: one(rooms, {
    fields: [roomImages.roomId],
    references: [rooms.id],
  }),
}));
