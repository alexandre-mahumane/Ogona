import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type Props = {
  title: string;
  onBack?: () => void;
};

export function AuthHeader({ title, onBack }: Props) {
  return (
    <View className="flex-row items-center px-4 py-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={12}
        className="h-10 w-10 items-center justify-center"
        onPress={onBack ?? (() => router.back())}
      >
        <Ionicons name="chevron-back" size={24} color={colors.ink.DEFAULT} />
      </Pressable>
      <Text variant="label-m" className="flex-1 pr-10 text-center">
        {title}
      </Text>
    </View>
  );
}
