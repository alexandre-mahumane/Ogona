import type {
  CalendarAvailabilityQuery,
  CalendarDateRangeInput,
  CalendarMonthQuery,
  SetCalendarPriceInput,
} from '../dtos/calendar.dto';
import {
  calendarRepository,
  serializeCalendarDay,
} from '../repositories/calendar.repository';
import { propertyRepository } from '../repositories/property.repository';
import { reservationRepository } from '../repositories/reservation.repository';
import { roomRepository } from '../repositories/room.repository';
import {
  addDays,
  eachDateInclusive,
  endOfMonth,
  formatDateOnly,
  startOfMonth,
  toDateOnly,
  todayUtc,
} from '../utils/dates';
import { NotFoundError, ValidationError } from '../utils/errors';
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
      reservationRepository.listBlockingInRange(roomId, from, to),
    ]);

    const roomReservations = reservations;

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
      if (!['pending', 'awaiting_payment', 'confirmed', 'completed'].includes(reservation.status)) {
        continue;
      }

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

  async listUnavailableDates(roomId: string, from: Date, to: Date) {
    const [overrides, reservations] = await Promise.all([
      calendarRepository.listInRange(roomId, from, to),
      reservationRepository.listBlockingInRange(roomId, from, to),
    ]);

    const unavailable = new Set<string>();

    for (const row of overrides) {
      if (row.kind !== 'blocked') continue;
      unavailable.add(
        formatDateOnly(row.date instanceof Date ? row.date : new Date(row.date)),
      );
    }

    for (const reservation of reservations) {
      const checkIn = toDateOnly(reservation.checkInDate);
      const checkOut = toDateOnly(reservation.checkOutDate);
      for (const day of eachDateInclusive(checkIn, checkOut)) {
        const key = formatDateOnly(day);
        if (key !== formatDateOnly(checkOut)) {
          unavailable.add(key);
        }
      }
    }

    return [...unavailable].sort();
  }

  async getAvailability(roomId: string, query: CalendarAvailabilityQuery) {
    const full = await roomRepository.findById(roomId);
    if (!full) throw new NotFoundError('Quarto não encontrado');

    const property = await propertyRepository.findById(full.room.propertyId);
    if (!property || property.status !== 'published') {
      throw new NotFoundError('Propriedade não disponível');
    }

    const from = query.from ? toDateOnly(query.from) : todayUtc();
    const to = query.to ? toDateOnly(query.to) : addDays(from, 180);
    const spanDays = Math.round((to.getTime() - from.getTime()) / 86_400_000);
    if (spanDays > 366) {
      throw new ValidationError('O intervalo máximo é de 366 dias');
    }

    return {
      roomId,
      from: formatDateOnly(from),
      to: formatDateOnly(to),
      unavailableDates: await this.listUnavailableDates(roomId, from, to),
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
