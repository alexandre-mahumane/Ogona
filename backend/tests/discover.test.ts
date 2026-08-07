import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { TEST_IMAGE_URL } from './fixtures';
import {
  createProperty,
  createRoom,
  getApp,
  publishProperty,
  registerGuest,
  registerHost,
  resetDatabase,
} from './helpers';

describe('Guest discover + reviews + favorites', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  async function seedPublished() {
    const host = await registerHost();
    const guest = await registerGuest();
    const property = await createProperty(host.token, {
      bathrooms: 3,
      parkingSpots: 2,
      houseRules: ['Proibido fumar', 'Check-in a partir das 14:00'],
    });
    await publishProperty(host.token, property.id);
    const room = await createRoom(host.token, property.id);
    return { host, guest, property, room };
  }

  it('lists home feed, cities and filters properties', async () => {
    const { property } = await seedPublished();

    const home = await request(getApp())
      .get('/api/v1/discover/home?lat=-25.96&lng=32.58')
      .expect(200);

    expect(home.body.data.nearYou.length).toBeGreaterThanOrEqual(1);
    expect(home.body.data.mostBooked.length).toBeGreaterThanOrEqual(1);
    expect(home.body.data.cities[0].city).toBe('Maputo');

    const popular = await request(getApp())
      .get('/api/v1/discover/popular-destinations')
      .expect(200);

    expect(popular.body.data.destinations).toHaveLength(6);
    expect(popular.body.data.destinations[0].name).toBe('Maputo');
    expect(popular.body.data.destinations[0].propertiesCount).toBeGreaterThanOrEqual(1);

    const byType = await request(getApp())
      .get('/api/v1/discover/properties?type=pensao')
      .expect(200);
    expect(byType.body.data.properties.some((p: { id: string }) => p.id === property.id)).toBe(
      true,
    );

    const byPrice = await request(getApp())
      .get('/api/v1/discover/properties?minPrice=1000&maxPrice=5000')
      .expect(200);
    expect(byPrice.body.data.properties.length).toBeGreaterThanOrEqual(1);

    const byRooms = await request(getApp())
      .get('/api/v1/discover/properties?minRooms=1&minBathrooms=2&minParking=2')
      .expect(200);
    expect(byRooms.body.data.properties.length).toBeGreaterThanOrEqual(1);

    const search = await request(getApp())
      .get('/api/v1/discover/properties?q=Polana')
      .expect(200);
    expect(search.body.data.properties.length).toBeGreaterThanOrEqual(1);
  });

  it('gets property and room by id publicly', async () => {
    const { property, room } = await seedPublished();

    const detail = await request(getApp())
      .get(`/api/v1/discover/properties/${property.id}`)
      .expect(200);

    expect(detail.body.data.property.name).toContain('Pensão');
    expect(detail.body.data.property.rooms.length).toBe(1);
    expect(detail.body.data.property.houseRules).toContain('Proibido fumar');
    expect(detail.body.data.property.images[0]).toBe(TEST_IMAGE_URL);
    expect(detail.body.data.property.rating.total).toBe(0);

    const roomDetail = await request(getApp())
      .get(`/api/v1/discover/rooms/${room.id}`)
      .expect(200);

    expect(roomDetail.body.data.room.id).toBe(room.id);
    expect(roomDetail.body.data.room.property.id).toBe(property.id);
  });

  it('supports favorites and review summary/list', async () => {
    const { host, guest, property, room } = await seedPublished();

    await request(getApp())
      .post(`/api/v1/discover/favorites/${property.id}`)
      .set('Authorization', `Bearer ${guest.token}`)
      .expect(201);

    const favs = await request(getApp())
      .get('/api/v1/discover/favorites')
      .set('Authorization', `Bearer ${guest.token}`)
      .expect(200);
    expect(favs.body.data.properties).toHaveLength(1);
    expect(favs.body.data.properties[0].isFavorite).toBe(true);

    const reservation = await request(getApp())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        roomId: room.id,
        modality: 'noite',
        checkInDate: '2026-08-01',
        units: 2,
        guestCount: 1,
      })
      .expect(201);

    const reservationId = reservation.body.data.reservation.id as string;

    await request(getApp())
      .post(`/api/v1/reservations/${reservationId}/accept`)
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);

    await request(getApp())
      .post(`/api/v1/reservations/${reservationId}/pay`)
      .set('Authorization', `Bearer ${guest.token}`)
      .send({ method: 'm_pesa' })
      .expect(200);

    await request(getApp())
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({
        reservationId,
        rating: 5,
        comment: 'Excelente localização e limpeza.',
      })
      .expect(201);

    const reviews = await request(getApp())
      .get(`/api/v1/discover/properties/${property.id}/reviews`)
      .expect(200);

    expect(reviews.body.data.summary.total).toBe(1);
    expect(reviews.body.data.summary.average).toBe(5);
    expect(reviews.body.data.summary.breakdown[5]).toBe(1);
    expect(reviews.body.data.reviews[0].guestName).toBe('Maria Sitoe');
    expect(reviews.body.data.reviews[0].verified).toBe(true);

    const filtered = await request(getApp())
      .get(`/api/v1/discover/properties/${property.id}/reviews?rating=5`)
      .expect(200);
    expect(filtered.body.data.reviews).toHaveLength(1);

    const card = await request(getApp())
      .get(`/api/v1/discover/properties/${property.id}`)
      .set('Authorization', `Bearer ${guest.token}`)
      .expect(200);
    expect(card.body.data.property.rating.average).toBe(5);
    expect(card.body.data.property.isFavorite).toBe(true);

    await request(getApp())
      .delete(`/api/v1/discover/favorites/${property.id}`)
      .set('Authorization', `Bearer ${guest.token}`)
      .expect(200);
  });

  it('hides unpublished properties from discover', async () => {
    const host = await registerHost();
    const draft = await createProperty(host.token);

    await request(getApp())
      .get(`/api/v1/discover/properties/${draft.id}`)
      .expect(404);
  });
});
