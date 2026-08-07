import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  createProperty,
  createRoom,
  getApp,
  publishProperty,
  registerGuest,
  registerHost,
  resetDatabase,
} from './helpers';

describe('Dashboard (host)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns metrics, pending requests and recent activity', async () => {
    const host = await registerHost();
    const guest = await registerGuest();
    const property = await createProperty(host.token);
    await publishProperty(host.token, property.id);
    const room = await createRoom(host.token, property.id);

    await request(getApp())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-07-28',
        units: 3,
        guestCount: 2,
      })
      .expect(201);

    const res = await request(getApp())
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);

    const dashboard = res.body.data.dashboard;
    expect(dashboard.metrics.pendingReservations).toBe(1);
    expect(dashboard.metrics.rooms).toBe(1);
    expect(dashboard.quickStats.activeProperties).toBe(1);
    expect(dashboard.pendingRequests).toHaveLength(1);
    expect(dashboard.recentActivity.length).toBeGreaterThanOrEqual(1);
    expect(dashboard.recentActivity[0].type).toBe('reservation_created');
  });
});
