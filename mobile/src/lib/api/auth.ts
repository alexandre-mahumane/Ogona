import { apiClient } from '@/lib/api/client';
import type { ApiUser, AuthRole } from '@/lib/api/types';
import { toPhone } from '@/schemas/auth.schema';

export type AuthSession = {
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    role: AuthRole;
    email?: string | null;
    photoUrl?: string | null;
  };
};

type LoginPayload = { identifier: string; password: string };
type RegisterPayload = {
  name: string;
  identifier: string;
  password: string;
  confirmPassword: string;
  role: AuthRole;
  birthDate: string;
};
type ForgotPayload = { identifier: string };
type SendOtpPayload = { identifier: string; channel?: 'sms' | 'whatsapp' };
type VerifyOtpPayload = { identifier: string; code: string };
type ResetPayload = {
  resetToken: string;
  password: string;
  confirmPassword: string;
};
type UpdateProfilePayload = {
  name?: string;
  email?: string | null;
  photoUrl?: string | null;
};

function toSession(data: { token: string; user: ApiUser }): AuthSession {
  return {
    token: data.token,
    user: {
      id: data.user.id,
      name: data.user.name,
      phone: data.user.phone,
      role: data.user.role,
      email: data.user.email,
      photoUrl: data.user.photoUrl,
    },
  };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    console.log('login', payload);
    const data = await apiClient<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      auth: false,
      body: {
        phone: toPhone(payload.identifier),
        password: payload.password,
      },
    });
    console.log('login data', data);
    return toSession(data);
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    const path =
      payload.role === 'host' ? '/auth/register/host' : '/auth/register/guest';
    const data = await apiClient<{ token: string; user: ApiUser }>(path, {
      method: 'POST',
      auth: false,
      body: {
        name: payload.name,
        phone: toPhone(payload.identifier),
        password: payload.password,
        confirmPassword: payload.confirmPassword,
        birthDate: payload.birthDate,
      },
    });
    return toSession(data);
  },

  async me(): Promise<ApiUser> {
    const data = await apiClient<{ user: ApiUser }>('/auth/me');
    return data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiUser> {
    const data = await apiClient<{ user: ApiUser }>('/auth/me', {
      method: 'PATCH',
      body: payload,
    });
    return data.user;
  },

  async forgotPassword(payload: ForgotPayload) {
    return apiClient<{ phone: string; maskedPhone: string }>('/auth/password/forgot', {
      method: 'POST',
      auth: false,
      body: { phone: toPhone(payload.identifier) },
    });
  },

  async sendOtp(payload: SendOtpPayload) {
    return apiClient<{ phone: string; channel: string; expiresInSeconds: number }>(
      '/auth/password/send-otp',
      {
        method: 'POST',
        auth: false,
        body: {
          phone: toPhone(payload.identifier),
          channel: payload.channel ?? 'sms',
        },
      },
    );
  },

  async sendRegisterOtp(payload: SendOtpPayload) {
    return apiClient<{ phone: string; channel: string; expiresInSeconds: number }>(
      '/auth/register/send-otp',
      {
        method: 'POST',
        auth: false,
        body: {
          phone: toPhone(payload.identifier),
          channel: payload.channel ?? 'sms',
        },
      },
    );
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    return apiClient<{ resetToken: string }>('/auth/password/verify-otp', {
      method: 'POST',
      auth: false,
      body: {
        phone: toPhone(payload.identifier),
        code: payload.code,
      },
    });
  },

  async verifyRegisterOtp(payload: VerifyOtpPayload) {
    return apiClient<{ verified: boolean }>('/auth/register/verify-otp', {
      method: 'POST',
      auth: false,
      body: {
        phone: toPhone(payload.identifier),
        code: payload.code,
      },
    });
  },

  async resetPassword(payload: ResetPayload): Promise<AuthSession> {
    const data = await apiClient<{ token: string; user: ApiUser }>('/auth/password/reset', {
      method: 'POST',
      auth: false,
      body: payload,
    });
    return toSession(data);
  },
};
