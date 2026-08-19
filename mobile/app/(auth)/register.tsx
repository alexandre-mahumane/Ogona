import { router } from 'expo-router';

import { useSendRegisterOtpMutation } from '@/hooks/useAuthMutations';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { RegisterView, type RegisterPayload } from '@/views/auth/RegisterView';

export default function RegisterScreen() {
  const sendOtp = useSendRegisterOtpMutation();
  const setPendingRegister = useAuthStore((s) => s.setPendingRegister);
  const setPendingIdentifier = useAuthStore((s) => s.setPendingIdentifier);

  function handleSubmit(data: RegisterPayload) {
    setPendingIdentifier(data.identifier);
    setPendingRegister({
      name: data.name,
      identifier: data.identifier,
      birthDate: data.birthDate,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
      acceptTerms: data.acceptTerms,
      business: data.business,
      wallet: data.wallet,
    });

    sendOtp.mutate(
      { identifier: data.identifier, channel: 'sms' },
      {
        onSuccess: () => router.push('/(auth)/register-verify'),
        onError: (error) => {
          if (error instanceof ApiError && error.status === 404) {
            router.push('/(auth)/register-verify');
          }
        },
      },
    );
  }

  const otpError =
    sendOtp.isError &&
    !(sendOtp.error instanceof ApiError && sendOtp.error.status === 404)
      ? sendOtp.error instanceof Error
        ? sendOtp.error.message
        : 'Não foi possível enviar o código.'
      : null;

  return (
    <RegisterView
      onSubmit={handleSubmit}
      loading={sendOtp.isPending}
      error={otpError}
    />
  );
}
