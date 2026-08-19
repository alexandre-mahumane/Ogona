import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/guest/GuestChrome';
import { ImageLightbox } from '@/components/guest/ImageLightbox';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { Screen, Text } from '@/components/ui';
import { usePropertyDetail } from '@/hooks/useDiscover';
import { propertyTypeLabel } from '@/lib/mappers/guest';
import { colors } from '@/theme/colors';

const HERO_WIDTH = Dimensions.get('window').width;

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
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyQuery = usePropertyDetail(id ? String(id) : undefined);
  const listing = propertyQuery.data;
  const [tab, setTab] = useState<TabId>('details');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [heroPage, setHeroPage] = useState(0);

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
  const typeLabel = propertyTypeLabel(listing.propertyType);

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const width = e.nativeEvent.layoutMeasurement.width || 1;
    setHeroPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Screen
      className="bg-surface"
      contentClassName="flex-1"
      keyboard={false}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        <View className="relative h-[200px] w-full bg-surface-muted">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onHeroScroll}
            scrollEventThrottle={16}
          >
            {galleryImages.map((uri, i) => (
              <Pressable
                key={`${uri}-${i}`}
                onPress={() => openGallery(i)}
                style={{ width: HERO_WIDTH }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: HERO_WIDTH, height: 200 }}
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => router.back()}
            className="absolute left-6 h-8 w-8 items-center justify-center rounded-full border border-surface-border bg-surface"
            style={{ top: insets.top + 8 }}
          >
            <Ionicons name="chevron-back" size={20} color="#404040" />
          </Pressable>

          <View className="absolute bottom-4 left-6 right-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              {galleryImages.map((_, i) => (
                <View
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === heroPage ? 12 : 6,
                    height: 6,
                    backgroundColor:
                      i === heroPage ? colors.brand.DEFAULT : colors.brand.soft,
                  }}
                />
              ))}
            </View>
            {typeLabel ? (
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: colors.brand.soft }}
              >
                <Text
                  variant="plain"
                  className="font-inter-semibold"
                  style={{ color: colors.brand.DEFAULT, fontSize: 14, lineHeight: 18 }}
                >
                  {typeLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="gap-8 px-6 pt-4">
          <View className="gap-4">
            <View className="flex-row items-start justify-between gap-6">
              <View className="flex-1 gap-1">
                <Text variant="h5">{listing.name}</Text>
                <Text variant="p-s">{listing.location}</Text>
              </View>
              <View className="flex-row items-center gap-0.5 pt-0.5">
                <Ionicons name="star" size={20} color={colors.brand.DEFAULT} />
                <Text
                  variant="plain"
                  className="font-inter-semibold"
                  style={{ color: colors.ink.DEFAULT, fontSize: 12, lineHeight: 16 }}
                >
                  {listing.rating} ({listing.reviewCount})
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-1.5"
            >
              {listing.amenities.map((a) => (
                <View
                  key={a.label}
                  className="flex-row items-center gap-1.5 rounded-full bg-[#FCFCFC] px-2 py-1"
                >
                  <Ionicons
                    name={amenityIcon[a.icon] ?? 'checkmark-circle-outline'}
                    size={14}
                    color={colors.ink.muted}
                  />
                  <Text
                    variant="plain"
                    className="font-inter-semibold"
                    style={{ color: colors.ink.muted, fontSize: 12, lineHeight: 16 }}
                  >
                    {a.label}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View className="gap-6">
            <View className="flex-row border-b border-[#F5F5F5]">
              {tabs.map((t) => {
                const active = tab === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setTab(t.id)}
                    className="h-10 flex-1 items-center justify-center"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: active
                        ? colors.brand.DEFAULT
                        : 'transparent',
                      marginBottom: -1,
                    }}
                  >
                    <Text
                      variant="plain"
                      className="font-inter-semibold"
                      style={{
                        color: active ? colors.brand.DEFAULT : colors.ink.muted,
                        fontSize: 14,
                        lineHeight: 18,
                      }}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {tab === 'details' ? (
              <View className="gap-8">
                <View className="gap-2">
                  <Text variant="h5">Sobre</Text>
                  <Text variant="p-m">{listing.description}</Text>
                </View>

                <View className="gap-4">
                  <Text variant="h5">Quartos disponíveis</Text>
                  {listing.rooms.map((room) => (
                    <View
                      key={room.id}
                      className="flex-row overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface"
                    >
                      <Pressable onPress={() => openGallery(0)}>
                        <Image
                          source={{ uri: room.image }}
                          style={{ width: 124, height: 98 }}
                          contentFit="cover"
                        />
                      </Pressable>
                      <View className="flex-1 justify-between p-3">
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 gap-0.5">
                            <Text
                              variant="plain"
                              numberOfLines={1}
                              style={{
                                color: '#404040',
                                fontSize: 16,
                                lineHeight: 16,
                                fontWeight: '500',
                              }}
                            >
                              {room.name}
                            </Text>
                            <Text
                              variant="plain"
                              style={{
                                color: colors.ink.muted,
                                fontSize: 12,
                                lineHeight: 16,
                              }}
                            >
                              {room.guests} hóspede{room.guests === 1 ? '' : 's'}
                            </Text>
                          </View>
                          <StatusBadge
                            label={room.available ? 'Disponível' : 'Indisponível'}
                            tone={room.available ? 'green' : 'orange'}
                          />
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-1">
                            <Text variant="label-s">{room.priceLabel}</Text>
                            <Text variant="p-xs">/ noite</Text>
                          </View>
                          <Pressable
                            onPress={() => goBook(room.id)}
                            className="h-7 items-center justify-center rounded-xl px-3.5"
                            style={{ backgroundColor: colors.brand.DEFAULT }}
                          >
                            <Text
                              variant="plain"
                              className="font-inter-semibold"
                              style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 16 }}
                            >
                              Reservar
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {listing.houseRules ? (
                  <View className="gap-2">
                    <Text variant="h5">Regras da casa</Text>
                    <View className="flex-row items-start gap-2.5 rounded-lg border border-[#F5F5F5] bg-[#FCFCFC] p-4">
                      <Ionicons
                        name="document-text-outline"
                        size={24}
                        color={colors.brand.DEFAULT}
                      />
                      <Text variant="p-s" className="flex-1">
                        {listing.houseRules}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {tab === 'photos' ? (
              <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                {galleryImages.map((uri, i) => (
                  <Pressable
                    key={`${uri}-${i}`}
                    onPress={() => openGallery(i)}
                    className="overflow-hidden rounded-xl"
                    style={{ width: '47%' }}
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: '100%', height: 112 }}
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
                <View className="flex-row items-center gap-9">
                  <View className="w-[155px] items-center gap-2">
                    <Text variant="h3">{listing.rating.toFixed(2)}</Text>
                    <View className="flex-row items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= Math.round(listing.rating) ? 'star' : 'star-outline'}
                          size={16}
                          color={colors.brand.DEFAULT}
                        />
                      ))}
                    </View>
                    <Text
                      variant="plain"
                      className="font-inter-semibold text-center"
                      style={{ color: colors.ink.secondary, fontSize: 16 }}
                    >
                      {listing.rating >= 4.5
                        ? 'Excelente'
                        : listing.rating >= 4
                          ? 'Muito bom'
                          : 'Bom'}
                    </Text>
                    <Text
                      variant="plain"
                      className="font-inter-semibold text-center"
                      style={{ color: colors.ink.muted, fontSize: 14, lineHeight: 18 }}
                    >
                      Baseado em {listing.reviewCount} avaliações
                    </Text>
                  </View>
                  <View className="flex-1 gap-2">
                    {listing.ratingBreakdown.map((row) => (
                      <View key={row.stars} className="flex-row items-center gap-3">
                        <View className="w-8 flex-row items-center gap-1">
                          <Text
                            variant="plain"
                            className="font-inter-semibold"
                            style={{ color: colors.ink.muted, fontSize: 16 }}
                          >
                            {row.stars}
                          </Text>
                          <Ionicons name="star" size={12} color={colors.ink.muted} />
                        </View>
                        <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F5F5F5]">
                          <View
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: colors.brand.DEFAULT,
                              width: `${Math.round((row.count / totalReviews) * 100)}%`,
                            }}
                          />
                        </View>
                        <Text
                          variant="plain"
                          className="font-inter-semibold w-4 text-center"
                          style={{ color: colors.ink.DEFAULT, fontSize: 14 }}
                        >
                          {row.count}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="flex-row items-start gap-2.5 rounded-lg border border-[#F5F5F5] bg-[#FCFCFC] p-4">
                  <Ionicons name="shield-checkmark-outline" size={24} color={colors.brand.DEFAULT} />
                  <Text
                    variant="plain"
                    className="flex-1 font-inter-semibold"
                    style={{ color: colors.ink.muted, fontSize: 14, lineHeight: 18 }}
                  >
                    As avaliações são de hóspedes verificados que realmente se hospedaram nesta propriedade.
                  </Text>
                </View>

                {listing.reviews.map((review) => (
                  <View
                    key={review.id}
                    className="gap-2 rounded-xl border border-[#F5F5F5] bg-[#FCFCFC] p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text variant="h6">{review.name}</Text>
                      <View
                        className="flex-row items-center gap-0.5 rounded-xl border border-[#F5F5F5] px-2 py-1"
                        style={{ backgroundColor: colors.brand.soft }}
                      >
                        <Ionicons name="star" size={20} color={colors.brand.DEFAULT} />
                        <Text
                          variant="plain"
                          style={{ color: colors.brand.DEFAULT, fontSize: 14 }}
                        >
                          {review.rating}
                        </Text>
                      </View>
                    </View>
                    <Text variant="p-s">{review.comment}</Text>
                    <Text variant="label-xs" style={{ color: colors.ink.soft }}>
                      {review.when}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View className="px-6 py-4">
        <Pressable
          onPress={() => goBook()}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5"
          style={{ backgroundColor: colors.brand.DEFAULT }}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text
            variant="plain"
            className="font-inter-semibold"
            style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 20 }}
          >
            Solicitar Reserva
          </Text>
        </Pressable>
      </View>
      <ImageLightbox
        images={galleryImages}
        index={galleryIndex}
        visible={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </Screen>
  );
}
