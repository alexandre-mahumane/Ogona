import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { discoverKeys } from '@/hooks/useDiscover';
import { calendarApi } from '@/lib/api/calendar';
import { ApiError } from '@/lib/api/client';
import {
  reservationsApi,
  type CreateReservationInput,
  type QuoteInput,
} from '@/lib/api/reservations';
import { mapGuestReservation } from '@/lib/mappers/guest';
import { mapHostReservation } from '@/lib/mappers/host';

export const reservationKeys = {
  all: ['reservations'] as const,
  mine: (params?: { status?: string; search?: string }) =>
    [...reservationKeys.all, 'mine', params ?? {}] as const,
  mineDetail: (id: string) => [...reservationKeys.all, 'mine', id] as const,
  host: (params?: { status?: string; search?: string }) =>
    [...reservationKeys.all, 'host', params ?? {}] as const,
  availability: (roomId: string, from: string, to: string) =>
    ['availability', roomId, from, to] as const,
};

export function useRoomAvailability(roomId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: reservationKeys.availability(roomId ?? '', from, to),
    enabled: Boolean(roomId),
    retry: false,
    queryFn: async () => {
      try {
        return await calendarApi.getAvailability(roomId!, from, to);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
          return {
            roomId: roomId!,
            from,
            to,
            unavailableDates: [] as string[],
          };
        }
        throw error;
      }
    },
  });
}

export function useGuestReservations(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: reservationKeys.mine(params),
    queryFn: async () => {
      const rows = await reservationsApi.mine(params);
      return rows.map(mapGuestReservation);
    },
  });
}

export function useGuestReservation(id: string | undefined) {
  return useQuery({
    queryKey: reservationKeys.mineDetail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const row = await reservationsApi.mineById(id!);
      return mapGuestReservation(row);
    },
  });
}

export function useReservationQuote() {
  return useMutation({
    mutationFn: (input: QuoteInput) => reservationsApi.quote(input),
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReservationInput) => reservationsApi.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: reservationKeys.all });
      await qc.invalidateQueries({ queryKey: ['availability'] });
      await qc.invalidateQueries({ queryKey: discoverKeys.all });
    },
  });
}

export function usePayReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: 'm_pesa' | 'e_mola' }) =>
      reservationsApi.pay(id, method),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

export function useHostReservations(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: reservationKeys.host(params),
    queryFn: async () => {
      const rows = await reservationsApi.hostList(params);
      return rows.map(mapHostReservation);
    },
  });
}

export function useHostReservation(id: string | undefined) {
  return useQuery({
    queryKey: [...reservationKeys.host(), id ?? ''],
    enabled: Boolean(id),
    queryFn: async () => {
      const row = await reservationsApi.hostById(id!);
      return mapHostReservation(row);
    },
  });
}

export function useAcceptReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.accept(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationKeys.all }),
        qc.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
}

export function useRejectReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.reject(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationKeys.all }),
        qc.invalidateQueries({ queryKey: ['dashboard'] }),
        qc.invalidateQueries({ queryKey: discoverKeys.all }),
      ]);
    },
  });
}
