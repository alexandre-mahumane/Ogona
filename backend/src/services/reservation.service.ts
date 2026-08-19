import { randomInt } from 'node:crypto';
import type {
  CreateReservationInput,
  ListReservationsQuery,
  PayReservationInput,
  QuoteReservationInput,
} from '../dtos/reservation.dto';
import { paymentRepository } from '../repositories/payment.repository';
import { propertyRepository } from '../repositories/property.repository';
import { toPublicReservation } from '../repositories/reservation.mappers';
import { reservationRepository } from '../repositories/reservation.repository';
import { roomRepository } from '../repositories/room.repository';
import { userRepository } from '../repositories/user.repository';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { formatDateOnly, toDateOnly } from '../utils/dates';
import {
  calculatePricing,
  computeCheckOutDate,
  DEFAULT_MODALITY_LIMITS,
} from '../utils/pricing';
import { calendarService } from './calendar.service';
import { activityService } from './activity.service';

const PAYMENT_WINDOW_HOURS = 24;

export class ReservationService {
  private async buildQuote(input: QuoteReservationInput) {
    const roomFull = await roomRepository.findById(input.roomId);
    if (!roomFull) throw new NotFoundError('Quarto não encontrado');

    const property = await propertyRepository.findById(roomFull.room.propertyId);
    if (!property || property.status !== 'published') {
      throw new NotFoundError('Propriedade não disponível');
    }

    if (roomFull.room.status !== 'disponivel') {
      throw new ConflictError('Quarto indisponível');
    }

    if (input.guestCount > roomFull.room.maxCapacity) {
      throw new ValidationError('Capacidade do quarto excedida');
    }

    const price = roomFull.prices.find((p) => p.modality === input.modality);
    if (!price) {
      throw new ValidationError('Modalidade não disponível neste quarto');
    }

    const defaults = DEFAULT_MODALITY_LIMITS[input.modality];
    const minUnits = price.minUnits ?? defaults.min;
    const maxUnits = price.maxUnits ?? defaults.max;
    if (input.units < minUnits || input.units > maxUnits) {
      throw new ValidationError(
        `Quantidade inválida (mín. ${minUnits} • máx. ${maxUnits})`,
      );
    }

    const checkIn = toDateOnly(input.checkInDate);
    const { checkOutDate, estimatedEndTime } = computeCheckOutDate(
      input.modality,
      checkIn,
      input.units,
      input.startTime,
    );

    const unavailableDates = await calendarService.listUnavailableDates(
      input.roomId,
      checkIn,
      checkOutDate,
    );
    const stayNights = unavailableDates.filter(
      (day) => day < formatDateOnly(checkOutDate),
    );
    if (stayNights.length > 0) {
      throw new ConflictError('Já existe reserva nestas datas', {
        unavailableDates: stayNights,
      });
    }

    const unitPrice = Number(price.amount);
    const pricing = calculatePricing(unitPrice, input.units);

    return {
      roomFull,
      property,
      price,
      checkIn,
      checkOutDate,
      estimatedEndTime,
      unitPrice,
      pricing,
      minUnits,
      maxUnits,
    };
  }

  async quote(input: QuoteReservationInput) {
    const q = await this.buildQuote(input);

    return {
      roomId: input.roomId,
      propertyId: q.property.id,
      propertyName: q.property.name,
      roomName: q.roomFull.room.name,
      modality: input.modality,
      checkInDate: input.checkInDate,
      checkOutDate: q.checkOutDate.toISOString().slice(0, 10),
      startTime: input.startTime ?? null,
      estimatedEndTime: q.estimatedEndTime ?? null,
      units: input.units,
      guestCount: input.guestCount,
      unitPrice: q.unitPrice,
      subtotalAmount: q.pricing.subtotal,
      feePercent: q.pricing.feePercent,
      feeAmount: q.pricing.feeAmount,
      totalAmount: q.pricing.total,
      currency: 'MZN',
      limits: { min: q.minUnits, max: q.maxUnits },
    };
  }

  async createAsGuest(guestId: string, input: CreateReservationInput) {
    const q = await this.buildQuote(input);

    const reservation = await reservationRepository.create({
      propertyId: q.property.id,
      roomId: input.roomId,
      guestId,
      hostId: q.property.hostId,
      modality: input.modality,
      checkInDate: q.checkIn,
      checkOutDate: q.checkOutDate,
      startTime: input.startTime,
      units: input.units,
      guestCount: input.guestCount,
      unitPrice: q.unitPrice.toFixed(2),
      subtotalAmount: q.pricing.subtotal.toFixed(2),
      feePercent: q.pricing.feePercent.toFixed(2),
      feeAmount: q.pricing.feeAmount.toFixed(2),
      totalAmount: q.pricing.total.toFixed(2),
    });

    const guest = await userRepository.findById(guestId);

    await activityService.log({
      hostId: q.property.hostId,
      type: 'reservation_created',
      title: 'Nova reserva',
      description: `${guest?.name ?? 'Hóspede'} · ${q.roomFull.room.name}`,
      metadata: { reservationId: reservation.id, roomId: q.roomFull.room.id },
    });

    return this.toGuestView(reservation.id);
  }

  async listForGuest(guestId: string, query: ListReservationsQuery) {
    const status =
      query.status && query.status !== 'all'
        ? (query.status as
            | 'pending'
            | 'awaiting_payment'
            | 'confirmed'
            | 'rejected'
            | 'cancelled'
            | 'completed')
        : undefined;

    const rows = await reservationRepository.listForGuest({
      guestId,
      status,
      search: query.search,
    });

    return rows.map((row) =>
      toPublicReservation({
        reservation: row.reservation,
        guestName: row.guestName,
        propertyName: row.propertyName,
        roomName: row.roomName,
        thumbnailUrl: row.coverImageUrl,
        hostWhatsapp: row.whatsapp ?? row.contactPhone,
      }),
    );
  }

  async getForGuest(guestId: string, reservationId: string) {
    return this.toGuestView(reservationId, guestId);
  }

  async listForHost(
    hostId: string,
    query: { status?: string; search?: string },
  ) {
    const status =
      query.status && query.status !== 'all'
        ? (query.status as
            | 'pending'
            | 'awaiting_payment'
            | 'confirmed'
            | 'rejected'
            | 'cancelled'
            | 'completed')
        : undefined;

    const rows = await reservationRepository.listForHost({
      hostId,
      status,
      search: query.search,
    });

    return rows.map((row) =>
      toPublicReservation({
        reservation: row.reservation,
        guestName: row.guestName,
        propertyName: row.propertyName,
        roomName: row.roomName,
        thumbnailUrl: row.coverImageUrl,
      }),
    );
  }

  async accept(hostId: string, reservationId: string) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation || reservation.hostId !== hostId) {
      throw new NotFoundError('Reserva não encontrada');
    }
    if (reservation.status !== 'pending') {
      throw new ConflictError('Reserva já foi decidida');
    }

    const paymentExpiresAt = new Date(
      Date.now() + PAYMENT_WINDOW_HOURS * 60 * 60 * 1000,
    );

    const updated = await reservationRepository.updateStatus(
      reservationId,
      'awaiting_payment',
      { paymentExpiresAt },
    );
    if (!updated) throw new NotFoundError('Reserva não encontrada');

    const reference = `OGN-${new Date().getUTCFullYear()}-${randomInt(1000, 9999)}`;
    await paymentRepository.create({
      reservationId,
      amount: reservation.totalAmount,
      reference,
      status: 'pending',
    });

    await activityService.log({
      hostId,
      type: 'reservation_accepted',
      title: 'Reserva aprovada',
      description: 'Aguardando pagamento do hóspede',
      metadata: { reservationId },
    });

    return this.getForHost(hostId, reservationId);
  }

  async reject(hostId: string, reservationId: string) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation || reservation.hostId !== hostId) {
      throw new NotFoundError('Reserva não encontrada');
    }
    if (reservation.status !== 'pending') {
      throw new ConflictError('Reserva já foi decidida');
    }

    const updated = await reservationRepository.updateStatus(reservationId, 'rejected');
    if (!updated) throw new NotFoundError('Reserva não encontrada');

    await activityService.log({
      hostId,
      type: 'reservation_rejected',
      title: 'Reserva rejeitada',
      description: reservationId,
      metadata: { reservationId },
    });

    return this.getForHost(hostId, reservationId);
  }

  async payAsGuest(guestId: string, reservationId: string, input: PayReservationInput) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation || reservation.guestId !== guestId) {
      throw new NotFoundError('Reserva não encontrada');
    }
    if (reservation.status !== 'awaiting_payment') {
      throw new ConflictError('Reserva não está aguardando pagamento');
    }

    if (
      reservation.paymentExpiresAt &&
      reservation.paymentExpiresAt.getTime() < Date.now()
    ) {
      await reservationRepository.updateStatus(reservationId, 'cancelled');
      throw new ConflictError('Prazo de pagamento expirado');
    }

    const payments = await paymentRepository.findByReservation(reservationId);
    const pending = payments.find((p) => p.status === 'pending') ?? payments[0];
    if (!pending) {
      throw new ConflictError('Pagamento não encontrado');
    }

    await paymentRepository.markPaid(pending.id, input.method);
    await reservationRepository.updateStatus(reservationId, 'confirmed', {
      paymentMethod: input.method,
      paymentExpiresAt: null,
    });

    await activityService.log({
      hostId: reservation.hostId,
      type: 'payment_received',
      title: 'Pagamento recebido',
      description: `${Number(reservation.totalAmount).toLocaleString('pt-MZ')} MZN · ${input.method}`,
      metadata: { reservationId, method: input.method },
    });

    return this.toGuestView(reservationId, guestId);
  }

  async cancelAsGuest(guestId: string, reservationId: string) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation || reservation.guestId !== guestId) {
      throw new NotFoundError('Reserva não encontrada');
    }
    if (!['pending', 'awaiting_payment', 'confirmed'].includes(reservation.status)) {
      throw new ConflictError('Não é possível cancelar esta reserva');
    }

    const updated = await reservationRepository.updateStatus(reservationId, 'cancelled');
    if (!updated) throw new NotFoundError('Reserva não encontrada');

    await activityService.log({
      hostId: reservation.hostId,
      type: 'reservation_cancelled',
      title: 'Reserva cancelada',
      description: reservationId,
      metadata: { reservationId },
    });

    return this.toGuestView(reservationId, guestId);
  }

  async getForHost(hostId: string, reservationId: string) {
    const rows = await reservationRepository.listForHost({ hostId });
    const match = rows.find((r) => r.reservation.id === reservationId);
    if (!match) throw new NotFoundError('Reserva não encontrada');

    return toPublicReservation({
      reservation: match.reservation,
      guestName: match.guestName,
      propertyName: match.propertyName,
      roomName: match.roomName,
      thumbnailUrl: match.coverImageUrl,
    });
  }

  async assertHostAccess(hostId: string, reservationId: string) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation || reservation.hostId !== hostId) {
      throw new ForbiddenError('Sem acesso a esta reserva');
    }
    return reservation;
  }

  private async toGuestView(reservationId: string, guestId?: string) {
    const detail = await reservationRepository.findDetailById(reservationId);
    if (!detail) throw new NotFoundError('Reserva não encontrada');
    if (guestId && detail.reservation.guestId !== guestId) {
      throw new NotFoundError('Reserva não encontrada');
    }

    return toPublicReservation({
      reservation: detail.reservation,
      guestName: detail.guestName,
      propertyName: detail.propertyName,
      roomName: detail.roomName,
      thumbnailUrl: detail.coverImageUrl,
      hostWhatsapp: detail.whatsapp ?? detail.contactPhone,
    });
  }
}

export const reservationService = new ReservationService();
