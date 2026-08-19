import { env } from '../config/env';
import { normalizePhone } from '../utils/phone';

const PAVULLA_MESSAGES_URL = 'https://api.ola.pavulla.com/v1/messages';

export type SmsResult = { success: boolean; error?: string };

function toRecipient(phone: string): string {
  return normalizePhone(phone).replace(/\D/g, '');
}

/** Pavulla aceita `Bearer <api-key>`. `Basic <api-key>` em texto falha com 401. */
function pavullaAuthHeader(): string {
  const raw = env.PAVULLA_API_KEY?.trim() ?? '';
  if (/^(bearer|basic)\s+/i.test(raw)) {
    const [scheme, ...rest] = raw.split(/\s+/);
    const token = rest.join(' ').trim();
    if (scheme.toLowerCase() === 'bearer') {
      return `Bearer ${token}`;
    }
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      if (decoded.includes(':')) {
        return `Basic ${token}`;
      }
    } catch {
      // raw api key after Basic
    }
    return `Bearer ${token}`;
  }

  return `Bearer ${raw}`;
}

function pavullaErrorMessage(payload: unknown, status: number): string {
  if (payload !== null && typeof payload === 'object') {
    const body = payload as { message?: unknown; error?: unknown };
    if (typeof body.message === 'string' && body.message) return body.message;
    if (typeof body.error === 'string' && body.error) return body.error;
  }
  return `Falha ao enviar SMS (${status})`;
}

export function isSmsConfigured(): boolean {
  return Boolean(env.PAVULLA_API_KEY && env.SMS_PROVIDER_ID);
}

/** Helper Pavulla — importar sempre que for preciso enviar SMS. */
export async function smsService(to: string, message: string): Promise<SmsResult> {
  if (!isSmsConfigured()) {
    return { success: false, error: 'SMS não configurado (PAVULLA_API_KEY / SMS_PROVIDER_ID)' };
  }

  const recipient = toRecipient(to);
  console.info('[otp] pavulla.request', {
    recipient,
    sender: env.PAVULLA_SMS_SENDER.trim() || null,
    providerId: env.SMS_PROVIDER_ID,
  });

  try {
    const response = await fetch(PAVULLA_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: pavullaAuthHeader(),
      },
      body: JSON.stringify({
        ...(env.PAVULLA_SMS_SENDER.trim() ? { sender: env.PAVULLA_SMS_SENDER.trim() } : {}),
        recipient,
        content: message,
        provider_id: env.SMS_PROVIDER_ID,
      }),
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = await response.text();
    }

    console.info('[otp] pavulla.response', {
      recipient,
      status: response.status,
      ok: response.ok,
      payload,
    });

    if (!response.ok) {
      return { success: false, error: pavullaErrorMessage(payload, response.status) };
    }

    return { success: true };
  } catch (error) {
    console.error('[otp] pavulla.failed', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao enviar SMS',
    };
  }
}
