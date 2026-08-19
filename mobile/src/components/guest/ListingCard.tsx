import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { ImageLightbox } from '@/components/guest/ImageLightbox';
import {
  FavoriteButton,
  StatusBadge,
} from '@/components/guest/GuestChrome';
import { Text } from '@/components/ui/Text';
import type { GuestListing } from '@/data/guest.mock';

type Props = {
  listing: GuestListing;
  onPress?: () => void;
  onFavorite?: () => void;
  variant?: 'small' | 'medium' | 'search';
};

const SEARCH_WIDTH = Dimensions.get('window').width - 48;

function useGallery(listing: GuestListing) {
  const images = listing.images.length ? listing.images : [listing.image];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return {
    images,
    open,
    index,
    show: (i = 0) => {
      setIndex(i);
      setOpen(true);
    },
    hide: () => setOpen(false),
  };
}

export function ListingCard({
  listing,
  onPress,
  onFavorite,
  variant = 'search',
}: Props) {
  const gallery = useGallery(listing);

  if (variant === 'small') {
    return (
      <>
        <Pressable
          onPress={onPress}
          className="w-[172px] overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface"
        >
          <Pressable
            onPress={() => gallery.show(0)}
            className="relative h-[92px] w-full"
          >
            <Image
              source={{ uri: listing.image }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
            <View className="absolute right-2 top-2">
              <FavoriteButton active={listing.favorite} onPress={onFavorite} />
            </View>
            {listing.distanceKm != null ? (
              <View className="absolute bottom-2 left-2">
                <StatusBadge
                  label={`${listing.distanceKm} km`}
                  tone="blue"
                />
              </View>
            ) : null}
          </Pressable>
          <View className="gap-2 p-3">
            <View>
              <Text variant="label-s" numberOfLines={1}>
                {listing.name}
              </Text>
              <Text variant="p-xs">{listing.location}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="star" size={12} color="#2B7FFF" />
              <Text variant="label-xs">
                {listing.rating} ({listing.reviewCount})
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text variant="label-s">{listing.priceLabel}</Text>
              <View className="h-px w-2 bg-[#F5F5F5]" />
              <Text variant="p-xs">{listing.priceUnit}</Text>
            </View>
          </View>
        </Pressable>
        <ImageLightbox
          images={gallery.images}
          index={gallery.index}
          visible={gallery.open}
          onClose={gallery.hide}
        />
      </>
    );
  }

  if (variant === 'medium') {
    return (
      <>
        <Pressable
          onPress={onPress}
          className="w-full flex-row overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface"
        >
          <Pressable onPress={() => gallery.show(0)} className="relative h-[118px] w-[124px]">
            <Image
              source={{ uri: listing.image }}
              style={{ width: 124, height: 118 }}
              contentFit="cover"
            />
            {listing.badge ? (
              <View className="absolute left-2 top-2">
                <StatusBadge
                  label={listing.badge.label}
                  tone={listing.badge.tone}
                />
              </View>
            ) : null}
          </Pressable>
          <View className="flex-1 justify-between p-3">
            <View className="gap-1">
              <Text variant="label-s" numberOfLines={1}>
                {listing.name}
              </Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={12} color="#737373" />
                <Text variant="p-xs">{listing.location}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="star" size={12} color="#2B7FFF" />
              <Text variant="label-xs">
                {listing.rating} ({listing.reviewCount})
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text variant="label-s">{listing.priceLabel}</Text>
              <View className="h-px w-2 bg-[#F5F5F5]" />
              <Text variant="p-xs">{listing.priceUnit}</Text>
            </View>
          </View>
        </Pressable>
        <ImageLightbox
          images={gallery.images}
          index={gallery.index}
          visible={gallery.open}
          onClose={gallery.hide}
        />
      </>
    );
  }

  return (
    <>
      <Pressable
        onPress={onPress}
        className="w-full overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface"
      >
        <SearchCardImages
          images={gallery.images}
          badge={listing.badge}
          favorite={listing.favorite}
          onFavorite={onFavorite}
          onOpen={gallery.show}
        />
        <View className="gap-3 p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text variant="label-s" numberOfLines={1}>
                {listing.name}
              </Text>
              <Text variant="p-xs">{listing.location}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="star" size={12} color="#2B7FFF" />
              <Text variant="label-xs">
                {listing.rating} ({listing.reviewCount})
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            <Text variant="label-s">{listing.priceLabel}</Text>
            <Text variant="p-xs">· {listing.priceUnit}</Text>
          </View>
        </View>
      </Pressable>
      <ImageLightbox
        images={gallery.images}
        index={gallery.index}
        visible={gallery.open}
        onClose={gallery.hide}
      />
    </>
  );
}

function SearchCardImages({
  images,
  badge,
  favorite,
  onFavorite,
  onOpen,
}: {
  images: string[];
  badge?: GuestListing['badge'];
  favorite?: boolean;
  onFavorite?: () => void;
  onOpen: (index: number) => void;
}) {
  const [page, setPage] = useState(0);
  const width = SEARCH_WIDTH;
  const scrolling = useRef(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setPage(next);
  };

  return (
    <View className="relative h-[150px] w-full">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          scrolling.current = true;
        }}
        onMomentumScrollEnd={() => {
          scrolling.current = false;
        }}
      >
        {images.map((uri, i) => (
          <Pressable
            key={`${uri}-${i}`}
            onPress={() => {
              if (scrolling.current) return;
              onOpen(i);
            }}
          >
            <Image
              source={{ uri }}
              style={{ width, height: 150 }}
              contentFit="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
          <View className="absolute inset-0 justify-between p-4" pointerEvents="none">
        <View className="flex-row items-start justify-between">
          {badge ? (
            <StatusBadge
              label={badge.label}
              tone={badge.tone}
              withDot={badge.tone === 'green'}
            />
          ) : (
            <View />
          )}
        </View>
        {images.length > 1 ? (
          <View className="items-center">
            <View className="flex-row gap-1">
              {images.map((_, i) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i === page ? 'w-3 bg-brand' : 'w-1.5 bg-brand-soft'
                  }`}
                />
              ))}
            </View>
          </View>
        ) : (
          <View />
        )}
      </View>
      <View className="absolute right-4 top-4">
        <FavoriteButton active={favorite} onPress={onFavorite} />
      </View>
    </View>
  );
}

export function CityCard({
  name,
  count,
  image,
  onPress,
}: {
  name: string;
  count: string;
  image: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[127px] overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface"
    >
      <Image
        source={{ uri: image }}
        style={{ width: 127, height: 72 }}
        contentFit="cover"
      />
      <View className="gap-0.5 p-3">
        <Text variant="label-s">{name}</Text>
        <Text variant="p-xs">{count}</Text>
      </View>
    </Pressable>
  );
}
