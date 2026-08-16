import { router } from 'expo-router';

import { SuccessView } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';

export default function RegisterSuccessScreen() {
  const user = useAuthStore((s) => s.user);
  const setPendingRegister = useAuthStore((s) => s.setPendingRegister);

  return (
    <SuccessView
      primaryLabel="Explorar alojamentos"
      onPrimary={() => {
        setPendingRegister(null);
        router.replace('/(guest)/(tabs)');
      }}
      secondaryLabel={user?.role === 'host' ? 'Adicionar uma estadia' : undefined}
      onSecondary={
        user?.role === 'host'
          ? () => {
              setPendingRegister(null);
              router.replace('/(host)/(tabs)');
            }
          : undefined
      }
    />
  );
}
