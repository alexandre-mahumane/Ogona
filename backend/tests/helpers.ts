import type { Express } from 'express';
import request from 'supertest';
import { sql } from 'drizzle-orm';
import { createApp } from '../src/app';
import { db, pool } from '../src/config/database';
import { redis } from '../src/config/redis';
import {
  guestPayload,
  hostPayload,
  propertyPayload,
  roomPayload,
} from './fixtures';

let app: Express;

export function getApp(): Express {
  if (!app) {
    app = createApp();
  }
  return app;
}

export async function resetDatabase(): Promise<void> {
  await db.execute(sql`
    TRUNCATE TABLE
      favorites,
      activities,
      reviews,
      payments,
      reservations,
      room_calendar_days,
      room_amenities,
      room_images,
      room_prices,
      rooms,
      properties,
      users
    RESTART IDENTITY CASCADE
  `);

  try {
    await redis.flushdb();
  } catch {
  }
}

export async function closeTestResources(): Promise<void> {
  await pool.end();
  redis.disconnect();
}

export async function registerHost(overrides?: Partial<typeof hostPayload>) {
  const res = await request(getApp())
    .post('/api/v1/auth/register/host')
    .send({ ...hostPayload, ...overrides })
    .expect(201);

  return {
    token: res.body.data.token as string,
    user: res.body.data.user,
  };
}

export async function registerGuest(overrides?: Partial<typeof guestPayload>) {
  const res = await request(getApp())
    .post('/api/v1/auth/register/guest')
    .send({ ...guestPayload, ...overrides })
    .expect(201);

  return {
    token: res.body.data.token as string,
    user: res.body.data.user,
  };
}

export async function createProperty(token: string, overrides?: Record<string, unknown>) {
  const res = await request(getApp())
    .post('/api/v1/properties')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...propertyPayload, ...overrides })
    .expect(201);

  return res.body.data.property;
}

export async function createRoom(
  token: string,
  propertyId: string,
  overrides?: Record<string, unknown>,
) {
  const res = await request(getApp())
    .post(`/api/v1/properties/${propertyId}/rooms`)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...roomPayload, ...overrides })
    .expect(201);

  return res.body.data.room;
}

export async function publishProperty(token: string, propertyId: string) {
  const res = await request(getApp())
    .patch(`/api/v1/properties/${propertyId}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'published' })
    .expect(200);

  return res.body.data.property;
}
