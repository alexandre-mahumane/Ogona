import type { bookingModalityValues } from '../dtos/room.dto';
import { addDays, toDateOnly } from './dates';

export type BookingModality = (typeof bookingModalityValues)[number];

export const DEFAULT_MODALITY_LIMITS: Record<
  BookingModality,
  { min: number; max: number }
> = {
  hora: { min: 2, max: 12 },
  noite: { min: 1, max: 30 },
  semana: { min: 1, max: 12 },
  mes: { min: 1, max: 12 },
};

export const OGONA_FEE_PERCENT = 3.3;

export function calculatePricing(unitPrice: number, units: number, feePercent = OGONA_FEE_PERCENT) {
  const subtotal = Number((unitPrice * units).toFixed(2));
  /** Taxa Ogona arredondada ao metical (UI mostra inteiros). */
  const feeAmount = Math.round((subtotal * feePercent) / 100);
  const total = Number((subtotal + feeAmount).toFixed(2));
  return { subtotal, feePercent, feeAmount, total };
}

export function computeCheckOutDate(
  modality: BookingModality,
  checkInDate: Date | string,
  units: number,
  startTime?: string,
): { checkOutDate: Date; estimatedEndTime?: string } {
  const checkIn = toDateOnly(checkInDate);

  if (modality === 'hora') {
    const [hh, mm] = (startTime ?? '09:00').split(':').map(Number) as [number, number];
    const startMinutes = hh * 60 + mm;
    const endMinutes = startMinutes + units * 60;
    const extraDays = Math.floor(endMinutes / (24 * 60));
    const rem = endMinutes % (24 * 60);
    const endH = String(Math.floor(rem / 60)).padStart(2, '0');
    const endM = String(rem % 60).padStart(2, '0');
    // Ocupa pelo menos 1 dia no calendário (checkout exclusivo).
    return {
      checkOutDate: addDays(checkIn, Math.max(extraDays, 1)),
      estimatedEndTime: `${endH}:${endM}`,
    };
  }

  if (modality === 'noite') {
    return { checkOutDate: addDays(checkIn, units) };
  }
  if (modality === 'semana') {
    return { checkOutDate: addDays(checkIn, units * 7) };
  }
  return { checkOutDate: addDays(checkIn, units * 30) };
}

export const POPULAR_DESTINATIONS = [
  'Maputo',
  'Beira',
  'Nampula',
  'Pemba',
  'Inhambane',
  'Tete',
] as const;
