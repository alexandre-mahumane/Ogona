import { env } from '../config/env';

export type WhatsAppResult = { success: boolean; error?: string };

export type WhatsAppTemplateComponent = {
  type: 'body' | 'header' | 'button';
  sub_type?: 'url' | 'copy_code' | 'quick_reply';
  index?: string;
  parameters?: Array<{
    type: 'text' | 'coupon_code';
    text?: string;
    coupon_code?: string;
  }>;
};

function toRecipient(phone: string): string {
  return phone.replace(/\D/g, '');
}

function metaErrorMessage(payload: unknown, status: number): string {
  if (payload !== null && typeof payload === 'object' && 'error' in payload) {
    const err = (payload as { error?: { message?: string; error_user_msg?: string } }).error;
    if (err?.error_user_msg) return err.error_user_msg;
    if (err?.message) return err.message;
  }
  return `Falha ao enviar WhatsApp (${status})`;
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(env.WHATSAPP_TOKEN?.trim() && env.WHATSAPP_PHONE_NUMBER_ID?.trim());
}

function messagesUrl(): string {
  return `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
}

async function postMessage(body: Record<string, unknown>): Promise<WhatsAppResult> {
  if (!isWhatsAppConfigured()) {
    return {
      success: false,
      error: 'WhatsApp não configurado (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID)',
    };
  }

  try {
    const response = await fetch(messagesUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = await response.text();
      }
      return { success: false, error: metaErrorMessage(payload, response.status) };
    }

    return { success: true };
  } catch (error) {
    console.error('[whatsapp] Meta Cloud API request failed', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao enviar WhatsApp',
    };
  }
}

/** Texto livre — só funciona na janela de 24h depois do utilizador escrever. */
export async function whatsappService(to: string, message: string): Promise<WhatsAppResult> {
  return postMessage({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toRecipient(to),
    type: 'text',
    text: { preview_url: false, body: message },
  });
}

/** Template aprovado no Meta Business — usar para OTP e mensagens iniciadas pelo negócio. */
export async function sendWhatsAppTemplate(
  to: string,
  name: string,
  language = env.WHATSAPP_OTP_TEMPLATE_LANG,
  components: WhatsAppTemplateComponent[] = [],
): Promise<WhatsAppResult> {
  return postMessage({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toRecipient(to),
    type: 'template',
    template: {
      name,
      language: { code: language },
      ...(components.length ? { components } : {}),
    },
  });
}

export async function sendWhatsAppOtp(to: string, code: string): Promise<WhatsAppResult> {
  const template = env.WHATSAPP_OTP_TEMPLATE_NAME?.trim();
  if (!template) {
    return whatsappService(to, `Ogona: o seu código é ${code}.`);
  }

  const components: WhatsAppTemplateComponent[] = [
    {
      type: 'body',
      parameters: [{ type: 'text', text: code }],
    },
  ];

  if (env.WHATSAPP_OTP_BUTTON === 'copy_code') {
    components.push({
      type: 'button',
      sub_type: 'copy_code',
      index: '0',
      parameters: [{ type: 'coupon_code', coupon_code: code }],
    });
  } else if (env.WHATSAPP_OTP_BUTTON === 'url') {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: code }],
    });
  }

  return sendWhatsAppTemplate(to, template, env.WHATSAPP_OTP_TEMPLATE_LANG, components);
}
