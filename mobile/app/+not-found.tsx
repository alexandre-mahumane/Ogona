import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <View className="flex-1 items-center justify-center gap-3 bg-surface px-6">
        <Text className="text-2xl font-bold text-ink">Ecrã inexistente</Text>
        <Link href="/" className="text-brand-700">
          Voltar ao início
        </Link>
      </View>
    </>
  );
}
