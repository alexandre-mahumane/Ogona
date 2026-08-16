import { apiClient, toQuery } from '@/lib/api/client';
import type {
  ApiReservation,
  BookingModality,
  QuoteResult,
} from '@/lib/api/types';

export type QuoteInput = {
  roomId: string;
  modality: BookingModality;
  checkInDate: string;
  startTime?: string;
  units: number;
  guestCount?: number;
};

export type CreateReservationInput = QuoteInput;

export const reservationsApi = {
  quote(input: QuoteInput) {
    return apiClient<{ quote: QuoteResult }>('/reservations/quote', {
      method: 'POST',
      body: input,
    }).then((d) => d.quote);
  },

  create(input: CreateReservationInput) {
    return apiClient<{ reservation: ApiReservation }>('/reservations/', {
      method: 'POST',
      body: input,
    }).then((d) => d.reservation);
  },

  mine(params?: { status?: string; search?: string }) {
    return apiClient<{ reservations: ApiReservation[] }>(
      `/reservations/mine${toQuery(params ?? {})}`,
    ).then((d) => d.reservations);
  },

  mineById(id: string) {
    return apiClient<{ reservation: ApiReservation }>(`/reservations/mine/${id}`).then(
      (d) => d.reservation,
    );
  },

  pay(id: string, method: 'm_pesa' | 'e_mola') {
    return apiClient<{ reservation: ApiReservation }>(`/reservations/${id}/pay`, {
      method: 'POST',
      body: { method },
    }).then((d) => d.reservation);
  },

  cancel(id: string) {
    return apiClient<{ reservation: ApiReservation }>(`/reservations/${id}/cancel`, {
      method: 'POST',
    }).then((d) => d.reservation);
  },

  hostList(params?: { status?: string; search?: string }) {
    return apiClient<{ reservations: ApiReservation[] }>(
      `/reservations${toQuery(params ?? {})}`,
    ).then((d) => d.reservations);
  },

  hostById(id: string) {
    return apiClient<{ reservation: ApiReservation }>(`/reservations/${id}`).then(
      (d) => d.reservation,
    );
  },

  accept(id: string) {
    return apiClient<{ reservation: ApiReservation }>(`/reservations/${id}/accept`, {
      method: 'POST',
    }).then((d) => d.reservation);
  },

  reject(id: string) {
    return apiClient<{ reservation: ApiReservation }>(`/reservations/${id}/reject`, {
      method: 'POST',
    }).then((d) => d.reservation);
  },
};
