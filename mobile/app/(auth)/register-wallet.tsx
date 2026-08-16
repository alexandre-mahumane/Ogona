import { router } from 'expo-router';

import type { WalletInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/auth.store';
import { WalletView } from '@/views/auth/WalletView';

export default function RegisterWalletScreen() {
  const pendingRegister = useAuthStore((s) => s.pendingRegister);
  const setPendingRegister = useAuthStore((s) => s.setPendingRegister);

  function handleSubmit(wallet: WalletInput) {
    if (!pendingRegister) {
      router.replace('/(auth)/register');
      return;
    }

    setPendingRegister({ ...pendingRegister, wallet });
    router.push('/(auth)/register-verify');
  }

  return <WalletView onSubmit={handleSubmit} />;
}
