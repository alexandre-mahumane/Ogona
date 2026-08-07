import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { TEST_IMAGE_URL, propertyPayload } from './fixtures';
import {
  createProperty,
  getApp,
  registerGuest,
  registerHost,
  resetDatabase,
} from './helpers';

describe('Properties (host)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates property with cover image URL', async () => {
    const { token } = await registerHost();
    const property = await createProperty(token);

    expect(property.name).toBe(propertyPayload.name);
    expect(property.coverImageUrl).toBe(TEST_IMAGE_URL);
    expect(property.status).toBe('draft');
    expect(property.location.community).toBe('polana');
  });

  it('blocks guests from creating properties', async () => {
    const { token } = await registerGuest();
    const res = await request(getApp())
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${token}`)
      .send(propertyPayload);

    expect(res.status).toBe(403);
  });

  it('filters properties by status and search', async () => {
    const { token } = await registerHost();

    const draft = await createProperty(token, { name: 'Pensão Rascunho Azul' });
    const published = await createProperty(token, {
      name: 'Hotel Polana View',
      type: 'hotel',
    });
    const hidden = await createProperty(token, { name: 'Casa Oculta Costa' });

    await request(getApp())
      .patch(`/api/v1/properties/${published.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'published' })
      .expect(200);

    await request(getApp())
      .patch(`/api/v1/properties/${hidden.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'hidden' })
      .expect(200);

    const all = await request(getApp())
      .get('/api/v1/properties?status=all')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(all.body.data.properties).toHaveLength(3);

    const onlyPublished = await request(getApp())
      .get('/api/v1/properties?status=published')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(onlyPublished.body.data.properties).toHaveLength(1);
    expect(onlyPublished.body.data.properties[0].id).toBe(published.id);

    const onlyDraft = await request(getApp())
      .get('/api/v1/properties?status=draft')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(onlyDraft.body.data.properties.map((p: { id: string }) => p.id)).toContain(
      draft.id,
    );

    const onlyHidden = await request(getApp())
      .get('/api/v1/properties?status=hidden')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(onlyHidden.body.data.properties[0].id).toBe(hidden.id);

    const search = await request(getApp())
      .get('/api/v1/properties?search=Polana')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(search.body.data.properties).toHaveLength(1);
    expect(search.body.data.properties[0].name).toContain('Polana');
  });

  it('updates, gets detail with stats, and deletes property', async () => {
    const { token } = await registerHost();
    const property = await createProperty(token);

    const updated = await request(getApp())
      .patch(`/api/v1/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Pensão Maputo Updated', coverImageUrl: TEST_IMAGE_URL })
      .expect(200);

    expect(updated.body.data.property.name).toBe('Pensão Maputo Updated');

    const detail = await request(getApp())
      .get(`/api/v1/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detail.body.data.property.stats.rooms).toBe(0);
    expect(detail.body.data.property.stats.reservations).toBe(0);

    await request(getApp())
      .delete(`/api/v1/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(getApp())
      .get(`/api/v1/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('returns catalogs with enums', async () => {
    const { token } = await registerHost();
    const res = await request(getApp())
      .get('/api/v1/properties/catalogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.provinces.length).toBeGreaterThan(5);
    expect(res.body.data.communities).toContain('polana');
    expect(res.body.data.propertyStatuses).toContain('under_review');
    expect(res.body.data.roomTypes).toContain('casal');
  });
});
