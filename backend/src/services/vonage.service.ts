import { env } from '../config/env';
import { normalizePhone } from '../utils/phone';

export type VonageResult = { success: boolean; messageUuid?: string; error?: string };

export type VonageChannel = 'whatsapp' | 'sms';

function toRecipient(phone: string): string {
  return normalizePhone(phone).replace(/\D/g, '');
}

function vonageErrorMessage(payload: unknown, status: number): string {
  if (payload !== null && typeof payload === 'object') {
    const body = payload as { title?: unknown; detail?: unknown; error?: unknown };
    if (typeof body.detail === 'string' && body.detail) return body.detail;
    if (typeof body.title === 'string' && body.title) return body.title;
    if (typeof body.error === 'string' && body.error) return body.error;
  }
  return `Falha ao enviar mensagem Vonage (${status})`;
}

export function isVonageConfigured(): boolean {
  return Boolean(
    env.VONAGE_API_KEY?.trim() &&
      env.VONAGE_API_SECRET?.trim() &&
      env.VONAGE_WHATSAPP_FROM?.trim(),
  );
}

export function isVonageSmsConfigured(): boolean {
  return Boolean(env.VONAGE_API_KEY?.trim() && env.VONAGE_API_SECRET?.trim());
}

function basicAuth(): string {
  return Buffer.from(`${env.VONAGE_API_KEY}:${env.VONAGE_API_SECRET}`).toString('base64');
}

export async function sendVonageMessage(input: {
  to: string;
  text: string;
  channel?: VonageChannel;
}): Promise<VonageResult> {
  if (!isVonageConfigured()) {
    return {
      success: false,
      error: 'Vonage não configurado (VONAGE_API_KEY / VONAGE_API_SECRET / VONAGE_WHATSAPP_FROM)',
    };
  }

  const channel = input.channel ?? 'whatsapp';

  try {
    const response = await fetch(env.VONAGE_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${basicAuth()}`,
      },
      body: JSON.stringify({
        from: toRecipient(env.VONAGE_WHATSAPP_FROM),
        to: toRecipient(input.to),
        message_type: 'text',
        text: input.text,
        channel,
      }),
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      return { success: false, error: vonageErrorMessage(payload, response.status) };
    }

    const uuid =
      payload !== null &&
      typeof payload === 'object' &&
      'message_uuid' in payload &&
      typeof (payload as { message_uuid?: unknown }).message_uuid === 'string'
        ? (payload as { message_uuid: string }).message_uuid
        : undefined;

    return { success: true, messageUuid: uuid };
  } catch (error) {
    console.error('[vonage] Messages API request failed', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao enviar mensagem Vonage',
    };
  }
}

export async function sendVonageWhatsApp(to: string, text: string): Promise<VonageResult> {
  return sendVonageMessage({ to, text, channel: 'whatsapp' });
}

export async function sendVonageSms(to: string, text: string): Promise<VonageResult> {
  if (!isVonageSmsConfigured()) {
    return {
      success: false,
      error: 'Vonage SMS não configurado (VONAGE_API_KEY / VONAGE_API_SECRET)',
    };
  }

  try {
    const body = new URLSearchParams({
      api_key: env.VONAGE_API_KEY!,
      api_secret: env.VONAGE_API_SECRET!,
      to: toRecipient(to),
      from: env.VONAGE_SMS_FROM,
      text,
    });

    const response = await fetch(env.VONAGE_SMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    const message =
      payload !== null &&
      typeof payload === 'object' &&
      'messages' in payload &&
      Array.isArray((payload as { messages?: unknown }).messages)
        ? ((payload as { messages: Array<Record<string, unknown>> }).messages[0] ?? null)
        : null;

    const status = message && typeof message.status === 'string' ? message.status : null;
    if (!response.ok || status !== '0') {
      const errorText =
        message && typeof message['error-text'] === 'string'
          ? message['error-text']
          : vonageErrorMessage(payload, response.status);
      return { success: false, error: errorText };
    }

    return {
      success: true,
      messageUuid: typeof message?.['message-id'] === 'string' ? message['message-id'] : undefined,
    };
  } catch (error) {
    console.error('[vonage] SMS API request failed', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao enviar SMS Vonage',
    };
  }
}
