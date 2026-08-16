import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { dashboardApi } from '@/lib/api/dashboard';
import {
  propertiesApi,
  type CreatePropertyInput,
  type CreateRoomInput,
} from '@/lib/api/properties';
import { calendarApi } from '@/lib/api/calendar';
import { mapHostDashboard, mapHostPropertyCard, mapHostRoom } from '@/lib/mappers/host';
import { useAuthStore } from '@/stores/auth.store';

export const hostKeys = {
  dashboard: ['dashboard'] as const,
  properties: (params?: { status?: string; search?: string }) =>
    ['properties', params ?? {}] as const,
  property: (id: string) => ['properties', id] as const,
  catalogs: ['properties', 'catalogs'] as const,
  calendar: (roomId: string, year: number, month: number) =>
    ['calendar', roomId, year, month] as const,
};

export function useHostDashboard() {
  const name = useAuthStore((s) => s.user?.name) ?? 'Anfitrião';
  return useQuery({
    queryKey: hostKeys.dashboard,
    queryFn: async () => {
      const dashboard = await dashboardApi.get();
      return mapHostDashboard(dashboard, name.split(' ')[0] ?? name);
    },
  });
}

export function useHostProperties(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: hostKeys.properties(params),
    queryFn: async () => {
      const properties = await propertiesApi.list(params);
      return properties.map(mapHostPropertyCard);
    },
  });
}

export function useHostProperty(id: string | undefined) {
  return useQuery({
    queryKey: hostKeys.property(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const property = await propertiesApi.get(id!);
      return {
        property: mapHostPropertyCard(property),
        rooms: (property.rooms ?? []).map(mapHostRoom),
        raw: property,
      };
    },
  });
}

export function usePropertyCatalogs() {
  return useQuery({
    queryKey: hostKeys.catalogs,
    queryFn: () => propertiesApi.catalogs(),
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePropertyInput) => propertiesApi.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useCreateRoom(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoomInput) => propertiesApi.createRoom(propertyId, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: hostKeys.property(propertyId) });
      await qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function usePublishProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertiesApi.updateStatus(id, 'published'),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreatePropertyInput>;
    }) => propertiesApi.update(id, input),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['properties'] });
      await qc.invalidateQueries({ queryKey: hostKeys.property(vars.id) });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertiesApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['properties'] });
      await qc.invalidateQueries({ queryKey: hostKeys.dashboard });
    },
  });
}

export function useRoomCalendar(roomId: string | undefined, year: number, month: number) {
  return useQuery({
    queryKey: hostKeys.calendar(roomId ?? '', year, month),
    enabled: Boolean(roomId),
    queryFn: () => calendarApi.get(roomId!, year, month),
  });
}

export function useBlockCalendarDates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      from,
      to,
    }: {
      roomId: string;
      from: string;
      to: string;
    }) => calendarApi.block(roomId, from, to),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['calendar', vars.roomId] });
    },
  });
}

export function useUnblockCalendarDates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      from,
      to,
    }: {
      roomId: string;
      from: string;
      to: string;
    }) => calendarApi.unblock(roomId, from, to),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['calendar', vars.roomId] });
    },
  });
}

export function useSetCalendarPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      from,
      to,
      amount,
    }: {
      roomId: string;
      from: string;
      to: string;
      amount: number;
    }) => calendarApi.setPrice(roomId, from, to, amount),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['calendar', vars.roomId] });
    },
  });
}
