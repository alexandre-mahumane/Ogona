import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { discoverApi, type DiscoverSearchParams } from '@/lib/api/discover';
import {
  mapApiReview,
  mapCity,
  mapDiscoverCardToListing,
  mapPropertyDetail,
} from '@/lib/mappers/guest';

export const discoverKeys = {
  all: ['discover'] as const,
  home: () => [...discoverKeys.all, 'home'] as const,
  search: (params: DiscoverSearchParams) => [...discoverKeys.all, 'search', params] as const,
  cities: () => [...discoverKeys.all, 'cities'] as const,
  destinations: () => [...discoverKeys.all, 'destinations'] as const,
  property: (id: string) => [...discoverKeys.all, 'property', id] as const,
  room: (id: string) => [...discoverKeys.all, 'room', id] as const,
  favorites: () => [...discoverKeys.all, 'favorites'] as const,
};

export function useDiscoverHome() {
  return useQuery({
    queryKey: discoverKeys.home(),
    queryFn: async () => {
      const data = await discoverApi.home({ limit: 10 });
      return {
        nearYou: data.nearYou.map(mapDiscoverCardToListing),
        mostBooked: data.mostBooked.map(mapDiscoverCardToListing),
        cities: data.cities.map(mapCity),
      };
    },
  });
}

export function useDiscoverSearch(params: DiscoverSearchParams, enabled = true) {
  return useQuery({
    queryKey: discoverKeys.search(params),
    enabled,
    queryFn: async () => {
      const data = await discoverApi.search(params);
      return data.properties.map(mapDiscoverCardToListing);
    },
  });
}

export function useDiscoverCities() {
  return useQuery({
    queryKey: discoverKeys.cities(),
    queryFn: async () => {
      const cities = await discoverApi.cities();
      return cities.map(mapCity);
    },
  });
}

export function usePopularDestinations() {
  return useQuery({
    queryKey: discoverKeys.destinations(),
    queryFn: async () => {
      const destinations = await discoverApi.popularDestinations();
      return destinations.map((d) => d.name);
    },
  });
}

export function usePropertyDetail(id: string | undefined) {
  return useQuery({
    queryKey: discoverKeys.property(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const [property, reviewsData] = await Promise.all([
        discoverApi.property(id!),
        discoverApi.propertyReviews(id!, { limit: 10 }),
      ]);

      const roomsFull = await Promise.all(
        property.rooms.map((r) => discoverApi.room(r.id).catch(() => null)),
      );

      return mapPropertyDetail(
        property,
        reviewsData.reviews.map(mapApiReview),
        roomsFull.filter(Boolean) as NonNullable<(typeof roomsFull)[number]>[],
      );
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: discoverKeys.favorites(),
    queryFn: async () => {
      const properties = await discoverApi.favorites();
      return properties.map(mapDiscoverCardToListing);
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      favorite,
    }: {
      propertyId: string;
      favorite: boolean;
    }) => {
      if (favorite) {
        return discoverApi.removeFavorite(propertyId);
      }
      return discoverApi.addFavorite(propertyId);
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: discoverKeys.all }),
      ]);
    },
  });
}
