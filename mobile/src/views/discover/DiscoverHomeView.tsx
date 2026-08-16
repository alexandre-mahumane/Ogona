import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';

type Props = {
  onExplore?: () => void;
};

export function DiscoverHomeView({ onExplore }: Props) {
  return (
    <Screen contentClassName="justify-center gap-6 px-6">
      <View className="gap-2">
        <Text variant="label-s" className="uppercase tracking-widest text-brand">
          Descobrir
        </Text>
        <Text variant="h3">Perto de ti</Text>
        <Text variant="p-m">
          Em breve: propriedades recomendadas, cidades e filtros ligados à API
          Ogona.
        </Text>
      </View>

      {onExplore ? (
        <Button variant="ghost" onPress={onExplore}>
          Ver pesquisa
        </Button>
      ) : null}
    </Screen>
  );
}
