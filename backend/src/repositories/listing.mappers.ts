import type { InferSelectModel } from 'drizzle-orm';
import type { properties, roomAmenities, roomImages, roomPrices, rooms } from '../db/schema';

export type Property = InferSelectModel<typeof properties>;
export type Room = InferSelectModel<typeof rooms>;
export type RoomPrice = InferSelectModel<typeof roomPrices>;
export type RoomAmenity = InferSelectModel<typeof roomAmenities>;
export type RoomImage = InferSelectModel<typeof roomImages>;

export function toPublicProperty(property: Property) {
  return {
    id: property.id,
    hostId: property.hostId,
    name: property.name,
    type: property.type,
    description: property.description,
    contactPhone: property.contactPhone,
    whatsapp: property.whatsapp,
    coverImageUrl: property.coverImageUrl,
    bathrooms: property.bathrooms,
    parkingSpots: property.parkingSpots,
    houseRules: property.houseRules ?? [],
    location: {
      province: property.province,
      city: property.city,
      community: property.community,
      neighborhood: property.neighborhood,
      address: property.address,
      postalCode: property.postalCode,
      latitude: property.latitude,
      longitude: property.longitude,
    },
    status: property.status,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  };
}

export function toPublicRoom(data: {
  room: Room;
  prices: RoomPrice[];
  amenities: RoomAmenity[];
  images: RoomImage[];
}) {
  const { room, prices, amenities, images } = data;

  return {
    id: room.id,
    propertyId: room.propertyId,
    name: room.name,
    type: room.type,
    status: room.status,
    description: room.description,
    maxCapacity: room.maxCapacity,
    bedLabel: room.bedLabel,
    modalities: prices.map((p) => p.modality),
    prices: Object.fromEntries(prices.map((p) => [p.modality, Number(p.amount)])),
    priceLimits: Object.fromEntries(
      prices.map((p) => [p.modality, { min: p.minUnits, max: p.maxUnits }]),
    ),
    currency: prices[0]?.currency ?? 'MZN',
    amenities: amenities.map((a) => a.amenity),
    images: [...images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        id: img.id,
        url: img.url,
        sortOrder: img.sortOrder,
      })),
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}
