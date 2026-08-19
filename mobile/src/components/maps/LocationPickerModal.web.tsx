import { Modal, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import type { PickedLocation } from '@/lib/maps/geocode';

type Props = {
  visible: boolean;
  latitude: number;
  longitude: number;
  onClose: () => void;
  onConfirm: (location: PickedLocation) => void;
};

export function LocationPickerModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="gap-4 rounded-t-xl bg-surface px-4 py-6">
          <Text variant="h6">Selecionar no mapa</Text>
          <Text variant="p-s">
            O mapa interactivo está disponível na app iOS e Android. No web,
            use “Usar localização actual” ou preencha o endereço.
          </Text>
          <Pressable
            onPress={onClose}
            className="h-12 items-center justify-center rounded-full border border-ink-secondary"
          >
            <Text variant="label-m" className="text-ink-secondary">
              Fechar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
