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

describe('Reservations + reviews', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  async function seedPublishedListing() {
    const host = await registerHost();
    const guest = await registerGuest();
    const property = await createProperty(host.token);
    await publishProperty(host.token, property.id);
    const room = await createRoom(host.token, property.id);
    return { host, guest, property, room };
  }

  it('guest quotes and creates reservation with Ogona fee', async () => {
    const { host, guest, room } = await seedPublishedListing();

    const quote = await request(getApp())
      .post('/api/v1/reservations/quote')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-07-28',
        units: 3,
        guestCount: 2,
      })
      .expect(200);

    expect(quote.body.data.quote.subtotalAmount).toBe(9600);
    expect(quote.body.data.quote.feeAmount).toBe(317);
    expect(quote.body.data.quote.totalAmount).toBe(9917);

    const created = await request(getApp())
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

    expect(created.body.data.reservation.status).toBe('pending');
    expect(created.body.data.reservation.displayStatus).toBe('pending');
    expect(created.body.data.reservation.totalAmount).toBe(9917);
    expect(created.body.data.reservation.checkOutDate).toBe('2026-07-31');

    const pending = await request(getApp())
      .get('/api/v1/reservations?status=pending')
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);
    expect(pending.body.data.reservations).toHaveLength(1);

    const mine = await request(getApp())
      .get('/api/v1/reservations/mine?status=pending')
      .set('Authorization', `Bearer ${guest.token}`)
      .expect(200);
    expect(mine.body.data.reservations).toHaveLength(1);
  });

  it('host accepts → awaiting_payment, guest pays with M-Pesa', async () => {
    const { host, guest, room } = await seedPublishedListing();

    const created = await request(getApp())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-08-10',
        units: 2,
        guestCount: 1,
      })
      .expect(201);

    const id = created.body.data.reservation.id as string;

    const accepted = await request(getApp())
      .post(`/api/v1/reservations/${id}/accept`)
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);

    expect(accepted.body.data.reservation.status).toBe('awaiting_payment');
    expect(accepted.body.data.reservation.expiresInSeconds).toBeGreaterThan(0);

    const awaiting = await request(getApp())
      .get('/api/v1/reservations/mine?status=awaiting_payment')
      .set('Authorization', `Bearer ${guest.token}`)
      .expect(200);
    expect(awaiting.body.data.reservations).toHaveLength(1);

    const paid = await request(getApp())
      .post(`/api/v1/reservations/${id}/pay`)
      .set('Authorization', `Bearer ${guest.token}`)
      .send({ method: 'm_pesa' })
      .expect(200);

    expect(paid.body.data.reservation.status).toBe('confirmed');
    expect(paid.body.data.reservation.paymentMethod).toBe('m_pesa');

    const confirmed = await request(getApp())
      .get('/api/v1/reservations?status=confirmed')
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);
    expect(confirmed.body.data.reservations).toHaveLength(1);
  });

  it('host rejects pending reservation', async () => {
    const { host, guest, room } = await seedPublishedListing();

    const created = await request(getApp())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'hora',
        checkInDate: '2026-09-01',
        startTime: '09:00',
        units: 3,
        guestCount: 1,
      })
      .expect(201);

    const id = created.body.data.reservation.id as string;

    await request(getApp())
      .post(`/api/v1/reservations/${id}/reject`)
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);

    const rejected = await request(getApp())
      .get('/api/v1/reservations?status=rejected')
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);
    expect(rejected.body.data.reservations).toHaveLength(1);
  });

  it('guest cancels and can leave a review after pay', async () => {
    const { host, guest, room } = await seedPublishedListing();

    const created = await request(getApp())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-10-01',
        units: 2,
        guestCount: 2,
      })
      .expect(201);

    const id = created.body.data.reservation.id as string;

    await request(getApp())
      .post(`/api/v1/reservations/${id}/accept`)
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);

    await request(getApp())
      .post(`/api/v1/reservations/${id}/pay`)
      .set('Authorization', `Bearer ${guest.token}`)
      .send({ method: 'e_mola' })
      .expect(200);

    const review = await request(getApp())
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({ reservationId: id, rating: 4, comment: 'Excelente estadia' })
      .expect(201);

    expect(review.body.data.review.rating).toBe(4);

    const cancelable = await request(getApp())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-11-01',
        units: 1,
        guestCount: 1,
      })
      .expect(201);

    await request(getApp())
      .post(`/api/v1/reservations/${cancelable.body.data.reservation.id}/cancel`)
      .set('Authorization', `Bearer ${guest.token}`)
      .expect(200);
  });

  it('blocks overlapping reservations', async () => {
    const { guest, room } = await seedPublishedListing();

    await request(getApp())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-12-01',
        units: 4,
        guestCount: 1,
      })
      .expect(201);

    const overlap = await request(getApp())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-12-03',
        units: 3,
        guestCount: 1,
      });

    expect(overlap.status).toBe(409);
    expect(overlap.body.error.details.unavailableDates).toEqual(
      expect.arrayContaining(['2026-12-03', '2026-12-04']),
    );

    const quote = await request(getApp())
      .post('/api/v1/reservations/quote')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-12-03',
        units: 3,
        guestCount: 1,
      });

    expect(quote.status).toBe(409);
    expect(quote.body.error.details.unavailableDates.length).toBeGreaterThan(0);
  });
});
