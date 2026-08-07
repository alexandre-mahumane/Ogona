import type { InferSelectModel } from 'drizzle-orm';
import type { reservations } from '../db/schema';
import { formatDateOnly, todayUtc } from '../utils/dates';

export type Reservation = InferSelectModel<typeof reservations>;

/** Labels alinhados à UI do host / hóspede. */
export type ReservationDisplayStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'check_in_today'
  | 'check_out_today'
  | 'in_stay'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export function resolveReservationDisplayStatus(
  reservation: Pick<Reservation, 'status' | 'checkInDate' | 'checkOutDate'>,
  now = todayUtc(),
): ReservationDisplayStatus {
  if (reservation.status === 'pending') return 'pending';
  if (reservation.status === 'awaiting_payment') return 'awaiting_payment';
  if (reservation.status === 'rejected') return 'rejected';
  if (reservation.status === 'cancelled') return 'cancelled';
  if (reservation.status === 'completed') return 'completed';

  const checkIn = toDate(reservation.checkInDate);
  const checkOut = toDate(reservation.checkOutDate);
  const today = now.getTime();

  if (checkIn.getTime() === today) return 'check_in_today';
  if (checkOut.getTime() === today) return 'check_out_today';
  if (today > checkIn.getTime() && today < checkOut.getTime()) return 'in_stay';

  return 'confirmed';
}

function toDate(value: Date | string): Date {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
}

export function toPublicReservation(input: {
  reservation: Reservation;
  guestName: string;
  propertyName: string;
  roomName: string;
  thumbnailUrl?: string | null;
  hostWhatsapp?: string | null;
}) {
  const { reservation } = input;
  const displayStatus = resolveReservationDisplayStatus(reservation);

  const paymentExpiresAt = reservation.paymentExpiresAt?.toISOString() ?? null;
  const expiresInSeconds =
    reservation.status === 'awaiting_payment' && reservation.paymentExpiresAt
      ? Math.max(
          0,
          Math.floor((reservation.paymentExpiresAt.getTime() - Date.now()) / 1000),
        )
      : null;

  return {
    id: reservation.id,
    propertyId: reservation.propertyId,
    roomId: reservation.roomId,
    guestId: reservation.guestId,
    hostId: reservation.hostId,
    guestName: input.guestName,
    propertyName: input.propertyName,
    roomName: input.roomName,
    thumbnailUrl: input.thumbnailUrl ?? null,
    hostWhatsapp: input.hostWhatsapp ?? null,
    modality: reservation.modality,
    checkInDate: formatDateOnly(
      reservation.checkInDate instanceof Date
        ? reservation.checkInDate
        : new Date(reservation.checkInDate),
    ),
    checkOutDate: formatDateOnly(
      reservation.checkOutDate instanceof Date
        ? reservation.checkOutDate
        : new Date(reservation.checkOutDate),
    ),
    startTime: reservation.startTime,
    units: reservation.units,
    guestCount: reservation.guestCount,
    status: reservation.status,
    displayStatus,
    unitPrice: Number(reservation.unitPrice),
    subtotalAmount: Number(reservation.subtotalAmount),
    feePercent: Number(reservation.feePercent),
    feeAmount: Number(reservation.feeAmount),
    totalAmount: Number(reservation.totalAmount),
    currency: reservation.currency,
    paymentMethod: reservation.paymentMethod,
    paymentExpiresAt,
    expiresInSeconds,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  };
}
