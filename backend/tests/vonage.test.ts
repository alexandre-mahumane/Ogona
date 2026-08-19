import { afterEach, describe, expect, it, vi } from 'vitest';

const originalFetch = globalThis.fetch;

describe('Vonage Messages API', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('posts a WhatsApp text message with basic auth', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message_uuid: 'abc-123' }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { sendVonageWhatsApp } = await import('../src/services/vonage.service');
    const result = await sendVonageWhatsApp('+258845290817', 'Ogona: o seu código é 1234.');

    expect(result.success).toBe(true);
    expect(result.messageUuid).toBe('abc-123');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://messages-sandbox.nexmo.com/v1/messages');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toMatch(/^Basic /);

    const body = JSON.parse(String(init.body));
    expect(body).toEqual({
      from: '14157386102',
      to: '258845290817',
      message_type: 'text',
      text: 'Ogona: o seu código é 1234.',
      channel: 'whatsapp',
    });
  });

  it('returns the Vonage error detail when the request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ title: 'Unauthorized', detail: 'Invalid credentials' }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { sendVonageWhatsApp } = await import('../src/services/vonage.service');
    const result = await sendVonageWhatsApp('258845290817', 'teste');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  it('posts an SMS via the Vonage REST API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        'message-count': '1',
        messages: [{ to: '258845290817', 'message-id': 'sms-1', status: '0' }],
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { sendVonageSms } = await import('../src/services/vonage.service');
    const result = await sendVonageSms('845290817', 'Ogona: teste SMS.');

    expect(result.success).toBe(true);
    expect(result.messageUuid).toBe('sms-1');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://rest.nexmo.com/sms/json');
    const body = new URLSearchParams(String(init.body));
    expect(body.get('to')).toBe('258845290817');
    expect(body.get('from')).toBe('Ogona');
    expect(body.get('text')).toBe('Ogona: teste SMS.');
  });
});
