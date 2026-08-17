import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  reservationsApi,
  type CreateReservationInput,
  type QuoteInput,
} from '@/lib/api/reservations';
import { mapGuestReservation } from '@/lib/mappers/guest';
import { mapHostReservation } from '@/lib/mappers/host';
import { discoverKeys } from '@/hooks/useDiscover';

export const reservationKeys = {
  all: ['reservations'] as const,
  mine: (params?: { status?: string; search?: string }) =>
    [...reservationKeys.all, 'mine', params ?? {}] as const,
  mineDetail: (id: string) => [...reservationKeys.all, 'mine', id] as const,
  host: (params?: { status?: string; search?: string }) =>
    [...reservationKeys.all, 'host', params ?? {}] as const,
};

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
