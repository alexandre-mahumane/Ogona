import { router } from 'expo-router';

import { useResetPasswordMutation } from '@/hooks/useAuthMutations';
import type { ResetPasswordInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/auth.store';
import { ResetPasswordView } from '@/views/auth/ResetPasswordView';

export default function ResetPasswordScreen() {
  const resetToken = useAuthStore((s) => s.pendingResetToken);
  const reset = useResetPasswordMutation();

  function handleSubmit(data: ResetPasswordInput) {
    if (!resetToken) {
      router.replace('/(auth)/forgot-password');
      return;
    }

    reset.mutate(
      {
        resetToken,
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => router.replace('/(auth)/reset-success'),
      },
    );
  }

  return (
    <ResetPasswordView
      onSubmit={handleSubmit}
      loading={reset.isPending}
      error={reset.isError ? 'Não foi possível atualizar a senha.' : null}
    />
  );
}
