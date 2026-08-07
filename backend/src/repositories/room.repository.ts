import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { roomAmenities, roomImages, roomPrices, rooms } from '../db/schema';
import type { CreateRoomInput } from '../dtos/room.dto';
import { DEFAULT_MODALITY_LIMITS } from '../utils/pricing';

export class RoomRepository {
  async create(propertyId: string, input: CreateRoomInput) {
    return db.transaction(async (tx) => {
      const [room] = await tx
        .insert(rooms)
        .values({
          propertyId,
          name: input.name,
          type: input.type,
          status: input.status,
          description: input.description,
          maxCapacity: input.maxCapacity,
          bedLabel: input.bedLabel,
        })
        .returning();

      if (!room) {
        throw new Error('Failed to create room');
      }

      const priceRows = input.modalities.map((modality) => {
        const limits = input.priceLimits?.[modality] ?? DEFAULT_MODALITY_LIMITS[modality];
        return {
          roomId: room.id,
          modality,
          amount: String(input.prices[modality]),
          currency: 'MZN' as const,
          minUnits: limits.min,
          maxUnits: limits.max,
        };
      });

      const prices = await tx.insert(roomPrices).values(priceRows).returning();

      const amenities =
        input.amenities.length > 0
          ? await tx
              .insert(roomAmenities)
              .values(
                input.amenities.map((amenity) => ({
                  roomId: room.id,
                  amenity,
                })),
              )
              .returning()
          : [];

      const images = await tx
        .insert(roomImages)
        .values(
          input.images.map((url, index) => ({
            roomId: room.id,
            url,
            sortOrder: index,
          })),
        )
        .returning();

      return { room, prices, amenities, images };
    });
  }

  async findById(id: string) {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
    if (!room) {
      return null;
    }

    const [prices, amenities, images] = await Promise.all([
      db.select().from(roomPrices).where(eq(roomPrices.roomId, id)),
      db.select().from(roomAmenities).where(eq(roomAmenities.roomId, id)),
      db.select().from(roomImages).where(eq(roomImages.roomId, id)),
    ]);

    return { room, prices, amenities, images };
  }

  async listByProperty(propertyId: string) {
    return db.select().from(rooms).where(eq(rooms.propertyId, propertyId));
  }

  async setStatus(id: string, status: 'disponivel' | 'indisponivel' | 'manutencao') {
    const [room] = await db
      .update(rooms)
      .set({ status, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return room ?? null;
  }
}

export const roomRepository = new RoomRepository();
