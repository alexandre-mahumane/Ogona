import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityCard, ListingCard } from '@/components/guest/ListingCard';
import { SectionHeader } from '@/components/guest/GuestChrome';
import { categoryIcons, IconFilters } from '@/components/icons/HomeIcons';
import { Screen, Text } from '@/components/ui';
import { guestHome } from '@/data/guest.mock';
import { useDiscoverHome, type HomeCoords } from '@/hooks/useDiscover';
import { getCurrentCoords } from '@/lib/maps/geocode';
import { useFiltersStore } from '@/stores/filters.store';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';

const headerBg = require('../../../assets/home/header-bg.jpg');

const categoryType: Record<string, string | undefined> = {
  all: undefined,
  pensao: 'pensao',
  guest_house: 'casa',
  hotel: 'hotel',
};

export function GuestHomeView() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(guestHome.categories[0]?.id ?? 'all');
  const [coords, setCoords] = useState<HomeCoords | null>(null);
  const user = useAuthStore((s) => s.user);
  const startExplore = useFiltersStore((s) => s.startExplore);
  const home = useDiscoverHome(coords);

  useEffect(() => {
    let cancelled = false;
    void getCurrentCoords()
      .then((next) => {
        if (!cancelled && next) setCoords(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const greetingName = user?.name?.split(' ')[0] ?? guestHome.greetingName;
  const type = categoryType[category];
  const nearYou = useMemo(() => {
    const rows = home.data?.nearYou ?? [];
    if (!type) return rows;
    if (type === 'casa') {
      return rows.filter((l) => l.propertyType === 'casa' || l.propertyType === 'hostel');
    }
    return rows.filter((l) => l.propertyType === type);
  }, [home.data?.nearYou, type]);
  const mostBooked = useMemo(() => {
    const rows = home.data?.mostBooked ?? [];
    if (!type) return rows;
    if (type === 'casa') {
      return rows.filter((l) => l.propertyType === 'casa' || l.propertyType === 'hostel');
    }
    return rows.filter((l) => l.propertyType === type);
  }, [home.data?.mostBooked, type]);
  const cities = home.data?.cities ?? [];

  const openFilters = () => router.push('/(guest)/filters');
  const openExplore = (city?: string) => {
    if (city) {
      startExplore('city', city, { resetExtras: true });
    } else {
      startExplore('all', '', { resetExtras: true });
    }
    router.navigate('/(guest)/(tabs)/explore');
  };
  const openSearch = () => {
    startExplore('idle', '', { resetExtras: true });
    router.navigate('/(guest)/(tabs)/explore');
  };
  const openProperty = (id: string) =>
    router.push({ pathname: '/(guest)/property/[id]', params: { id } });

  return (
    <Screen
      scroll
      keyboard={false}
      edges={['left', 'right', 'bottom']}
      className="bg-[#FCFCFC]"
      contentClassName="pb-8"
    >
      <View className="overflow-hidden">
        <Image source={headerBg} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View
          className="gap-6 px-6 pb-4"
          style={{
            paddingTop: insets.top + 8,
            backgroundColor: 'rgba(255, 247, 237, 0.94)',
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 gap-1 pr-3">
              <Text variant="h5">Olá, {greetingName}</Text>
              <Text variant="p-s">{guestHome.subtitle}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable className="h-10 w-10 items-center justify-center rounded-full border border-[#F5F5F5] bg-surface">
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={colors.ink.secondary}
                />
              </Pressable>
              <View className="h-10 w-10 overflow-hidden rounded-full border border-surface-border">
                <Image
                  source={{ uri: user?.photoUrl ?? guestHome.avatar }}
                  style={{ width: 40, height: 40 }}
                />
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={openSearch}
              className="h-14 flex-1 flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface px-4"
            >
              <Ionicons name="search" size={20} color={colors.ink.secondary} />
              <Text
                variant="plain"
                className="font-inter text-p-s"
                style={{ color: colors.ink.soft }}
              >
                Cidade bairro ou alojamento
              </Text>
            </Pressable>
            <Pressable
              onPress={openFilters}
              className="h-14 flex-row items-center gap-2 rounded-xl border border-surface-border bg-surface px-4"
            >
              <IconFilters color={colors.ink.secondary} size={20} />
              <Text
                variant="plain"
                className="font-inter text-[14px] leading-[18px]"
                style={{ color: colors.ink.secondary }}
              >
                Filtros
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-10"
        contentContainerClassName="gap-3 px-6"
      >
        {guestHome.categories.map((item) => {
          const active = category === item.id;
          const Icon = categoryIcons[item.icon];
          return (
            <Pressable
              key={item.id}
              onPress={() => setCategory(item.id)}
              className={`h-[34px] flex-row items-center gap-1 rounded-full px-3 ${
                active
                  ? 'bg-brand'
                  : 'border border-surface-border bg-surface'
              }`}
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.02,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 6 },
                elevation: 1,
              }}
            >
              <Icon color={active ? '#FFFFFF' : colors.ink.secondary} size={14} />
              <Text
                variant="plain"
                className={
                  active
                    ? 'font-inter text-[14px] leading-[18px]'
                    : 'font-inter-semibold text-[14px] leading-[18px]'
                }
                style={{ color: active ? '#FFFFFF' : colors.ink.secondary }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {home.isLoading && !home.data ? (
        <View className="items-center py-16">
          <ActivityIndicator color={colors.brand.DEFAULT} />
        </View>
      ) : home.isError ? (
        <View className="gap-2 px-6 py-10">
          <Text variant="label-s">Não foi possível carregar o feed</Text>
          <Text variant="p-s">{home.error instanceof Error ? home.error.message : ''}</Text>
          <Pressable onPress={() => void home.refetch()} className="mt-2">
            <Text variant="plain" className="font-inter-semibold" style={{ color: colors.brand.DEFAULT }}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="mt-8 gap-8">
          <View className="gap-4">
            <View className="px-6">
              <SectionHeader
                title="Perto de si"
                onAction={nearYou.length >= 3 ? () => openExplore() : undefined}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-6"
            >
              {nearYou.length === 0 ? (
                <Text variant="p-s">Nenhum alojamento nesta categoria</Text>
              ) : (
                nearYou.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    variant="small"
                    onPress={() => openProperty(listing.id)}
                  />
                ))
              )}
            </ScrollView>
          </View>

          <View className="gap-4 px-6">
            <SectionHeader
              title="Mais reservados"
              onAction={mostBooked.length >= 3 ? () => openExplore() : undefined}
            />
            <View className="gap-3">
              {mostBooked.length === 0 ? (
                <Text variant="p-s">Nenhum alojamento nesta categoria</Text>
              ) : (
                mostBooked.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    variant="medium"
                    onPress={() => openProperty(listing.id)}
                  />
                ))
              )}
            </View>
          </View>

          <View className="gap-4">
            <View className="px-6">
              <SectionHeader
                title="Explore por cidade"
                onAction={cities.length >= 3 ? () => openExplore() : undefined}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-6"
            >
              {cities.map((city) => (
                <CityCard
                  key={city.id}
                  name={city.name}
                  count={city.count}
                  image={city.image}
                  onPress={() => openExplore(city.name)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </Screen>
  );
}
