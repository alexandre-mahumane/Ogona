import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { colors } from '@/theme/colors';

export function GuestPaySuccessView() {
  return (
    <Screen contentClassName="justify-between px-6 pb-6 pt-16">
      <View className="items-center gap-4 pt-20">
        <View className="relative h-24 w-24 items-center justify-center">
          <View
            className="absolute h-24 w-24 rounded-full"
            style={{ backgroundColor: '#FFF7ED' }}
          />
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.brand.soft }}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFEDD4' }}
            >
              <Ionicons
                name="checkmark"
                size={28}
                color={colors.brand.DEFAULT}
              />
            </View>
          </View>
        </View>

        <Text variant="h3" className="text-center">
          Pagamento confirmado!
        </Text>
        <Text variant="p-m" className="text-center">
          A sua reserva está confirmada. Pode consultar os detalhes nas suas
          reservas.
        </Text>
      </View>

      <View className="gap-3">
        <Button onPress={() => router.replace('/(guest)/(tabs)/reservations')}>
          Ver minhas reservas
        </Button>
        <Button variant="ghost" onPress={() => router.replace('/(guest)/(tabs)')}>
          Voltar ao início
        </Button>
      </View>
    </Screen>
  );
}
