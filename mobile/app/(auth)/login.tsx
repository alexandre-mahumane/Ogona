import { router } from 'expo-router';

import { useLoginMutation } from '@/hooks/useAuthMutations';
import type { LoginInput } from '@/schemas/auth.schema';
import { LoginView } from '@/views/auth/LoginView';

export default function LoginScreen() {
  const login = useLoginMutation();

  function handleSubmit(data: LoginInput) {
    login.mutate(data, {
      onSuccess: (session) => {
        router.replace(session.user.role === 'host' ? '/(host)/(tabs)' : '/(guest)/(tabs)');
      },
    });
  }

  return (
    <LoginView
      onSubmit={handleSubmit}
      loading={login.isPending}
      error={
        login.isError
          ? login.error instanceof Error
            ? login.error.message
            : 'Não foi possível entrar. Tenta novamente.'
          : null
      }
    />
  );
}
