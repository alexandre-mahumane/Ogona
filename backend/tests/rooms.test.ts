import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { TEST_IMAGE_URL, TEST_IMAGE_URL_2 } from './fixtures';
import {
  createProperty,
  createRoom,
  getApp,
  registerHost,
  resetDatabase,
} from './helpers';

describe('Rooms (host)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates room with images, amenities and prices', async () => {
    const { token } = await registerHost();
    const property = await createProperty(token);
    const room = await createRoom(token, property.id);

    expect(room.name).toBe('Suite Deluxe');
    expect(room.images).toHaveLength(2);
    expect(room.images[0].url).toBe(TEST_IMAGE_URL);
    expect(room.images[1].url).toBe(TEST_IMAGE_URL_2);
    expect(room.amenities).toContain('wifi_gratuito');
    expect(room.prices.noite).toBe(3200);
    expect(room.modalities).toEqual(expect.arrayContaining(['hora', 'noite']));
  });

  it('lists rooms for a property and gets room by id', async () => {
    const { token } = await registerHost();
    const property = await createProperty(token);
    const room = await createRoom(token, property.id, { name: 'Standard Twin' });

    const list = await request(getApp())
      .get(`/api/v1/properties/${property.id}/rooms`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.data.rooms).toHaveLength(1);

    const detail = await request(getApp())
      .get(`/api/v1/properties/rooms/${room.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detail.body.data.room.id).toBe(room.id);
  });

  it('rejects room without matching price for modality', async () => {
    const { token } = await registerHost();
    const property = await createProperty(token);

    const res = await request(getApp())
      .post(`/api/v1/properties/${property.id}/rooms`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Quarto Incompleto',
        type: 'individual',
        description: 'Descrição válida com mais de dez caracteres.',
        maxCapacity: 1,
        modalities: ['noite', 'semana'],
        prices: { noite: 2000 },
        amenities: [],
        images: [TEST_IMAGE_URL],
      });

    expect(res.status).toBe(400);
  });
});
