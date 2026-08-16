import { apiClient, toQuery } from '@/lib/api/client';
import type { BookingModality, HostProperty, HostRoom } from '@/lib/api/types';

export type CreatePropertyInput = {
  name: string;
  type: string;
  description: string;
  contactPhone: string;
  whatsapp?: string;
  coverImageUrl?: string;
  province: string;
  city: string;
  community?: string;
  neighborhood: string;
  address: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  bathrooms?: number;
  parkingSpots?: number;
  houseRules?: string[];
};

export type CreateRoomInput = {
  name: string;
  type: string;
  status?: string;
  description: string;
  maxCapacity: number;
  bedLabel?: string;
  modalities: BookingModality[];
  prices: Partial<Record<BookingModality, number>>;
  amenities?: string[];
  images?: string[];
};

export type PropertyCatalogs = {
  provinces: string[];
  communities: string[];
  propertyTypes: string[];
  propertyStatuses: string[];
  roomTypes: string[];
  roomStatuses: string[];
  bookingModalities: string[];
  amenities: string[];
  reservationStatuses: string[];
};

export const propertiesApi = {
  catalogs() {
    return apiClient<PropertyCatalogs>('/properties/catalogs');
  },

  list(params?: { status?: string; search?: string }) {
    return apiClient<{ properties: HostProperty[] }>(
      `/properties${toQuery(params ?? {})}`,
    ).then((d) => d.properties);
  },

  get(id: string) {
    return apiClient<{ property: HostProperty }>(`/properties/${id}`).then((d) => d.property);
  },

  create(input: CreatePropertyInput) {
    return apiClient<{ property: HostProperty }>('/properties/', {
      method: 'POST',
      body: input,
    }).then((d) => d.property);
  },

  update(id: string, input: Partial<CreatePropertyInput>) {
    return apiClient<{ property: HostProperty }>(`/properties/${id}`, {
      method: 'PATCH',
      body: input,
    }).then((d) => d.property);
  },

  updateStatus(id: string, status: string) {
    return apiClient<{ property: HostProperty }>(`/properties/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }).then((d) => d.property);
  },

  remove(id: string) {
    return apiClient<{ ok?: boolean }>(`/properties/${id}`, { method: 'DELETE' });
  },

  listRooms(propertyId: string) {
    return apiClient<{ rooms: HostRoom[] }>(`/properties/${propertyId}/rooms`).then(
      (d) => d.rooms,
    );
  },

  createRoom(propertyId: string, input: CreateRoomInput) {
    return apiClient<{ room: HostRoom }>(`/properties/${propertyId}/rooms`, {
      method: 'POST',
      body: input,
    }).then((d) => d.room);
  },

  getRoom(roomId: string) {
    return apiClient<{ room: HostRoom }>(`/properties/rooms/${roomId}`).then((d) => d.room);
  },
};
