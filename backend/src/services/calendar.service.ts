import type {
  CalendarDateRangeInput,
  CalendarMonthQuery,
  SetCalendarPriceInput,
} from '../dtos/calendar.dto';
import {
  calendarRepository,
  serializeCalendarDay,
} from '../repositories/calendar.repository';
import { reservationRepository } from '../repositories/reservation.repository';
import { roomRepository } from '../repositories/room.repository';
import { eachDateInclusive, endOfMonth, formatDateOnly, startOfMonth, toDateOnly } from '../utils/dates';
import { NotFoundError } from '../utils/errors';
import { propertyService } from './property.service';
import { db } from '../config/database';
import { eq } from 'drizzle-orm';
import { rooms } from '../db/schema';

export class CalendarService {
  private async assertRoomOwned(roomId: string, hostId: string) {
    const full = await roomRepository.findById(roomId);
    if (!full) throw new NotFoundError('Quarto não encontrado');
    await propertyService.assertOwnedByHost(full.room.propertyId, hostId);
    return full;
  }

  async getMonth(roomId: string, hostId: string, query: CalendarMonthQuery) {
    await this.assertRoomOwned(roomId, hostId);

    const from = startOfMonth(query.year, query.month);
    const to = endOfMonth(query.year, query.month);

    const [overrides, reservations] = await Promise.all([
      calendarRepository.listInRange(roomId, from, to),
      reservationRepository.listConfirmedInRange(
        hostId,
        from,
        // include checkout day markers in month
        to,
      ),
    ]);

    const roomReservations = reservations.filter((r) => r.roomId === roomId);

    const days: Record<
      string,
      {
        date: string;
        blocked: boolean;
        priceOverride: number | null;
        markers: Array<'check_in' | 'check_out' | 'reserved'>;
      }
    > = {};

    for (const day of eachDateInclusive(from, to)) {
      const key = formatDateOnly(day);
      days[key] = {
        date: key,
        blocked: false,
        priceOverride: null,
        markers: [],
      };
    }

    for (const row of overrides) {
      const key = formatDateOnly(row.date instanceof Date ? row.date : new Date(row.date));
      if (!days[key]) continue;
      if (row.kind === 'blocked') {
        days[key].blocked = true;
      }
      if (row.kind === 'price_override' && row.priceAmount != null) {
        days[key].priceOverride = Number(row.priceAmount);
      }
    }

    for (const reservation of roomReservations) {
      if (!['confirmed', 'completed'].includes(reservation.status)) continue;

      const checkIn = formatDateOnly(
        reservation.checkInDate instanceof Date
          ? reservation.checkInDate
          : new Date(reservation.checkInDate),
      );
      const checkOut = formatDateOnly(
        reservation.checkOutDate instanceof Date
          ? reservation.checkOutDate
          : new Date(reservation.checkOutDate),
      );

      if (days[checkIn]) days[checkIn].markers.push('check_in');
      if (days[checkOut]) days[checkOut].markers.push('check_out');

      for (const day of eachDateInclusive(
        toDateOnly(reservation.checkInDate),
        toDateOnly(reservation.checkOutDate),
      )) {
        const key = formatDateOnly(day);
        if (days[key] && key !== checkOut) {
          if (!days[key].markers.includes('reserved')) {
            days[key].markers.push('reserved');
          }
        }
      }
    }

    return {
      roomId,
      year: query.year,
      month: query.month,
      days: Object.values(days),
      overrides: overrides.map(serializeCalendarDay),
    };
  }

  async block(roomId: string, hostId: string, input: CalendarDateRangeInput) {
    await this.assertRoomOwned(roomId, hostId);
    const dates = eachDateInclusive(toDateOnly(input.from), toDateOnly(input.to));
    await calendarRepository.upsertBlocked(roomId, dates);
    return { roomId, blocked: dates.map(formatDateOnly) };
  }

  async unblock(roomId: string, hostId: string, input: CalendarDateRangeInput) {
    await this.assertRoomOwned(roomId, hostId);
    const dates = eachDateInclusive(toDateOnly(input.from), toDateOnly(input.to));
    await calendarRepository.removeBlocked(roomId, dates);
    return { roomId, unblocked: dates.map(formatDateOnly) };
  }

  async setPrice(roomId: string, hostId: string, input: SetCalendarPriceInput) {
    await this.assertRoomOwned(roomId, hostId);
    const dates = eachDateInclusive(toDateOnly(input.from), toDateOnly(input.to));
    await calendarRepository.upsertPriceOverride(roomId, dates, String(input.amount));
    return {
      roomId,
      amount: input.amount,
      dates: dates.map(formatDateOnly),
    };
  }

  async closeRoom(roomId: string, hostId: string) {
    await this.assertRoomOwned(roomId, hostId);
    const [room] = await db
      .update(rooms)
      .set({ status: 'indisponivel', updatedAt: new Date() })
      .where(eq(rooms.id, roomId))
      .returning();

    if (!room) throw new NotFoundError('Quarto não encontrado');
    return { id: room.id, status: room.status };
  }
}

export const calendarService = new CalendarService();
