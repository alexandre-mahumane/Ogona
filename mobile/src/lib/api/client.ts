import { tokenStorage } from '@/lib/storage/secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://mobilesmsser.qzz.io/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

type SuccessEnvelope<T> = { success: true; data: T };
type ErrorEnvelope = {
  success: false;
  error?: { message?: string; code?: string; details?: unknown };
  message?: string;
};

function unwrapData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as SuccessEnvelope<T>).success === true &&
    'data' in payload
  ) {
    return (payload as SuccessEnvelope<T>).data;
  }
  return payload as T;
}

function validationDetails(details: unknown): string | undefined {
  if (!details || typeof details !== 'object') return undefined;
  const body = details as {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
  const fields = body.fieldErrors
    ? Object.entries(body.fieldErrors).flatMap(([field, messages]) =>
        (messages ?? []).map((message) => `${field}: ${message}`),
      )
    : [];
  return [...(body.formErrors ?? []), ...fields].find(Boolean);
}

function errorMessage(payload: unknown, status: number): { message: string; code?: string } {
  if (payload !== null && typeof payload === 'object') {
    const body = payload as ErrorEnvelope;
    if (body.error?.message) {
      const detail = validationDetails(body.error.details);
      return {
        message: detail ?? body.error.message,
        code: body.error.code,
      };
    }
    if (typeof body.message === 'string') {
      return { message: body.message };
    }
  }
  return { message: `Request failed (${status})` };
}

export async function apiClient<T>(
  path: string,
  { body, auth = true, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = await tokenStorage.get();
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const { message, code } = errorMessage(payload, response.status);
    throw new ApiError(message, response.status, payload, code);
  }

  return unwrapData<T>(payload);
}

export function toQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
