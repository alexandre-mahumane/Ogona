import { router } from 'expo-router';

import {
  useRegisterMutation,
  useSendRegisterOtpMutation,
  useVerifyRegisterOtpMutation,
} from '@/hooks/useAuthMutations';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { VerifyOtpView } from '@/views/auth/VerifyOtpView';

function isMissingRoute(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export default function RegisterVerifyScreen() {
  const pendingIdentifier = useAuthStore((s) => s.pendingIdentifier);
  const pendingRegister = useAuthStore((s) => s.pendingRegister);
  const register = useRegisterMutation();
  const verify = useVerifyRegisterOtpMutation();
  const resend = useSendRegisterOtpMutation();

  function finishRegister() {
    if (!pendingRegister) {
      router.replace('/(auth)/register');
      return;
    }

    register.mutate(
      {
        name: pendingRegister.name,
        identifier: pendingRegister.identifier,
        birthDate: pendingRegister.birthDate,
        password: pendingRegister.password,
        confirmPassword: pendingRegister.confirmPassword,
        role: pendingRegister.role,
      },
      {
        onSuccess: () => router.replace('/(auth)/register-success'),
      },
    );
  }

  function handleSubmit(code: string) {
    if (!pendingIdentifier) {
      router.replace('/(auth)/register');
      return;
    }

    verify.mutate(
      { identifier: pendingIdentifier, code },
      {
        onSuccess: () => finishRegister(),
        onError: (error) => {
          if (isMissingRoute(error)) {
            finishRegister();
          }
        },
      },
    );
  }

  const verifyError =
    (verify.isError && !isMissingRoute(verify.error)) || register.isError
      ? register.isError
        ? register.error instanceof Error
          ? register.error.message
          : 'Não foi possível criar a conta.'
        : 'Código inválido. Tenta novamente.'
      : null;

  return (
    <VerifyOtpView
      destination={pendingIdentifier}
      onSubmit={handleSubmit}
      onResend={() => {
        if (pendingIdentifier) {
          resend.mutate({ identifier: pendingIdentifier, channel: 'sms' });
        }
      }}
      loading={verify.isPending || register.isPending}
      error={verifyError}
    />
  );
}
