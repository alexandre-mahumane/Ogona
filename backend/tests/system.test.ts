import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { getApp } from './helpers';

describe('System: ping + swagger', () => {
  it('GET /ping returns pong', async () => {
    const res = await request(getApp()).get('/ping').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('pong');
    expect(res.body.data.timestamp).toBeTruthy();
  });

  it('GET /api/v1/health/ping returns pong', async () => {
    const res = await request(getApp()).get('/api/v1/health/ping').expect(200);
    expect(res.body.data.message).toBe('pong');
  });

  it('serves OpenAPI JSON and Swagger UI', async () => {
    const json = await request(getApp()).get('/api/docs.json').expect(200);
    expect(json.body.openapi).toBe('3.0.3');
    expect(json.body.info.title).toBe('Ogona API');
    expect(json.body.paths['/ping']).toBeTruthy();
    expect(json.body.paths['/reservations/quote']).toBeTruthy();

    const ui = await request(getApp()).get('/api/docs/').expect(200);
    expect(ui.text).toContain('Ogona API Docs');
    expect(ui.text).toContain('swagger-ui');
  });
});
