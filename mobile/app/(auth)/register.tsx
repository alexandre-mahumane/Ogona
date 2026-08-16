import { router } from 'expo-router';

import type { RegisterInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/auth.store';
import { RegisterView } from '@/views/auth/RegisterView';

export default function RegisterScreen() {
  const setPendingRegister = useAuthStore((s) => s.setPendingRegister);
  const setPendingIdentifier = useAuthStore((s) => s.setPendingIdentifier);

  function handleSubmit(data: RegisterInput) {
    setPendingRegister({
      name: data.name,
      identifier: data.identifier,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
    });
    setPendingIdentifier(data.identifier);

    if (data.role === 'host') {
      router.push('/(auth)/register-wallet');
      return;
    }

    router.push('/(auth)/register-verify');
  }

  return <RegisterView onSubmit={handleSubmit} />;
}
