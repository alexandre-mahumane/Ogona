import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { ListingCard } from '@/components/guest/ListingCard';
import { Screen, Text } from '@/components/ui';
import { recentSearches } from '@/data/guest.mock';
import {
  useDiscoverSearch,
  usePopularDestinations,
} from '@/hooks/useDiscover';
import { colors } from '@/theme/colors';

type ExploreState = 'idle' | 'typing' | 'results';

export function GuestExploreView() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [mode, setMode] = useState<ExploreState>('idle');

  const destinations = usePopularDestinations();
  const search = useDiscoverSearch(
    { q: submitted || query, limit: 30 },
    mode === 'typing' || mode === 'results',
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (search.data ?? []).filter((l) => l.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, search.data]);

  const results = search.data ?? [];
  const popular = destinations.data ?? [];

  const goResults = (nextQuery?: string) => {
    const value = (nextQuery ?? query).trim();
    if (nextQuery !== undefined) setQuery(nextQuery);
    setSubmitted(value);
    setMode('results');
  };

  const onChangeQuery = (value: string) => {
    setQuery(value);
    if (value.trim().length > 0) {
      setSubmitted(value.trim());
      setMode('typing');
    } else {
      setMode('idle');
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSubmitted('');
    setMode('idle');
  };

  return (
    <Screen
      scroll
      keyboard={false}
      className="bg-[#FCFCFC]"
      contentClassName="pb-24"
    >
      <View className="gap-6 px-6 pb-2 pt-5">
        <View className="h-14 flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface px-4">
          <Ionicons name="search" size={20} color={colors.ink.secondary} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            onSubmitEditing={() => {
              if (query.trim().length > 0) goResults();
            }}
            placeholder="Cidade bairro ou alojamento"
            placeholderTextColor={colors.ink.soft}
            returnKeyType="search"
            className="flex-1 font-inter text-p-s text-ink"
          />
          {query.length > 0 ? (
            <Pressable onPress={clearQuery} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.ink.soft} />
            </Pressable>
          ) : null}
        </View>

        {mode === 'idle' ? (
          <View className="gap-8">
            <View className="gap-3">
              <Text className="font-inter-semibold text-[10px] uppercase tracking-widest text-ink-soft">
                Pesquisas recentes
              </Text>
              <View className="gap-1">
                {recentSearches.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => goResults(item)}
                    className="flex-row items-center gap-3 py-3"
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-muted">
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={colors.ink.secondary}
                      />
                    </View>
                    <Text className="flex-1 font-inter text-[14px] text-ink">
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-3">
              <Text className="font-inter-semibold text-[10px] uppercase tracking-widest text-ink-soft">
                Destinos populares
              </Text>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {(popular.length ? popular : ['Maputo', 'Beira', 'Nampula']).map((city) => (
                  <Pressable
                    key={city}
                    onPress={() => goResults(city)}
                    className="h-11 w-[48%] flex-row items-center gap-2 rounded-full border border-surface-border bg-surface px-3"
                  >
                    <Ionicons
                      name="trending-up"
                      size={14}
                      color={colors.brand.DEFAULT}
                    />
                    <Text className="font-inter-semibold text-[13px] text-ink">
                      {city}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {mode === 'typing' ? (
          <View className="gap-3">
            <Text className="font-inter-semibold text-[10px] uppercase tracking-widest text-ink-soft">
              Sugestões
            </Text>
            {search.isLoading ? (
              <ActivityIndicator color={colors.brand.DEFAULT} />
            ) : (
              <View className="gap-1">
                {suggestions.map((listing) => (
                  <Pressable
                    key={listing.id}
                    onPress={() => router.push(`/(guest)/property/${listing.id}`)}
                    className="flex-row items-center gap-3 py-3"
                  >
                    <View className="h-11 w-11 overflow-hidden rounded-full border border-surface-border">
                      <Image
                        source={{ uri: listing.image }}
                        style={{ width: 44, height: 44 }}
                      />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text className="font-inter-semibold text-[14px] text-ink">
                        {listing.name}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color={colors.ink.muted}
                        />
                        <Text variant="p-xs">{listing.location}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#E5E5E5" />
                  </Pressable>
                ))}
                {suggestions.length === 0 ? (
                  <Text variant="p-s">Nenhuma sugestão encontrada</Text>
                ) : null}
              </View>
            )}
          </View>
        ) : null}

        {mode === 'results' ? (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-inter text-[13px] text-ink-soft">
                {results.length} resultado{results.length === 1 ? '' : 's'}
              </Text>
              <Pressable
                onPress={() => router.push('/(guest)/filters')}
                className="flex-row items-center gap-1.5"
              >
                <Ionicons
                  name="options-outline"
                  size={16}
                  color={colors.brand.DEFAULT}
                />
                <Text className="font-inter-semibold text-[13px] text-brand">
                  Filtrar
                </Text>
              </Pressable>
            </View>
            {search.isLoading ? (
              <ActivityIndicator color={colors.brand.DEFAULT} />
            ) : (
              <View className="gap-4">
                {results.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    variant="search"
                    onPress={() => router.push(`/(guest)/property/${listing.id}`)}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
