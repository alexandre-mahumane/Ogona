import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { DEFAULT_ZOOM, toLngLat } from '@/lib/maps/config';
import {
  formatPickedAddress,
  reverseGeocode,
  type PickedLocation,
} from '@/lib/maps/geocode';
import { initMapbox, mapViewProps, mapViewStyle } from '@/lib/maps/mapbox';
import { colors } from '@/theme/colors';

initMapbox();

type Props = {
  visible: boolean;
  latitude: number;
  longitude: number;
  onClose: () => void;
  onConfirm: (location: PickedLocation) => void;
};

export function LocationPickerModal({
  visible,
  latitude,
  longitude,
  onClose,
  onConfirm,
}: Props) {
  const [center, setCenter] = useState({ latitude, longitude });
  const [preview, setPreview] = useState('Arraste o mapa para escolher o bairro.');
  const [resolved, setResolved] = useState<PickedLocation | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCenter({ latitude, longitude });
    setResolved(null);
    setPreview('Arraste o mapa para escolher o bairro.');
  }, [visible, latitude, longitude]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setPreview('A identificar o bairro…');
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const picked = await reverseGeocode(center.latitude, center.longitude);
          if (cancelled) return;
          setResolved(picked);
          setPreview(
            picked.neighborhood
              ? `${picked.neighborhood}${picked.city ? `, ${picked.city}` : ''}`
              : formatPickedAddress(picked),
          );
        } catch {
          if (cancelled) return;
          setResolved(null);
          setPreview(
            `Toque no mapa ou arraste o pino. ${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)}`,
          );
        }
      })();
    }, 650);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [visible, center.latitude, center.longitude]);

  async function confirm() {
    if (confirming) return;
    setConfirming(true);
    try {
      const picked =
        resolved &&
        Math.abs(resolved.latitude - center.latitude) < 0.00015 &&
        Math.abs(resolved.longitude - center.longitude) < 0.00015
          ? resolved
          : await reverseGeocode(center.latitude, center.longitude);
      onConfirm(picked);
      onClose();
    } catch {
      onConfirm({
        latitude: center.latitude,
        longitude: center.longitude,
        country: 'Moçambique',
        city: '',
        neighborhood: '',
        street: '',
        door: '',
        postal: '',
      });
      onClose();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-xl bg-surface pb-6">
          <View className="items-center border-b border-surface-border px-4 pb-4 pt-2">
            <View className="mb-4 h-0.5 w-6 rounded-full bg-[#FAFAFA]" />
            <Text variant="h6" className="self-stretch text-ink">
              Selecionar no mapa
            </Text>
            <Pressable
              onPress={onClose}
              disabled={confirming}
              className="absolute right-4 top-4"
            >
              <Ionicons name="close" size={18} color={colors.ink.DEFAULT} />
            </Pressable>
          </View>

          <View className="gap-4 px-4 pt-4">
            <View className="h-[280px] overflow-hidden rounded-2xl">
              <Mapbox.MapView
                key={visible ? `${latitude}-${longitude}` : 'closed'}
                style={mapViewStyle}
                {...mapViewProps}
                onCameraChanged={(state) => {
                  const [lng, lat] = state.properties.center;
                  if (lng == null || lat == null) return;
                  setCenter((prev) => {
                    if (
                      Math.abs(prev.latitude - lat) < 0.00005 &&
                      Math.abs(prev.longitude - lng) < 0.00005
                    ) {
                      return prev;
                    }
                    return { latitude: lat, longitude: lng };
                  });
                }}
              >
                <Mapbox.Camera
                  defaultSettings={{
                    centerCoordinate: toLngLat(latitude, longitude),
                    zoomLevel: DEFAULT_ZOOM,
                  }}
                />
              </Mapbox.MapView>
              <View
                pointerEvents="none"
                className="absolute left-1/2 top-1/2 -ml-4 -mt-8"
              >
                <Ionicons name="location" size={32} color={colors.brand.DEFAULT} />
              </View>
            </View>

            <View className="flex-row items-start gap-3 rounded-lg border border-surface-border bg-[#FCFCFC] p-4">
              <View className="h-8 w-8 items-center justify-center rounded-md border border-surface-border bg-[#FAFAFA]">
                <Ionicons name="location" size={16} color={colors.brand.DEFAULT} />
              </View>
              <Text variant="p-s" className="flex-1">
                {preview}
              </Text>
            </View>

            <View className="flex-row gap-2.5">
              <Pressable
                onPress={onClose}
                disabled={confirming}
                className="h-12 flex-1 items-center justify-center rounded-full border border-ink-secondary"
              >
                <Text variant="label-m" className="text-ink-secondary">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void confirm()}
                disabled={confirming}
                className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-button bg-brand"
                style={{ opacity: confirming ? 0.7 : 1 }}
              >
                {confirming ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
                <Text variant="label-m" className="text-white">
                  {confirming ? 'A confirmar…' : 'Confirmar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
