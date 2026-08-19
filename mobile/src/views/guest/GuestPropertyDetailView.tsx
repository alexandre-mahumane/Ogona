import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { FavoriteButton, StickyFooter } from '@/components/guest/GuestChrome';
import { ImageLightbox } from '@/components/guest/ImageLightbox';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { Screen, Text } from '@/components/ui';
import { usePropertyDetail, useToggleFavorite } from '@/hooks/useDiscover';
import { colors } from '@/theme/colors';

type TabId = 'details' | 'photos' | 'map' | 'reviews';

const tabs: { id: TabId; label: string }[] = [
  { id: 'details', label: 'Detalhes' },
  { id: 'photos', label: 'Fotos' },
  { id: 'map', label: 'Mapa' },
  { id: 'reviews', label: 'Avaliações' },
];

const amenityIcon: Record<string, ComponentProps<typeof Ionicons>['name']> = {
  wifi: 'wifi',
  car: 'car-outline',
  snow: 'snow-outline',
  people: 'people-outline',
};

export function GuestPropertyDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyQuery = usePropertyDetail(id ? String(id) : undefined);
  const toggleFavorite = useToggleFavorite();
  const listing = propertyQuery.data;
  const [tab, setTab] = useState<TabId>('details');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const totalReviews = useMemo(
    () =>
      listing?.ratingBreakdown.reduce((sum, r) => sum + r.count, 0) ||
      listing?.reviewCount ||
      1,
    [listing],
  );

  if (propertyQuery.isLoading || !listing) {
    return (
      <Screen contentClassName="items-center justify-center">
        {propertyQuery.isError ? (
          <Text variant="p-s">
            {propertyQuery.error instanceof Error
              ? propertyQuery.error.message
              : 'Propriedade não encontrada'}
          </Text>
        ) : (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        )}
      </Screen>
    );
  }

  const goBook = (roomId?: string) => {
    router.push({
      pathname: '/(guest)/book/[id]',
      params: roomId ? { id: listing.id, roomId } : { id: listing.id },
    });
  };

  const galleryImages = listing.images.length
    ? listing.images
    : [listing.image];

  return (
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard={false}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        <Pressable
          onPress={() => openGallery(0)}
          className="relative h-[200px] w-full bg-surface-muted"
        >
          <Image
            source={{ uri: listing.image }}
            style={{ width: '100%', height: 200 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => router.back()}
            className="absolute left-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={18} color={colors.ink.DEFAULT} />
          </Pressable>
          <View className="absolute right-4 top-4">
            <FavoriteButton
              active={listing.favorite}
              onPress={() =>
                toggleFavorite.mutate({
                  propertyId: listing.id,
                  favorite: Boolean(listing.favorite),
                })
              }
            />
          </View>
        </Pressable>

        <View className="gap-4 px-6 pt-5">
          <View className="gap-2">
            <Text variant="h4">{listing.name}</Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.ink.muted}
              />
              <Text variant="p-s">{listing.location}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="star" size={14} color={colors.brand.DEFAULT} />
              <Text variant="label-s">
                {listing.rating} ({listing.reviewCount} avaliações)
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {listing.amenities.map((a) => (
              <View
                key={a.label}
                className="flex-row items-center gap-1.5 rounded-full border border-surface-border bg-surface px-3 py-1.5"
              >
                <Ionicons
                  name={amenityIcon[a.icon] ?? 'checkmark-circle-outline'}
                  size={14}
                  color={colors.brand.DEFAULT}
                />
                <Text variant="label-xs">{a.label}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row rounded-xl border border-surface-border bg-surface p-1">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  className={`h-9 flex-1 items-center justify-center rounded-lg ${
                    active ? 'bg-brand' : ''
                  }`}
                >
                  <Text
                    variant="label-xs"
                    className={active ? 'text-white' : 'text-ink-secondary'}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {tab === 'details' ? (
            <View className="gap-5">
              <View className="gap-2">
                <Text variant="label-s" className="font-inter-bold">
                  Sobre
                </Text>
                <Text variant="p-s">{listing.description}</Text>
              </View>

              <View className="gap-3">
                <Text variant="label-s" className="font-inter-bold">
                  Quartos disponíveis
                </Text>
                {listing.rooms.map((room) => (
                  <View
                    key={room.id}
                    className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface"
                  >
                    <View className="flex-row gap-3 p-3">
                    <Pressable onPress={() => openGallery(0)}>
                      <Image
                        source={{ uri: room.image }}
                        style={{ width: 72, height: 72, borderRadius: 12 }}
                        contentFit="cover"
                      />
                    </Pressable>
                      <View className="flex-1 justify-between py-0.5">
                        <View>
                          <Text variant="label-s">{room.name}</Text>
                          <Text variant="p-xs">{room.detail}</Text>
                        </View>
                        <Text variant="label-s" className="text-brand">
                          {room.priceLabel}
                        </Text>
                      </View>
                    </View>
                    <View className="px-3 pb-3">
                      <Pressable
                        onPress={() => goBook(room.id)}
                        className="h-10 items-center justify-center rounded-[15px] bg-brand"
                      >
                        <Text variant="label-s" className="text-white">
                          Reservar
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {tab === 'photos' ? (
            <View className="flex-row flex-wrap gap-2">
              {galleryImages.map((uri, i) => (
                <Pressable
                  key={`${uri}-${i}`}
                  onPress={() => openGallery(i)}
                  className="overflow-hidden rounded-xl"
                  style={{ width: '48.5%' }}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: '100%', height: 120 }}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </View>
          ) : null}

          {tab === 'map' ? (
            <PropertyMap
              latitude={listing.latitude}
              longitude={listing.longitude}
              title={listing.name}
            />
          ) : null}

          {tab === 'reviews' ? (
            <View className="gap-5">
              <View className="items-center gap-1 rounded-[15px] border border-[#F5F5F5] bg-surface py-5">
                <Text className="font-manrope-bold text-[40px] text-ink">
                  {listing.rating.toFixed(1)}
                </Text>
                <View className="flex-row items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name="star"
                      size={14}
                      color={
                        s <= Math.round(listing.rating)
                          ? colors.brand.DEFAULT
                          : '#E5E5E5'
                      }
                    />
                  ))}
                </View>
                <Text variant="p-xs">
                  {listing.reviewCount} avaliações
                </Text>
              </View>

              <View className="gap-2">
                {listing.ratingBreakdown.map((row) => (
                  <View key={row.stars} className="flex-row items-center gap-2">
                    <Text variant="label-xs" className="w-4">
                      {row.stars}
                    </Text>
                    <View className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <View
                        className="h-full rounded-full bg-brand"
                        style={{
                          width: `${Math.round((row.count / totalReviews) * 100)}%`,
                        }}
                      />
                    </View>
                    <Text variant="p-xs" className="w-6 text-right">
                      {row.count}
                    </Text>
                  </View>
                ))}
              </View>

              {listing.reviews.map((review) => (
                <View
                  key={review.id}
                  className="gap-2 rounded-[15px] border border-[#F5F5F5] bg-surface p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text variant="label-s">{review.name}</Text>
                    <View className="flex-row items-center gap-1">
                      <Ionicons
                        name="star"
                        size={12}
                        color={colors.brand.DEFAULT}
                      />
                      <Text variant="label-xs">{review.rating}</Text>
                    </View>
                  </View>
                  <Text variant="p-s">{review.comment}</Text>
                  <Text variant="p-xs">{review.when}</Text>
                </View>
              ))}

              <Text variant="p-xs" className="text-center">
                Apenas hóspedes com reserva verificada podem avaliar.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <StickyFooter>
        <Pressable
          onPress={() => goBook()}
          className="h-14 flex-row items-center justify-center gap-2 rounded-button bg-brand px-5"
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text variant="label-m" className="text-white">
            Reservar agora
          </Text>
        </Pressable>
      </StickyFooter>
      <ImageLightbox
        images={galleryImages}
        index={galleryIndex}
        visible={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </Screen>
  );
}
