import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import { Linking, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { DEFAULT_ZOOM, mapsAppUrl, toLngLat } from '@/lib/maps/config';
import { initMapbox } from '@/lib/maps/mapbox';
import { colors } from '@/theme/colors';

initMapbox();

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

  const coordinate = toLngLat(latitude, longitude);

  return (
    <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5]">
      <View style={{ width: '100%', height }}>
        <Mapbox.MapView
          style={{ flex: 1 }}
          styleURL={Mapbox.StyleURL.Street}
          scaleBarEnabled={false}
          attributionEnabled
          logoEnabled
        >
          <Mapbox.Camera
            defaultSettings={{
              centerCoordinate: coordinate,
              zoomLevel: DEFAULT_ZOOM,
            }}
          />
          <Mapbox.MarkerView coordinate={coordinate} anchor={{ x: 0.5, y: 1 }}>
            <View className="h-8 w-8 items-center justify-center">
              <Ionicons name="location" size={32} color={colors.brand.DEFAULT} />
            </View>
          </Mapbox.MarkerView>
        </Mapbox.MapView>
      </View>
      <Pressable
        onPress={() => void Linking.openURL(mapsAppUrl(latitude, longitude, title))}
        className="flex-row items-center justify-center gap-2 border-t border-[#F5F5F5] bg-surface py-3"
      >
        <Ionicons name="navigate-outline" size={16} color={colors.brand.DEFAULT} />
        <Text variant="label-s" className="text-brand">
          Abrir no mapa
        </Text>
      </Pressable>
    </View>
  );
}
