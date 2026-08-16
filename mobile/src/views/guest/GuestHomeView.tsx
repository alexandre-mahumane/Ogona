import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { CityCard, ListingCard } from '@/components/guest/ListingCard';
import { SectionHeader } from '@/components/guest/GuestChrome';
import { Screen, Text } from '@/components/ui';
import { guestHome } from '@/data/guest.mock';
import { useDiscoverHome } from '@/hooks/useDiscover';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';

export function GuestHomeView() {
  const [category, setCategory] = useState(guestHome.categories[0]?.id ?? 'all');
  const user = useAuthStore((s) => s.user);
  const home = useDiscoverHome();

  const greetingName = user?.name?.split(' ')[0] ?? guestHome.greetingName;
  const nearYou = home.data?.nearYou ?? [];
  const mostBooked = home.data?.mostBooked ?? [];
  const cities = home.data?.cities ?? [];

  return (
    <Screen
      scroll
      keyboard={false}
      className="bg-[#FCFCFC]"
      contentClassName="pb-8"
    >
      <View
        className="gap-6 px-6 pb-4 pt-5"
        style={{ backgroundColor: 'rgba(255, 247, 237, 0.94)' }}
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
            onPress={() => router.push('/(guest)/(tabs)/explore')}
            className="h-14 flex-1 flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface px-4"
          >
            <Ionicons name="search" size={20} color={colors.ink.secondary} />
            <Text className="font-inter text-p-s text-ink-soft">
              Cidade bairro ou alojamento
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(guest)/filters')}
            className="h-14 flex-row items-center gap-2 rounded-xl border border-surface-border bg-surface px-4"
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={colors.ink.secondary}
            />
            <Text className="font-inter-semibold text-[13px] text-ink">
              Filtros
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        contentContainerClassName="gap-2 px-6"
      >
        {guestHome.categories.map((item) => {
          const active = category === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setCategory(item.id)}
              className={`h-10 flex-row items-center gap-2 rounded-full border px-4 ${
                active
                  ? 'border-brand bg-brand'
                  : 'border-surface-border bg-surface'
              }`}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={active ? '#FFFFFF' : colors.ink.secondary}
              />
              <Text
                className={`font-inter-semibold text-[12px] ${
                  active ? 'text-white' : 'text-ink-secondary'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {home.isLoading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={colors.brand.DEFAULT} />
        </View>
      ) : home.isError ? (
        <View className="gap-2 px-6 py-10">
          <Text variant="label-s">Não foi possível carregar o feed</Text>
          <Text variant="p-s">{home.error instanceof Error ? home.error.message : ''}</Text>
          <Pressable onPress={() => void home.refetch()} className="mt-2">
            <Text className="font-inter-semibold text-brand">Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <View className="mt-8 gap-8 px-6">
          <View className="gap-4">
            <SectionHeader
              title="Perto de si"
              onAction={() => router.push('/(guest)/(tabs)/explore')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3"
            >
              {nearYou.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  variant="small"
                  onPress={() => router.push(`/(guest)/property/${listing.id}`)}
                />
              ))}
            </ScrollView>
          </View>

          <View className="gap-4">
            <SectionHeader
              title="Mais reservados"
              onAction={() => router.push('/(guest)/(tabs)/explore')}
            />
            <View className="gap-3">
              {mostBooked.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  variant="medium"
                  onPress={() => router.push(`/(guest)/property/${listing.id}`)}
                />
              ))}
            </View>
          </View>

          <View className="gap-4">
            <SectionHeader
              title="Explore por cidade"
              onAction={() => router.push('/(guest)/(tabs)/explore')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3"
            >
              {cities.map((city) => (
                <CityCard
                  key={city.id}
                  name={city.name}
                  count={city.count}
                  image={city.image}
                  onPress={() => router.push('/(guest)/(tabs)/explore')}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </Screen>
  );
}
