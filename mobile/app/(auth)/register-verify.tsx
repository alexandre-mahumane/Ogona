import { router } from 'expo-router';

import { useRegisterMutation } from '@/hooks/useAuthMutations';
import { useAuthStore } from '@/stores/auth.store';
import { VerifyOtpView } from '@/views/auth/VerifyOtpView';

export default function RegisterVerifyScreen() {
  const pendingRegister = useAuthStore((s) => s.pendingRegister);
  const pendingIdentifier = useAuthStore((s) => s.pendingIdentifier);
  const register = useRegisterMutation();

  function handleSubmit(_code: string) {
    if (!pendingRegister) {
      router.replace('/(auth)/register');
      return;
    }

    register.mutate(
      {
        name: pendingRegister.name,
        identifier: pendingRegister.identifier,
        password: pendingRegister.password,
        confirmPassword: pendingRegister.confirmPassword,
        role: pendingRegister.role,
      },
      {
        onSuccess: () => router.replace('/(auth)/register-success'),
      },
    );
  }

  return (
    <VerifyOtpView
      destination={pendingIdentifier}
      onSubmit={handleSubmit}
      loading={register.isPending}
      error={
        register.isError ? 'Código inválido. Tenta novamente.' : null
      }
    />
  );
}
