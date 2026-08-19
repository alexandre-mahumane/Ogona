import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type Props = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function AuthHeader({ title, onBack, right }: Props) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#F5F5F5] bg-surface px-6 pb-4 pt-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
        className="h-[34px] w-[34px] items-center justify-center rounded-full bg-surface-muted"
        onPress={onBack ?? (() => router.back())}
      >
        <Ionicons name="arrow-back" size={16} color={colors.ink.secondary} />
      </Pressable>
      <Text variant="h5">{title}</Text>
      <View className="min-w-[34px] items-end">
        {right ?? <View className="w-[34px]" />}
      </View>
    </View>
  );
}
