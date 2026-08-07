import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  createProperty,
  createRoom,
  getApp,
  registerHost,
  resetDatabase,
} from './helpers';

describe('Calendar (host)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('blocks, unblocks, sets price and closes room', async () => {
    const { token } = await registerHost();
    const property = await createProperty(token);
    const room = await createRoom(token, property.id);

    const month = await request(getApp())
      .get(`/api/v1/rooms/${room.id}/calendar?year=2026&month=8`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(month.body.data.calendar.days.length).toBe(31);

    await request(getApp())
      .post(`/api/v1/rooms/${room.id}/calendar/block`)
      .set('Authorization', `Bearer ${token}`)
      .send({ from: '2026-08-14', to: '2026-08-16' })
      .expect(200);

    const afterBlock = await request(getApp())
      .get(`/api/v1/rooms/${room.id}/calendar?year=2026&month=8`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const blocked = afterBlock.body.data.calendar.days.filter(
      (d: { blocked: boolean }) => d.blocked,
    );
    expect(blocked.length).toBe(3);

    await request(getApp())
      .post(`/api/v1/rooms/${room.id}/calendar/unblock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ from: '2026-08-14', to: '2026-08-14' })
      .expect(200);

    await request(getApp())
      .post(`/api/v1/rooms/${room.id}/calendar/price`)
      .set('Authorization', `Bearer ${token}`)
      .send({ from: '2026-08-20', to: '2026-08-21', amount: 4500 })
      .expect(200);

    const priced = await request(getApp())
      .get(`/api/v1/rooms/${room.id}/calendar?year=2026&month=8`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const day20 = priced.body.data.calendar.days.find(
      (d: { date: string }) => d.date === '2026-08-20',
    );
    expect(day20.priceOverride).toBe(4500);

    const closed = await request(getApp())
      .post(`/api/v1/rooms/${room.id}/calendar/close-room`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(closed.body.data.room.status).toBe('indisponivel');
  });
});
