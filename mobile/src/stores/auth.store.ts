import { create } from 'zustand';

import { tokenStorage } from '@/lib/storage/secure-store';

export type UserRole = 'guest' | 'host';

export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string | null;
  photoUrl?: string | null;
};

type PendingRegister = {
  name: string;
  identifier: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  acceptTerms?: boolean;
  business?: {
    businessName: string;
    propertyType: string;
    province: string;
    city: string;
    whatsapp: string;
    altPhone: string;
  };
  wallet?: {
    provider: 'mpesa' | 'emola';
    phone: string;
  };
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  /** Token lido do SecureStore (ainda sem GET /auth/me). */
  hydrated: boolean;
  pendingIdentifier: string | null;
  pendingResetToken: string | null;
  pendingRegister: PendingRegister | null;
  setSession: (token: string, user: AuthUser) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  clearSession: () => Promise<void>;
  /** Só restaura o token — o perfil vem de `useMeQuery`. */
  hydrate: () => Promise<void>;
  setPendingIdentifier: (value: string | null) => void;
  setPendingResetToken: (value: string | null) => void;
  setPendingRegister: (value: PendingRegister | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  pendingIdentifier: null,
  pendingResetToken: null,
  pendingRegister: null,

  setSession: async (token, user) => {
    await tokenStorage.set(token);
    set({ token, user });
  },

  setUser: (user) => set({ user }),

  clearSession: async () => {
    await tokenStorage.clear();
    set({ token: null, user: null });
  },

  hydrate: async () => {
    const token = await tokenStorage.get();
    set({ token, user: null, hydrated: true });
  },

  setPendingIdentifier: (pendingIdentifier) => set({ pendingIdentifier }),
  setPendingResetToken: (pendingResetToken) => set({ pendingResetToken }),
  setPendingRegister: (pendingRegister) => set({ pendingRegister }),
}));
