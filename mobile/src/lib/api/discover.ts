import { apiClient, toQuery } from '@/lib/api/client';
import type {
  DiscoverCard,
  DiscoverCity,
  DiscoverHome,
  DiscoverPropertyDetail,
  DiscoverRoomDetail,
} from '@/lib/api/types';

export type DiscoverSearchParams = {
  q?: string;
  city?: string;
  type?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  minBathrooms?: number;
  minParking?: number;
  lat?: number;
  lng?: number;
  sort?: 'relevance' | 'distance' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
  limit?: number;
  offset?: number;
};

export type PropertyReviewsResult = {
  summary: { average: number; total: number };
  reviews: {
    id: string;
    guestName: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    verified: boolean;
  }[];
};

export const discoverApi = {
  home(params?: { lat?: number; lng?: number; limit?: number }) {
    return apiClient<DiscoverHome>(`/discover/home${toQuery(params ?? {})}`, {
      auth: true,
    });
  },

  search(params: DiscoverSearchParams = {}) {
    return apiClient<{ properties: DiscoverCard[]; meta: { limit: number; offset: number; count: number } }>(
      `/discover/properties${toQuery(params)}`,
    );
  },

  cities() {
    return apiClient<{ cities: DiscoverCity[] }>('/discover/cities', { auth: false }).then(
      (d) => d.cities,
    );
  },

  popularDestinations() {
    return apiClient<{
      destinations: { name: string; propertiesCount: number; coverImageUrl: string | null }[];
    }>('/discover/popular-destinations', { auth: false }).then((d) => d.destinations);
  },

  property(id: string) {
    return apiClient<{ property: DiscoverPropertyDetail }>(`/discover/properties/${id}`).then(
      (d) => d.property,
    );
  },

  room(roomId: string) {
    return apiClient<{ room: DiscoverRoomDetail }>(`/discover/rooms/${roomId}`, {
      auth: false,
    }).then((d) => d.room);
  },

  propertyReviews(id: string, params?: { rating?: number; limit?: number; offset?: number }) {
    return apiClient<PropertyReviewsResult>(
      `/discover/properties/${id}/reviews${toQuery(params ?? {})}`,
      { auth: false },
    );
  },

  favorites() {
    return apiClient<{ properties: DiscoverCard[] }>('/discover/favorites').then(
      (d) => d.properties,
    );
  },

  addFavorite(propertyId: string) {
    return apiClient<{ propertyId: string; favorited: boolean }>(
      `/discover/favorites/${propertyId}`,
      { method: 'POST' },
    );
  },

  removeFavorite(propertyId: string) {
    return apiClient<{ propertyId: string; favorited: boolean }>(
      `/discover/favorites/${propertyId}`,
      { method: 'DELETE' },
    );
  },
};
