import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

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

export function ListingCard({
  listing,
  onPress,
  onFavorite,
  variant = 'search',
}: Props) {
  if (variant === 'small') {
    return (
      <Pressable
        onPress={onPress}
        className="w-[172px] overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface"
      >
        <View className="relative h-[92px] w-full">
          <Image
            source={{ uri: listing.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <View className="absolute right-2 top-2">
            <FavoriteButton active={listing.favorite} onPress={onFavorite} />
          </View>
          {listing.badge ? (
            <View className="absolute bottom-2 left-2">
              <StatusBadge
                label={listing.badge.label}
                tone={listing.badge.tone}
              />
            </View>
          ) : null}
        </View>
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
            <Text variant="p-xs">· {listing.priceUnit}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === 'medium') {
    return (
      <Pressable
        onPress={onPress}
        className="w-full flex-row overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface"
      >
        <View className="relative h-[118px] w-[124px]">
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
        </View>
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
            <Text variant="p-xs">· {listing.priceUnit}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="w-full overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface"
    >
      <View className="relative h-[150px] w-full">
        <Image
          source={{ uri: listing.image }}
          style={{ width: '100%', height: 150 }}
          contentFit="cover"
        />
        <View className="absolute inset-0 justify-between p-4">
          <View className="flex-row items-start justify-between">
            {listing.badge ? (
              <StatusBadge
                label={listing.badge.label}
                tone={listing.badge.tone}
                withDot={listing.badge.tone === 'green'}
              />
            ) : (
              <View />
            )}
            <FavoriteButton
              active={listing.favorite}
              onPress={onFavorite}
            />
          </View>
          <View className="items-center">
            <View className="flex-row gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i === 0 ? 'w-3 bg-brand' : 'w-1.5 bg-brand-soft'
                  }`}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
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
