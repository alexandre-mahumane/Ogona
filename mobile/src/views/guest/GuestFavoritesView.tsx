import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { ListingCard } from '@/components/guest/ListingCard';
import { Button, Screen, Text } from '@/components/ui';
import { useFavorites } from '@/hooks/useDiscover';
import { colors } from '@/theme/colors';

export function GuestFavoritesView() {
  const favoritesQuery = useFavorites();
  const favorites = favoritesQuery.data ?? [];

  return (
    <Screen
      scroll
      keyboard={false}
      className="bg-[#FCFCFC]"
      contentClassName="pb-8"
    >
      <View className="border-b border-[#F5F5F5] bg-surface px-6 pb-4 pt-5">
        <Text variant="h5">Favoritos</Text>
      </View>

      {favoritesQuery.isLoading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={colors.brand.DEFAULT} />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 px-8 pt-24">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
            <Ionicons name="heart" size={32} color="#D4D4D4" />
          </View>
          <View className="items-center gap-2">
            <Text className="font-manrope text-h5 text-ink">
              Sem favoritos ainda
            </Text>
            <Text className="text-center font-inter text-p-s text-ink-muted">
              Toque no coração para guardar os alojamentos que mais gosta.
            </Text>
          </View>
          <Button
            className="mt-2 w-full"
            onPress={() => router.push('/(guest)/(tabs)/explore')}
          >
            Explorar alojamentos
          </Button>
        </View>
      ) : (
        <View className="gap-4 px-6 pt-6">
          {favorites.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={{ ...listing, favorite: true }}
              variant="search"
              onPress={() =>
                router.push({
                  pathname: '/(guest)/property/[id]',
                  params: { id: listing.id },
                })
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
