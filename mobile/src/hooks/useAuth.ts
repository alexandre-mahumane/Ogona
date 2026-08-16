import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';

import { authApi } from '@/lib/api/auth';
import type { ApiUser } from '@/lib/api/types';
import {
  useAuthStore,
  type AuthUser,
} from '@/stores/auth.store';

export const authKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
};

function toAuthUser(user: ApiUser | AuthUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    email: 'email' in user ? user.email : undefined,
    photoUrl: 'photoUrl' in user ? user.photoUrl : undefined,
  };
}

/** GET /auth/me — única fonte de verdade do utilizador autenticado. */
export function useMeQuery() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  const query = useQuery({
    queryKey: authKeys.me,
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      const me = await authApi.me();
      return toAuthUser(me);
    },
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  useEffect(() => {
    if (!token || !query.isError) return;
    void clearSession();
  }, [token, query.isError, clearSession]);

  return query;
}

export function useLoginMutation() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (session) => {
      const user = toAuthUser(session.user);
      await setSession(session.token, user);
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useRegisterMutation() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (session) => {
      const user = toAuthUser(session.user);
      await setSession(session.token, user);
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useSendOtpMutation() {
  return useMutation({ mutationFn: authApi.sendOtp });
}

export function useVerifyOtpMutation() {
  return useMutation({ mutationFn: authApi.verifyOtp });
}

export function useResetPasswordMutation() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: async (session) => {
      if (!session?.token || !session.user) return;
      const user = toAuthUser(session.user);
      await setSession(session.token, user);
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (me) => {
      const user = toAuthUser(me);
      setUser(user);
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: async () => {
      await clearSession();
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: authKeys.all });
      qc.clear();
    },
  });
}
