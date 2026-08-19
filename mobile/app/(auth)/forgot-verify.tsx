import { router } from 'expo-router';

import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '@/hooks/useAuthMutations';
import { useAuthStore } from '@/stores/auth.store';
import { VerifyOtpView } from '@/views/auth/VerifyOtpView';

export default function ForgotVerifyScreen() {
  const pendingIdentifier = useAuthStore((s) => s.pendingIdentifier);
  const setPendingResetToken = useAuthStore((s) => s.setPendingResetToken);
  const verify = useVerifyOtpMutation();
  const resend = useSendOtpMutation();

  function handleSubmit(code: string) {
    if (!pendingIdentifier) {
      router.replace('/(auth)/forgot-password');
      return;
    }

    verify.mutate(
      { identifier: pendingIdentifier, code },
      {
        onSuccess: (data) => {
          setPendingResetToken(data.resetToken);
          router.push('/(auth)/reset-password');
        },
      },
    );
  }

  return (
    <VerifyOtpView
      destination={pendingIdentifier}
      onSubmit={handleSubmit}
      onResend={() => {
        if (pendingIdentifier) {
          resend.mutate({ identifier: pendingIdentifier, channel: 'sms' });
        }
      }}
      loading={verify.isPending}
      error={verify.isError ? 'Código inválido. Tenta novamente.' : null}
    />
  );
}
