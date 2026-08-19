import { and, asc, count, desc, eq, gte, ilike, or, sql } from 'drizzle-orm';
import { db } from '../config/database';
import {
  favorites,
  properties,
  reviews,
  roomAmenities,
  roomImages,
  rooms,
  users,
} from '../db/schema';
import type { DiscoverPropertiesQuery } from '../dtos/discover.dto';

const nightPriceSql = sql<number>`(
  SELECT MIN(rp.amount::numeric)
  FROM room_prices rp
  INNER JOIN rooms r ON r.id = rp.room_id
  WHERE r.property_id = "properties"."id"
    AND rp.modality = 'noite'
)`;

const roomsCountSql = sql<number>`(
  SELECT COUNT(*)::int FROM rooms r WHERE r.property_id = "properties"."id"
)`;

const avgRatingSql = sql<number>`(
  SELECT COALESCE(AVG(rv.rating)::numeric, 0)
  FROM reviews rv
  WHERE rv.property_id = "properties"."id"
)`;

const reviewsCountSql = sql<number>`(
  SELECT COUNT(*)::int FROM reviews rv WHERE rv.property_id = "properties"."id"
)`;

const bookingsCountSql = sql<number>`(
  SELECT COUNT(*)::int FROM reservations res
  WHERE res.property_id = "properties"."id"
    AND res.status IN ('confirmed', 'completed')
)`;

function distanceSql(lat: number, lng: number) {
  return sql<number>`(
    6371 * acos(
      least(1.0, greatest(-1.0,
        cos(radians(${lat})) * cos(radians("properties"."latitude"))
        * cos(radians("properties"."longitude") - radians(${lng}))
        + sin(radians(${lat})) * sin(radians("properties"."latitude"))
      ))
    )
  )`;
}

export class DiscoverRepository {
  async search(query: DiscoverPropertiesQuery, guestId?: string) {
    const conditions = [eq(properties.status, 'published')];

    if (query.city) {
      conditions.push(
        sql`lower(btrim(${properties.city})) = lower(btrim(${query.city}))`,
      );
    }

    if (query.q) {
      const q = `%${query.q}%`;
      conditions.push(
        or(
          ilike(properties.name, q),
          ilike(properties.city, q),
          ilike(properties.neighborhood, q),
          ilike(properties.address, q),
        )!,
      );
    }

    if (query.type) conditions.push(eq(properties.type, query.type));
    if (query.minBathrooms != null) {
      conditions.push(gte(properties.bathrooms, query.minBathrooms));
    }
    if (query.minParking != null) {
      conditions.push(gte(properties.parkingSpots, query.minParking));
    }

    const distance =
      query.lat != null && query.lng != null ? distanceSql(query.lat, query.lng) : null;

    let orderBy;
    switch (query.sort) {
      case 'distance':
        orderBy = distance ? asc(distance) : desc(properties.createdAt);
        break;
      case 'price_asc':
        orderBy = asc(nightPriceSql);
        break;
      case 'price_desc':
        orderBy = desc(nightPriceSql);
        break;
      case 'rating':
        orderBy = desc(avgRatingSql);
        break;
      case 'popular':
        orderBy = desc(bookingsCountSql);
        break;
      default:
        orderBy = desc(properties.createdAt);
    }

    const baseQuery = db
      .select({
        property: properties,
        nightPrice: nightPriceSql,
        roomsCount: roomsCountSql,
        avgRating: avgRatingSql,
        reviewsCount: reviewsCountSql,
        bookingsCount: bookingsCountSql,
        distanceKm: distance ?? sql<number>`NULL`,
        isFavorite: guestId
          ? sql<boolean>`EXISTS (
              SELECT 1 FROM favorites f
              WHERE f.property_id = "properties"."id"
                AND f.guest_id = ${guestId}
            )`
          : sql<boolean>`false`,
      })
      .from(properties)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(query.limit)
      .offset(query.offset);

    const rows = await baseQuery;

    return rows.filter((row) => {
      if (query.minRating != null && Number(row.avgRating) < query.minRating) return false;
      if (query.minPrice != null && (row.nightPrice == null || Number(row.nightPrice) < query.minPrice)) {
        return false;
      }
      if (query.maxPrice != null && (row.nightPrice == null || Number(row.nightPrice) > query.maxPrice)) {
        return false;
      }
      if (query.minRooms != null && Number(row.roomsCount) < query.minRooms) return false;
      return true;
    });
  }

  async listNear(lat: number, lng: number, limit: number, guestId?: string) {
    return this.search(
      {
        lat,
        lng,
        sort: 'distance',
        limit,
        offset: 0,
      },
      guestId,
    );
  }

  async listPopular(limit: number, guestId?: string) {
    return this.search(
      {
        sort: 'popular',
        limit,
        offset: 0,
      },
      guestId,
    );
  }

  async citiesSummary() {
    const rows = await db
      .select({
        city: properties.city,
        count: count(),
        coverImageUrl: sql<string | null>`(
          SELECT p2.cover_image_url FROM properties p2
          WHERE p2.city = ${properties.city} AND p2.status = 'published'
          ORDER BY p2.created_at DESC
          LIMIT 1
        )`,
      })
      .from(properties)
      .where(eq(properties.status, 'published'))
      .groupBy(properties.city)
      .orderBy(desc(count()));

    return rows.map((row) => ({
      city: row.city,
      propertiesCount: Number(row.count),
      coverImageUrl: row.coverImageUrl,
    }));
  }

  async getPublishedById(id: string) {
    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.status, 'published')))
      .limit(1);
    return property ?? null;
  }

  async getRatingSummary(propertyId: string) {
    const [summary] = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating})::numeric, 0)`,
        total: count(),
      })
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId));

    const breakdownRows = await db
      .select({
        rating: reviews.rating,
        total: count(),
      })
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId))
      .groupBy(reviews.rating);

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of breakdownRows) {
      breakdown[row.rating as 1 | 2 | 3 | 4 | 5] = Number(row.total);
    }

    const avg = Number(summary?.avgRating ?? 0);

    return {
      average: Number(avg.toFixed(2)),
      total: Number(summary?.total ?? 0),
      label: ratingLabel(avg),
      breakdown,
    };
  }

  async listReviews(propertyId: string, opts: { rating?: number; limit: number; offset: number }) {
    const conditions = [eq(reviews.propertyId, propertyId)];
    if (opts.rating != null) conditions.push(eq(reviews.rating, opts.rating));

    const rows = await db
      .select({
        review: reviews,
        guestName: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.guestId))
      .where(and(...conditions))
      .orderBy(desc(reviews.createdAt))
      .limit(opts.limit)
      .offset(opts.offset);

    return rows;
  }

  async propertyAmenities(propertyId: string) {
    const rows = await db
      .selectDistinct({ amenity: roomAmenities.amenity })
      .from(roomAmenities)
      .innerJoin(rooms, eq(rooms.id, roomAmenities.roomId))
      .where(eq(rooms.propertyId, propertyId));

    return rows.map((r) => r.amenity);
  }

  async propertyImages(propertyId: string) {
    const cover = await db
      .select({ coverImageUrl: properties.coverImageUrl })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    const roomImgs = await db
      .select({ url: roomImages.url })
      .from(roomImages)
      .innerJoin(rooms, eq(rooms.id, roomImages.roomId))
      .where(eq(rooms.propertyId, propertyId))
      .orderBy(asc(roomImages.sortOrder))
      .limit(20);

    const urls = [
      ...(cover[0]?.coverImageUrl ? [cover[0].coverImageUrl] : []),
      ...roomImgs.map((i) => i.url),
    ];
    return [...new Set(urls)];
  }

  async isFavorite(guestId: string, propertyId: string) {
    const [row] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.guestId, guestId), eq(favorites.propertyId, propertyId)))
      .limit(1);
    return Boolean(row);
  }

  async addFavorite(guestId: string, propertyId: string) {
    await db
      .insert(favorites)
      .values({ guestId, propertyId })
      .onConflictDoNothing();
  }

  async removeFavorite(guestId: string, propertyId: string) {
    await db
      .delete(favorites)
      .where(and(eq(favorites.guestId, guestId), eq(favorites.propertyId, propertyId)));
  }

  async listFavorites(guestId: string) {
    const distance = sql<number>`NULL`;

    const rows = await db
      .select({
        property: properties,
        nightPrice: nightPriceSql,
        roomsCount: roomsCountSql,
        avgRating: avgRatingSql,
        reviewsCount: reviewsCountSql,
        bookingsCount: bookingsCountSql,
        distanceKm: distance,
        isFavorite: sql<boolean>`true`,
      })
      .from(favorites)
      .innerJoin(properties, eq(properties.id, favorites.propertyId))
      .where(and(eq(favorites.guestId, guestId), eq(properties.status, 'published')))
      .orderBy(desc(favorites.createdAt));

    return rows;
  }
}

function ratingLabel(avg: number): string {
  if (avg >= 4.5) return 'Excelente';
  if (avg >= 4) return 'Muito bom';
  if (avg >= 3) return 'Bom';
  if (avg >= 2) return 'Razoável';
  if (avg > 0) return 'Fraco';
  return 'Sem avaliações';
}

export const discoverRepository = new DiscoverRepository();

export function mapDiscoverCard(row: {
  property: typeof properties.$inferSelect;
  nightPrice: number | null;
  roomsCount: number;
  avgRating: number;
  reviewsCount: number;
  bookingsCount: number;
  distanceKm: number | null;
  isFavorite: boolean;
}) {
  return {
    id: row.property.id,
    name: row.property.name,
    type: row.property.type,
    coverImageUrl: row.property.coverImageUrl,
    location: {
      city: row.property.city,
      neighborhood: row.property.neighborhood,
      community: row.property.community,
      latitude: row.property.latitude,
      longitude: row.property.longitude,
    },
    rating: {
      average: Number(Number(row.avgRating).toFixed(2)),
      total: Number(row.reviewsCount),
    },
    priceFrom: row.nightPrice != null ? Number(row.nightPrice) : null,
    priceModality: 'noite' as const,
    currency: 'MZN',
    roomsCount: Number(row.roomsCount),
    bookingsCount: Number(row.bookingsCount),
    distanceKm:
      row.distanceKm != null && !Number.isNaN(Number(row.distanceKm))
        ? Number(Number(row.distanceKm).toFixed(1))
        : null,
    available: true,
    isFavorite: Boolean(row.isFavorite),
  };
}
