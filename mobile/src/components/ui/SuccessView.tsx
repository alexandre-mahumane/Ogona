import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type Props = {
  title?: string;
  description?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function SuccessView({
  title = 'Conta criada com sucesso',
  description = 'Bem-vindo ao Ogona! A sua conta foi criada. Explore alojamentos em todo o Moçambique.',
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <Screen contentClassName="justify-between px-6 pb-6 pt-16">
      <View className="items-center gap-4 pt-20">
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: '#DCFCE7' }}
        >
          <Ionicons name="checkmark" size={40} color={colors.success} />
        </View>
        <Text variant="h3" className="text-center">
          {title}
        </Text>
        <Text variant="p-m" className="text-center">
          {description}
        </Text>
      </View>

      <View className="gap-3">
        <Button onPress={onPrimary}>{primaryLabel}</Button>
        {secondaryLabel && onSecondary ? (
          <Button variant="ghost" onPress={onSecondary}>
            {secondaryLabel}
          </Button>
        ) : null}
      </View>
    </Screen>
  );
}
