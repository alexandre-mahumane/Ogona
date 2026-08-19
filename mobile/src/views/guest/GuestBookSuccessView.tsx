import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { colors } from '@/theme/colors';

export function GuestBookSuccessView() {
  return (
    <Screen
      className="bg-surface"
      contentClassName="flex-1 items-center justify-center px-[30px]"
    >
      <View className="w-full items-center" style={{ gap: 15 }}>
        <View className="h-20 w-20 items-center justify-center">
          <View
            className="absolute h-20 w-20 rounded-full"
            style={{ backgroundColor: colors.brand.soft }}
          />
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: '#FFEDD4' }}
          >
            <Ionicons name="checkmark" size={28} color={colors.brand.DEFAULT} />
          </View>
        </View>

        <View className="items-center" style={{ width: 298 }}>
          <Text
            variant="plain"
            className="font-manrope text-center"
            style={{
              color: colors.ink.DEFAULT,
              fontSize: 18,
              lineHeight: 24,
              fontWeight: '600',
            }}
          >
            Pedido enviado com sucesso!
          </Text>
          <Text
            variant="plain"
            className="text-center"
            style={{
              color: colors.ink.muted,
              fontSize: 14,
              lineHeight: 18,
              marginTop: 8,
            }}
          >
            Recebemos o seu pedido. Agora aguarde a resposta do anfitrião.
          </Text>
        </View>

        <View
          className="w-full items-center"
          style={{ gap: 12, paddingVertical: 20, maxWidth: 274 }}
        >
          <Button
            className="h-14 w-full rounded-2xl"
            onPress={() => router.replace('/(guest)/(tabs)/reservations')}
          >
            Ver minhas reservas
          </Button>
          <Pressable
            onPress={() => router.replace('/(guest)/(tabs)')}
            className="h-14 w-full items-center justify-center"
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.ink.secondary,
            }}
          >
            <Text
              variant="plain"
              className="font-inter-semibold"
              style={{
                color: colors.ink.secondary,
                fontSize: 16,
                lineHeight: 20,
              }}
            >
              Voltar ao início
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
