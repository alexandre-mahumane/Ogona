import { apiClient, toQuery } from '@/lib/api/client';

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

export const calendarApi = {
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
