import { and, count, eq, ilike, sql } from 'drizzle-orm';
import { db } from '../config/database';
import { properties, rooms } from '../db/schema';
import type { CreatePropertyInput } from '../dtos/property.dto';

export class PropertyRepository {
  async create(hostId: string, input: CreatePropertyInput) {
    const [property] = await db
      .insert(properties)
      .values({
        hostId,
        name: input.name,
        type: input.type,
        description: input.description,
        contactPhone: input.contactPhone,
        whatsapp: input.whatsapp,
        coverImageUrl: input.coverImageUrl,
        province: input.province,
        city: input.city,
        community: input.community,
        neighborhood: input.neighborhood,
        address: input.address,
        postalCode: input.postalCode,
        latitude: input.latitude,
        longitude: input.longitude,
        bathrooms: input.bathrooms,
        parkingSpots: input.parkingSpots,
        houseRules: input.houseRules,
      })
      .returning();

    if (!property) {
      throw new Error('Failed to create property');
    }

    return property;
  }

  async findById(id: string) {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    return property ?? null;
  }

  async findByIdForHost(id: string, hostId: string) {
    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.hostId, hostId)))
      .limit(1);

    return property ?? null;
  }

  async listByHost(hostId: string, filters?: { status?: string; search?: string }) {
    const conditions = [eq(properties.hostId, hostId)];

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(properties.status, filters.status as typeof properties.status.enumValues[number]));
    }

    if (filters?.search?.trim()) {
      conditions.push(ilike(properties.name, `%${filters.search.trim()}%`));
    }

    return db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(sql`${properties.createdAt} desc`);
  }

  async update(id: string, hostId: string, data: Partial<CreatePropertyInput> & { status?: string; coverImageUrl?: string }) {
    const [property] = await db
      .update(properties)
      .set({
        ...('name' in data ? { name: data.name } : {}),
        ...('type' in data ? { type: data.type } : {}),
        ...('description' in data ? { description: data.description } : {}),
        ...('contactPhone' in data ? { contactPhone: data.contactPhone } : {}),
        ...('whatsapp' in data ? { whatsapp: data.whatsapp } : {}),
        ...('coverImageUrl' in data ? { coverImageUrl: data.coverImageUrl } : {}),
        ...('province' in data ? { province: data.province } : {}),
        ...('city' in data ? { city: data.city } : {}),
        ...('community' in data ? { community: data.community } : {}),
        ...('neighborhood' in data ? { neighborhood: data.neighborhood } : {}),
        ...('address' in data ? { address: data.address } : {}),
        ...('postalCode' in data ? { postalCode: data.postalCode } : {}),
        ...('latitude' in data ? { latitude: data.latitude } : {}),
        ...('longitude' in data ? { longitude: data.longitude } : {}),
        ...('bathrooms' in data ? { bathrooms: data.bathrooms } : {}),
        ...('parkingSpots' in data ? { parkingSpots: data.parkingSpots } : {}),
        ...('houseRules' in data ? { houseRules: data.houseRules } : {}),
        ...('status' in data
          ? { status: data.status as typeof properties.status.enumValues[number] }
          : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, id), eq(properties.hostId, hostId)))
      .returning();

    return property ?? null;
  }

  async setStatus(id: string, hostId: string, status: typeof properties.status.enumValues[number]) {
    const [property] = await db
      .update(properties)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(properties.id, id), eq(properties.hostId, hostId)))
      .returning();

    return property ?? null;
  }

  async delete(id: string, hostId: string) {
    const [property] = await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.hostId, hostId)))
      .returning();
    return property ?? null;
  }

  async countRooms(propertyId: string) {
    const [row] = await db
      .select({ value: count() })
      .from(rooms)
      .where(eq(rooms.propertyId, propertyId));
    return row?.value ?? 0;
  }

  async countByHost(hostId: string, status?: typeof properties.status.enumValues[number]) {
    const conditions = [eq(properties.hostId, hostId)];
    if (status) conditions.push(eq(properties.status, status));
    const [row] = await db.select({ value: count() }).from(properties).where(and(...conditions));
    return row?.value ?? 0;
  }

  async countAvailableRooms(hostId: string) {
    const [row] = await db
      .select({ value: count() })
      .from(rooms)
      .innerJoin(properties, eq(properties.id, rooms.propertyId))
      .where(and(eq(properties.hostId, hostId), eq(rooms.status, 'disponivel')));
    return row?.value ?? 0;
  }

  async countRoomsByHost(hostId: string) {
    const [row] = await db
      .select({ value: count() })
      .from(rooms)
      .innerJoin(properties, eq(properties.id, rooms.propertyId))
      .where(eq(properties.hostId, hostId));
    return row?.value ?? 0;
  }
}

export const propertyRepository = new PropertyRepository();
