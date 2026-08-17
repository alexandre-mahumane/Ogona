import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';

type Props = {
  images: string[];
  index: number;
  visible: boolean;
  onClose: () => void;
};

export function ImageLightbox({ images, index, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);
  const { width, height } = Dimensions.get('window');
  const [current, setCurrent] = useState(index);

  useEffect(() => {
    if (!visible) return;
    setCurrent(index);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: Math.min(index, Math.max(0, images.length - 1)),
        animated: false,
      });
    });
  }, [visible, index, images.length]);

  const onMomentum = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrent(next);
  };

  if (!images.length) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <FlatList
          ref={listRef}
          data={images}
          keyExtractor={(item, i) => `${item}-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentum}
          getItemLayout={(_, i) => ({
            length: width,
            offset: width * i,
            index: i,
          })}
          onScrollToIndexFailed={({ index: failed }) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index: failed, animated: false });
            }, 50);
          }}
          renderItem={({ item }) => (
            <View
              style={{ width, height }}
              className="items-center justify-center"
            >
              <Image
                source={{ uri: item }}
                style={{ width, height }}
                contentFit="contain"
              />
            </View>
          )}
        />

        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-4"
          style={{ top: insets.top + 8 }}
        >
          <Pressable
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <View className="rounded-full bg-white/15 px-3 py-1.5">
            <Text variant="label-s" className="text-white">
              {current + 1} / {images.length}
            </Text>
          </View>
          <View className="w-10" />
        </View>
      </View>
    </Modal>
  );
}
