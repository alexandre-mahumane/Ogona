import { and, count, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { db } from '../config/database';
import {
  payments,
  properties,
  reservations,
  roomImages,
  rooms,
  users,
} from '../db/schema';
import type { Reservation } from './reservation.mappers';

export type CreateReservationData = {
  propertyId: string;
  roomId: string;
  guestId: string;
  hostId: string;
  modality: Reservation['modality'];
  checkInDate: Date;
  checkOutDate: Date;
  startTime?: string;
  units: number;
  guestCount: number;
  unitPrice: string;
  subtotalAmount: string;
  feePercent: string;
  feeAmount: string;
  totalAmount: string;
};

export class ReservationRepository {
  async create(data: CreateReservationData) {
    const [row] = await db
      .insert(reservations)
      .values({
        propertyId: data.propertyId,
        roomId: data.roomId,
        guestId: data.guestId,
        hostId: data.hostId,
        modality: data.modality,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        startTime: data.startTime,
        units: data.units,
        guestCount: data.guestCount,
        unitPrice: data.unitPrice,
        subtotalAmount: data.subtotalAmount,
        feePercent: data.feePercent,
        feeAmount: data.feeAmount,
        totalAmount: data.totalAmount,
        status: 'pending',
      })
      .returning();

    if (!row) throw new Error('Failed to create reservation');
    return row;
  }

  async findById(id: string) {
    const [row] = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
    return row ?? null;
  }

  async findDetailById(id: string) {
    const [row] = await db
      .select({
        reservation: reservations,
        guestName: users.name,
        propertyName: properties.name,
        roomName: rooms.name,
        coverImageUrl: properties.coverImageUrl,
        contactPhone: properties.contactPhone,
        whatsapp: properties.whatsapp,
      })
      .from(reservations)
      .innerJoin(users, eq(users.id, reservations.guestId))
      .innerJoin(properties, eq(properties.id, reservations.propertyId))
      .innerJoin(rooms, eq(rooms.id, reservations.roomId))
      .where(eq(reservations.id, id))
      .limit(1);

    return row ?? null;
  }

  async updateStatus(
    id: string,
    status: Reservation['status'],
    extra?: {
      paymentExpiresAt?: Date | null;
      paymentMethod?: Reservation['paymentMethod'];
    },
  ) {
    const [row] = await db
      .update(reservations)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === 'awaiting_payment' || status === 'rejected'
          ? { decidedAt: new Date() }
          : {}),
        ...(extra?.paymentExpiresAt !== undefined
          ? { paymentExpiresAt: extra.paymentExpiresAt }
          : {}),
        ...(extra?.paymentMethod !== undefined
          ? { paymentMethod: extra.paymentMethod }
          : {}),
      })
      .where(eq(reservations.id, id))
      .returning();

    return row ?? null;
  }

  async listForHost(input: {
    hostId: string;
    status?: Reservation['status'];
    search?: string;
  }) {
    const conditions = [eq(reservations.hostId, input.hostId)];

    if (input.status) {
      conditions.push(eq(reservations.status, input.status));
    }

    if (input.search?.trim()) {
      const q = `%${input.search.trim()}%`;
      conditions.push(or(ilike(users.name, q), ilike(properties.name, q))!);
    }

    return db
      .select({
        reservation: reservations,
        guestName: users.name,
        propertyName: properties.name,
        roomName: rooms.name,
        coverImageUrl: properties.coverImageUrl,
      })
      .from(reservations)
      .innerJoin(users, eq(users.id, reservations.guestId))
      .innerJoin(properties, eq(properties.id, reservations.propertyId))
      .innerJoin(rooms, eq(rooms.id, reservations.roomId))
      .where(and(...conditions))
      .orderBy(desc(reservations.createdAt));
  }

  async listForGuest(input: {
    guestId: string;
    status?: Reservation['status'];
    search?: string;
  }) {
    const conditions = [eq(reservations.guestId, input.guestId)];

    if (input.status) {
      conditions.push(eq(reservations.status, input.status));
    }

    if (input.search?.trim()) {
      const q = `%${input.search.trim()}%`;
      conditions.push(or(ilike(properties.name, q), ilike(rooms.name, q))!);
    }

    return db
      .select({
        reservation: reservations,
        guestName: users.name,
        propertyName: properties.name,
        roomName: rooms.name,
        coverImageUrl: properties.coverImageUrl,
        contactPhone: properties.contactPhone,
        whatsapp: properties.whatsapp,
      })
      .from(reservations)
      .innerJoin(users, eq(users.id, reservations.guestId))
      .innerJoin(properties, eq(properties.id, reservations.propertyId))
      .innerJoin(rooms, eq(rooms.id, reservations.roomId))
      .where(and(...conditions))
      .orderBy(desc(reservations.createdAt));
  }

  async listPendingForHost(hostId: string, limit = 10) {
    return db
      .select({
        reservation: reservations,
        guestName: users.name,
        propertyName: properties.name,
        roomName: rooms.name,
        coverImageUrl: properties.coverImageUrl,
      })
      .from(reservations)
      .innerJoin(users, eq(users.id, reservations.guestId))
      .innerJoin(properties, eq(properties.id, reservations.propertyId))
      .innerJoin(rooms, eq(rooms.id, reservations.roomId))
      .where(and(eq(reservations.hostId, hostId), eq(reservations.status, 'pending')))
      .orderBy(desc(reservations.createdAt))
      .limit(limit);
  }

  async countByHost(hostId: string) {
    const [row] = await db
      .select({ value: count() })
      .from(reservations)
      .where(eq(reservations.hostId, hostId));
    return row?.value ?? 0;
  }

  async countPendingByHost(hostId: string) {
    const [row] = await db
      .select({ value: count() })
      .from(reservations)
      .where(and(eq(reservations.hostId, hostId), eq(reservations.status, 'pending')));
    return row?.value ?? 0;
  }

  async countByProperty(propertyId: string) {
    const [row] = await db
      .select({ value: count() })
      .from(reservations)
      .where(eq(reservations.propertyId, propertyId));
    return row?.value ?? 0;
  }

  async findOverlapping(input: {
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    excludeId?: string;
  }) {
    const conditions = [
      eq(reservations.roomId, input.roomId),
      inArray(reservations.status, ['pending', 'awaiting_payment', 'confirmed']),
      sql`${reservations.checkInDate} < ${input.checkOut}`,
      sql`${reservations.checkOutDate} > ${input.checkIn}`,
    ];

    if (input.excludeId) {
      conditions.push(sql`${reservations.id} <> ${input.excludeId}`);
    }

    const rows = await db
      .select()
      .from(reservations)
      .where(and(...conditions))
      .limit(1);

    return rows[0] ?? null;
  }

  async listBlockingInRange(roomId: string, from: Date, to: Date) {
    return db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.roomId, roomId),
          inArray(reservations.status, ['pending', 'awaiting_payment', 'confirmed']),
          sql`${reservations.checkInDate} < ${to}`,
          sql`${reservations.checkOutDate} > ${from}`,
        ),
      );
  }

  async listConfirmedInRange(hostId: string, from: Date, to: Date) {
    return db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.hostId, hostId),
          inArray(reservations.status, ['confirmed', 'completed']),
          lte(reservations.checkInDate, to),
          gte(reservations.checkOutDate, from),
        ),
      );
  }

  async firstRoomImage(roomId: string) {
    const [img] = await db
      .select()
      .from(roomImages)
      .where(eq(roomImages.roomId, roomId))
      .orderBy(roomImages.sortOrder)
      .limit(1);
    return img?.url ?? null;
  }

  async paidRevenueBetween(hostId: string, from: Date, to: Date) {
    const [row] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .innerJoin(reservations, eq(reservations.id, payments.reservationId))
      .where(
        and(
          eq(reservations.hostId, hostId),
          eq(payments.status, 'paid'),
          gte(payments.paidAt, from),
          lte(payments.paidAt, to),
        ),
      );

    return Number(row?.total ?? 0);
  }

  async paidRevenueByProperty(propertyId: string) {
    const [row] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .innerJoin(reservations, eq(reservations.id, payments.reservationId))
      .where(and(eq(reservations.propertyId, propertyId), eq(payments.status, 'paid')));

    return Number(row?.total ?? 0);
  }
}

export const reservationRepository = new ReservationRepository();
