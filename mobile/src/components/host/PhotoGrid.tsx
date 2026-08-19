import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';

const SLOTS = 9;

type Props = {
  photos: string[];
  max?: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function PhotoGrid({ photos, max = 8, onAdd, onRemove }: Props) {
  const slots = Array.from({ length: SLOTS }, (_, i) => i);
  const canAdd = photos.length < max;

  return (
    <View className="flex-row flex-wrap gap-2">
      {slots.map((i) => {
        if (i === 0) {
          return (
            <Pressable
              key="add"
              onPress={canAdd ? onAdd : undefined}
              className="h-[140px] w-[30.5%] items-center justify-center gap-3 rounded-xl border border-dashed border-brand bg-[#FCFCFC]"
              style={{ opacity: canAdd ? 1 : 0.5 }}
            >
              <Ionicons name="add" size={24} color={colors.brand.DEFAULT} />
              <Text variant="label-xs" className="text-ink-muted">
                Adicionar fotos
              </Text>
            </Pressable>
          );
        }

        const photo = photos[i - 1];
        if (photo) {
          return (
            <View
              key={`${photo}-${i}`}
              className="h-[140px] w-[30.5%] overflow-hidden rounded-xl border border-surface-border bg-[#FCFCFC]"
            >
              <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
              <Pressable
                onPress={() => onRemove(i - 1)}
                className="absolute bottom-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-[#FB2C36]"
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          );
        }

        return (
          <View
            key={`empty-${i}`}
            className="h-[140px] w-[30.5%] items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-[#FCFCFC]"
          >
            <Ionicons name="image-outline" size={24} color="#E5E5E5" />
          </View>
        );
      })}
    </View>
  );
}
