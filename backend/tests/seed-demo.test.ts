import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { seedDemoData } from '../src/db/seed-demo';
import { getApp, resetDatabase } from './helpers';

/**
 * Integration fixture: garante dados demo utilizáveis pelo mobile
 * (hóspede + anfitrião + propriedades publicadas + reserva + favorito).
 */
describe('Demo seed data for mobile', () => {
  beforeAll(async () => {
    await resetDatabase();
    await seedDemoData();
  });

  it('seeds discoverable properties for guest feed', async () => {
    const home = await request(getApp()).get('/api/v1/discover/home').expect(200);

    expect(home.body.data.nearYou.length).toBeGreaterThanOrEqual(1);
    expect(home.body.data.mostBooked.length).toBeGreaterThanOrEqual(1);
    expect(home.body.data.cities.some((c: { city: string }) => c.city === 'Maputo')).toBe(
      true,
    );
    expect(home.body.data.cities.some((c: { city: string }) => c.city === 'Beira')).toBe(
      true,
    );
  });

  it('allows guest and host login with fixture credentials', async () => {
    const guestLogin = await request(getApp())
      .post('/api/v1/auth/login')
      .send({ phone: '841111111', password: 'senha12345' })
      .expect(200);

    expect(guestLogin.body.data.user.role).toBe('guest');
    expect(guestLogin.body.data.token).toBeTruthy();

    const hostLogin = await request(getApp())
      .post('/api/v1/auth/login')
      .send({ phone: '842222222', password: 'senha12345' })
      .expect(200);

    expect(hostLogin.body.data.user.role).toBe('host');
    expect(hostLogin.body.data.token).toBeTruthy();
  });

  it('exposes guest favorites and pending reservation', async () => {
    const guestLogin = await request(getApp())
      .post('/api/v1/auth/login')
      .send({ phone: '841111111', password: 'senha12345' })
      .expect(200);

    const token = guestLogin.body.data.token as string;

    const favorites = await request(getApp())
      .get('/api/v1/discover/favorites')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(favorites.body.data.properties.length).toBeGreaterThanOrEqual(1);

    const reservations = await request(getApp())
      .get('/api/v1/reservations/mine')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(reservations.body.data.reservations.length).toBeGreaterThanOrEqual(1);
    expect(reservations.body.data.reservations[0].status).toBe('pending');
  });

  it('exposes host dashboard metrics and property list', async () => {
    const hostLogin = await request(getApp())
      .post('/api/v1/auth/login')
      .send({ phone: '842222222', password: 'senha12345' })
      .expect(200);

    const token = hostLogin.body.data.token as string;

    const dashboard = await request(getApp())
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(dashboard.body.data.dashboard.metrics.rooms).toBeGreaterThanOrEqual(1);
    expect(dashboard.body.data.dashboard.pendingRequests.length).toBeGreaterThanOrEqual(1);

    const properties = await request(getApp())
      .get('/api/v1/properties')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(properties.body.data.properties.length).toBeGreaterThanOrEqual(2);
  });
});
