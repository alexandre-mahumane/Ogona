import { ApiError, apiClient, toQuery } from '@/lib/api/client';

export type CalendarDay = {
  date: string;
  status: 'available' | 'blocked' | 'booked' | string;
  priceOverride?: number | null;
};

export type RoomCalendar = {
  roomId: string;
  year: number;
  month: number;
  days: CalendarDay[];
};

export type RoomAvailability = {
  roomId: string;
  from: string;
  to: string;
  unavailableDates: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isReservationDateConflict(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return (
    message.includes('Já existe reserva') ||
    message.includes('datas bloqueadas')
  );
}

export function unavailableDatesFromError(error: unknown): string[] {
  if (!(error instanceof ApiError) || !isRecord(error.body)) return [];
  const payload = error.body.error;
  if (!isRecord(payload) || !isRecord(payload.details)) return [];
  const dates = payload.details.unavailableDates;
  if (!Array.isArray(dates)) return [];
  return dates.filter((day): day is string => typeof day === 'string');
}

export const calendarApi = {
  getAvailability(roomId: string, from: string, to: string) {
    return apiClient<{ availability: RoomAvailability }>(
      `/rooms/${roomId}/availability${toQuery({ from, to })}`,
      { auth: false },
    ).then((d) => d.availability);
  },

  get(roomId: string, year: number, month: number) {
    return apiClient<{ calendar: RoomCalendar }>(
      `/rooms/${roomId}/calendar${toQuery({ year, month })}`,
    ).then((d) => d.calendar);
  },

  block(roomId: string, from: string, to: string) {
    return apiClient(`/rooms/${roomId}/calendar/block`, {
      method: 'POST',
      body: { from, to },
    });
  },

  unblock(roomId: string, from: string, to: string) {
    return apiClient(`/rooms/${roomId}/calendar/unblock`, {
      method: 'POST',
      body: { from, to },
    });
  },

  setPrice(roomId: string, from: string, to: string, amount: number) {
    return apiClient(`/rooms/${roomId}/calendar/price`, {
      method: 'POST',
      body: { from, to, amount },
    });
  },
};
