import { router } from 'expo-router';

import {
  useForgotPasswordMutation,
  useSendOtpMutation,
} from '@/hooks/useAuthMutations';
import type { ForgotPasswordInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/auth.store';
import { ForgotPasswordView } from '@/views/auth/ForgotPasswordView';

export default function ForgotPasswordScreen() {
  const setPendingIdentifier = useAuthStore((s) => s.setPendingIdentifier);
  const forgot = useForgotPasswordMutation();
  const sendOtp = useSendOtpMutation();

  function handleSubmit(data: ForgotPasswordInput) {
    setPendingIdentifier(data.identifier);
    forgot.mutate(data, {
      onSuccess: () => {
        sendOtp.mutate(
          { identifier: data.identifier },
          {
            onSettled: () => router.push('/(auth)/forgot-verify'),
          },
        );
      },
    });
  }

  return (
    <ForgotPasswordView
      onSubmit={handleSubmit}
      loading={forgot.isPending || sendOtp.isPending}
      error={
        forgot.isError || sendOtp.isError
          ? 'Não foi possível enviar o código.'
          : null
      }
    />
  );
}
