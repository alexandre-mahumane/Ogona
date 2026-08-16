import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';

type Props = {
  onLogout?: () => void;
  onOpenHost?: () => void;
};

export function ProfileView({ onLogout, onOpenHost }: Props) {
  return (
    <Screen contentClassName="justify-center gap-6 px-6">
      <View className="gap-2">
        <Text variant="label-s" className="uppercase tracking-widest text-brand">
          Perfil
        </Text>
        <Text variant="h3">A tua conta</Text>
        <Text variant="p-m">
          Sessão, preferências e acesso ao painel de anfitrião.
        </Text>
      </View>

      <View className="gap-3">
        {onOpenHost ? (
          <Button onPress={onOpenHost}>Área do anfitrião</Button>
        ) : null}
        {onLogout ? (
          <Button variant="ghost" onPress={onLogout}>
            Sair
          </Button>
        ) : null}
      </View>
    </Screen>
  );
}
