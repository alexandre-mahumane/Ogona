import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { mapsAppUrl } from '@/lib/maps/config';
import { colors } from '@/theme/colors';

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  height?: number;
};

export function PropertyMap({
  latitude,
  longitude,
  title,
  height = 220,
}: Props) {
  if (latitude == null || longitude == null) {
    return (
      <View
        className="items-center justify-center rounded-[15px] border border-dashed border-surface-border bg-surface-muted px-6"
        style={{ height }}
      >
        <Ionicons name="map-outline" size={28} color={colors.ink.soft} />
        <Text variant="p-s" className="mt-2 text-center">
          Localização indisponível
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => void Linking.openURL(mapsAppUrl(latitude, longitude, title))}
      className="items-center justify-center rounded-[15px] border border-surface-border bg-surface-muted px-6"
      style={{ height }}
    >
      <Ionicons name="map" size={28} color={colors.brand.DEFAULT} />
      <Text variant="p-s" className="mt-2 text-center text-brand">
        Abrir no mapa
      </Text>
    </Pressable>
  );
}
