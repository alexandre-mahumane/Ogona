import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

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
    <Screen contentClassName="flex-1 items-center justify-center px-6">
      <View className="w-full items-center gap-8">
        <View className="items-center gap-6">
          <View
            className="h-[72px] w-[72px] items-center justify-center rounded-full border-8 border-[#F0FDF4] bg-[#DCFCE7]"
          >
            <Ionicons name="checkmark-circle-outline" size={32} color="#00C950" />
          </View>
          <View className="items-center gap-1">
            <Text variant="h3" className="text-center">
              {title}
            </Text>
            <Text variant="p-m" className="text-center">
              {description}
            </Text>
          </View>
        </View>

        <View className="w-full gap-4">
          <Button onPress={onPrimary}>{primaryLabel}</Button>
          {secondaryLabel && onSecondary ? (
            <Button
              variant="ghost"
              className="border border-surface-border"
              labelClassName="!text-ink"
              onPress={onSecondary}
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
