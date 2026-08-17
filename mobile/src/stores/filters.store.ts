import { create } from 'zustand';

import type { DiscoverSearchParams } from '@/lib/api/discover';

export type FiltersState = {
  destination: string;
  types: string[];
  rating: string;
  priceMin: string;
  priceMax: string;
  modality: string;
  rooms: string;
  baths: string;
  parking: string;
};

export const defaultFilters: FiltersState = {
  destination: '',
  types: [],
  rating: 'all',
  priceMin: '',
  priceMax: '',
  modality: 'night',
  rooms: '1+',
  baths: '1+',
  parking: 'none',
};

function parsePlus(value: string) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function filtersToSearchParams(f: FiltersState): DiscoverSearchParams {
  return {
    q: f.destination.trim() || undefined,
    type: f.types.length === 1 ? f.types[0] : undefined,
    minRating: f.rating === 'all' ? undefined : Number(f.rating),
    minPrice: f.priceMin ? Number(f.priceMin) : undefined,
    maxPrice: f.priceMax ? Number(f.priceMax) : undefined,
    minRooms: f.rooms === '1+' ? undefined : parsePlus(f.rooms),
    minBathrooms: f.baths === '1+' ? undefined : parsePlus(f.baths),
    minParking: f.parking === 'none' ? undefined : Number(f.parking),
  };
}

export function filtersAreActive(f: FiltersState) {
  return (
    f.destination.trim().length > 0 ||
    f.types.length > 0 ||
    f.rating !== 'all' ||
    f.priceMin !== '' ||
    f.priceMax !== '' ||
    f.rooms !== '1+' ||
    f.baths !== '1+' ||
    f.parking !== 'none'
  );
}

type Store = {
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  patchFilters: (partial: Partial<FiltersState>) => void;
  clearFilters: () => void;
};

export const useFiltersStore = create<Store>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set({ filters }),
  patchFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  clearFilters: () => set({ filters: defaultFilters }),
}));
