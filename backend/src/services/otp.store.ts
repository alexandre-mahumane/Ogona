import { randomInt, randomUUID } from 'node:crypto';
import { env } from '../config/env';
import { redis } from '../config/redis';
import type { OtpChannel } from '../dtos/auth.dto';
import { UnauthorizedError, ValidationError } from '../utils/errors';

type OtpPayload = {
  code: string;
  channel: OtpChannel;
  attempts: number;
};

function otpKey(phone: string, purpose: 'reset' | 'register' = 'reset'): string {
  return `otp:${purpose}:${phone}`;
}

function resetTokenKey(token: string): string {
  return `reset:token:${token}`;
}

export function generateOtpCode(): string {
  return String(randomInt(0, 10_000)).padStart(4, '0');
}

export class OtpStore {
  async saveOtp(
    phone: string,
    channel: OtpChannel,
    code: string,
    purpose: 'reset' | 'register' = 'reset',
  ): Promise<void> {
    const payload: OtpPayload = { code, channel, attempts: 0 };
    await redis.set(otpKey(phone, purpose), JSON.stringify(payload), 'EX', env.OTP_TTL_SECONDS);
  }

  async getOtp(
    phone: string,
    purpose: 'reset' | 'register' = 'reset',
  ): Promise<OtpPayload | null> {
    const raw = await redis.get(otpKey(phone, purpose));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as OtpPayload;
  }

  async verifyOtp(
    phone: string,
    code: string,
    purpose: 'reset' | 'register' = 'reset',
  ): Promise<void> {
    const key = otpKey(phone, purpose);
    const payload = await this.getOtp(phone, purpose);
    if (!payload) {
      throw new UnauthorizedError('Código expirado ou inválido');
    }

    if (payload.attempts >= env.OTP_MAX_ATTEMPTS) {
      await redis.del(key);
      throw new UnauthorizedError('Demasiadas tentativas. Peça um novo código');
    }

    if (payload.code !== code) {
      payload.attempts += 1;
      const ttl = await redis.ttl(key);
      await redis.set(
        key,
        JSON.stringify(payload),
        'EX',
        ttl > 0 ? ttl : env.OTP_TTL_SECONDS,
      );
      throw new ValidationError('Código inválido');
    }

    await redis.del(key);
  }

  async createResetToken(userId: string): Promise<string> {
    const token = randomUUID();
    await redis.set(resetTokenKey(token), userId, 'EX', env.RESET_TOKEN_TTL_SECONDS);
    return token;
  }

  async consumeResetToken(token: string): Promise<string> {
    const key = resetTokenKey(token);
    const userId = await redis.get(key);
    if (!userId) {
      throw new UnauthorizedError('Sessão de redefinição inválida ou expirada');
    }
    await redis.del(key);
    return userId;
  }
}

export const otpStore = new OtpStore();
