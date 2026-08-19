import { router } from 'expo-router';

import { SuccessView } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';

export default function RegisterSuccessScreen() {
  const user = useAuthStore((s) => s.user);
  const pendingRegister = useAuthStore((s) => s.pendingRegister);
  const setPendingRegister = useAuthStore((s) => s.setPendingRegister);
  const isHost = user?.role === 'host' || pendingRegister?.role === 'host';

  return (
    <SuccessView
      title="Conta criada com sucesso"
      description={
        isHost
          ? 'Bem-vindo ao Ogona! A sua conta de anfitrião foi criada. Comece por adicionar a sua primeira propriedade.'
          : 'Bem-vindo ao Ogona! A sua conta foi criada. Explore alojamentos em todo o Moçambique.'
      }
      primaryLabel={isHost ? 'Ir ao painel' : 'Explorar alojamentos'}
      onPrimary={() => {
        setPendingRegister(null);
        router.replace(isHost ? '/(host)/(tabs)' : '/(guest)/(tabs)');
      }}
      secondaryLabel={isHost ? 'Adicionar propriedade' : undefined}
      onSecondary={
        isHost
          ? () => {
              setPendingRegister(null);
              router.replace('/(host)/add-property');
            }
          : undefined
      }
    />
  );
}
