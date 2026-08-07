import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { redis } from '../src/config/redis';
import { guestPayload, hostPayload } from './fixtures';
import { getApp, registerGuest, registerHost, resetDatabase } from './helpers';

describe('Auth flows', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('registers guest and returns JWT', async () => {
    const { token, user } = await registerGuest();
    expect(token).toBeTruthy();
    expect(user.role).toBe('guest');
    expect(user.phone).toBe('+258841111111');
  });

  it('registers host and returns JWT', async () => {
    const { token, user } = await registerHost();
    expect(token).toBeTruthy();
    expect(user.role).toBe('host');
  });

  it('rejects duplicate phone on register', async () => {
    await registerGuest();
    const res = await request(getApp())
      .post('/api/v1/auth/register/guest')
      .send(guestPayload);
    expect(res.status).toBe(409);
  });

  it('logs in with phone and password', async () => {
    await registerHost();
    const res = await request(getApp())
      .post('/api/v1/auth/login')
      .send({ phone: hostPayload.phone, password: hostPayload.password })
      .expect(200);

    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.role).toBe('host');
  });

  it('returns me with bearer token', async () => {
    const { token } = await registerGuest();
    const res = await request(getApp())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.user.name).toBe(guestPayload.name);
    expect(res.body.data.user.photoUrl).toBeNull();
  });

  it('updates guest profile photo', async () => {
    const { token } = await registerGuest();
    const photoUrl =
      'https://media.istockphoto.com/id/1990444472/pt/foto/scandinavian-style-cozy-living-room-interior.jpg?s=612x612&w=0&k=20&c=Tz_iUbuMBRFbv2qpI1F4ERenCrfn1gvQMkHizktwRTI=';

    const updated = await request(getApp())
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ photoUrl })
      .expect(200);

    expect(updated.body.data.user.photoUrl).toBe(photoUrl);

    const me = await request(getApp())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.data.user.photoUrl).toBe(photoUrl);
  });

  it('runs forgot password OTP flow end-to-end', async () => {
    await registerGuest();

    await request(getApp())
      .post('/api/v1/auth/password/forgot')
      .send({ phone: guestPayload.phone })
      .expect(200);

    await request(getApp())
      .post('/api/v1/auth/password/send-otp')
      .send({ phone: guestPayload.phone, channel: 'sms' })
      .expect(200);

    const phone = '+258841111111';
    const raw = await redis.get(`otp:reset:${phone}`);
    expect(raw).toBeTruthy();
    const code = JSON.parse(raw!).code as string;

    const verify = await request(getApp())
      .post('/api/v1/auth/password/verify-otp')
      .send({ phone: guestPayload.phone, code })
      .expect(200);

    const resetToken = verify.body.data.resetToken as string;

    const reset = await request(getApp())
      .post('/api/v1/auth/password/reset')
      .send({
        resetToken,
        password: 'novaSenha123',
        confirmPassword: 'novaSenha123',
      })
      .expect(200);

    expect(reset.body.data.token).toBeTruthy();

    await request(getApp())
      .post('/api/v1/auth/login')
      .send({ phone: guestPayload.phone, password: 'novaSenha123' })
      .expect(200);
  });
});
