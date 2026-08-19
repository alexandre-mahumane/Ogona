import { router } from 'expo-router';

import { SuccessView } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';

export default function ResetSuccessScreen() {
  const setPendingIdentifier = useAuthStore((s) => s.setPendingIdentifier);
  const setPendingResetToken = useAuthStore((s) => s.setPendingResetToken);

  return (
    <SuccessView
      title="Palavra-passe atualizada"
      description="A sua palavra-passe foi alterada com sucesso. Entre na conta com as novas credenciais."
      primaryLabel="Entrar"
      onPrimary={() => {
        setPendingIdentifier(null);
        setPendingResetToken(null);
        router.replace('/(auth)/login');
      }}
    />
  );
}
