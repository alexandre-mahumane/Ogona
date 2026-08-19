import type {
  DiscoverHomeQuery,
  DiscoverPropertiesQuery,
  ListPropertyReviewsQuery,
} from '../dtos/discover.dto';
import {
  discoverRepository,
  mapDiscoverCard,
} from '../repositories/discover.repository';
import { toPublicProperty, toPublicRoom } from '../repositories/listing.mappers';
import { roomRepository } from '../repositories/room.repository';
import { addDays, todayUtc } from '../utils/dates';
import { NotFoundError } from '../utils/errors';
import { calendarService } from './calendar.service';
import { POPULAR_DESTINATIONS } from '../utils/pricing';

export class DiscoverService {
  async home(query: DiscoverHomeQuery, guestId?: string) {
    const [nearYou, mostBooked, cities] = await Promise.all([
      query.lat != null && query.lng != null
        ? discoverRepository.listNear(query.lat, query.lng, query.limit, guestId)
        : discoverRepository.listPopular(query.limit, guestId),
      discoverRepository.listPopular(query.limit, guestId),
      discoverRepository.citiesSummary(),
    ]);

    return {
      nearYou: nearYou.map(mapDiscoverCard),
      mostBooked: mostBooked.map(mapDiscoverCard),
      cities,
    };
  }

  async search(query: DiscoverPropertiesQuery, guestId?: string) {
    const rows = await discoverRepository.search(query, guestId);
    return {
      properties: rows.map(mapDiscoverCard),
      meta: {
        limit: query.limit,
        offset: query.offset,
        count: rows.length,
      },
    };
  }

  async cities() {
    return discoverRepository.citiesSummary();
  }

  async popularDestinations() {
    const cities = await discoverRepository.citiesSummary();
    const byName = new Map(cities.map((c) => [c.city.toLowerCase(), c]));

    return POPULAR_DESTINATIONS.map((name) => {
      const match = byName.get(name.toLowerCase());
      return {
        name,
        propertiesCount: match?.propertiesCount ?? 0,
        coverImageUrl: match?.coverImageUrl ?? null,
      };
    });
  }

  async getProperty(propertyId: string, guestId?: string) {
    const property = await discoverRepository.getPublishedById(propertyId);
    if (!property) throw new NotFoundError('Propriedade não encontrada');

    const [rating, amenities, images, roomRows, isFavorite] = await Promise.all([
      discoverRepository.getRatingSummary(propertyId),
      discoverRepository.propertyAmenities(propertyId),
      discoverRepository.propertyImages(propertyId),
      roomRepository.listByProperty(propertyId),
      guestId
        ? discoverRepository.isFavorite(guestId, propertyId)
        : Promise.resolve(false),
    ]);

    const windowFrom = todayUtc();
    const windowTo = addDays(windowFrom, 180);

    const roomsDetailed = await Promise.all(
      roomRows.map(async (row) => {
        const full = await roomRepository.findById(row.id);
        if (!full) return null;
        const publicRoom = toPublicRoom(full);
        const unavailableDates = await calendarService.listUnavailableDates(
          row.id,
          windowFrom,
          windowTo,
        );
        return {
          id: publicRoom.id,
          name: publicRoom.name,
          type: publicRoom.type,
          status: publicRoom.status,
          maxCapacity: publicRoom.maxCapacity,
          priceFrom: publicRoom.prices.noite ?? Object.values(publicRoom.prices)[0] ?? null,
          priceModality: publicRoom.prices.noite != null ? 'noite' : publicRoom.modalities[0],
          currency: publicRoom.currency,
          thumbnailUrl: publicRoom.images[0]?.url ?? property.coverImageUrl,
          available: publicRoom.status === 'disponivel',
          unavailableDates,
        };
      }),
    );

    return {
      ...toPublicProperty(property),
      amenities,
      images,
      houseRules: property.houseRules ?? [],
      rating,
      isFavorite,
      rooms: roomsDetailed.filter(Boolean),
    };
  }

  async getRoom(roomId: string) {
    const full = await roomRepository.findById(roomId);
    if (!full) throw new NotFoundError('Quarto não encontrado');

    const property = await discoverRepository.getPublishedById(full.room.propertyId);
    if (!property) throw new NotFoundError('Quarto não disponível');

    const unavailableDates = await calendarService.listUnavailableDates(
      roomId,
      todayUtc(),
      addDays(todayUtc(), 180),
    );

    return {
      ...toPublicRoom(full),
      unavailableDates,
      property: {
        id: property.id,
        name: property.name,
        type: property.type,
        location: {
          city: property.city,
          neighborhood: property.neighborhood,
          latitude: property.latitude,
          longitude: property.longitude,
        },
      },
    };
  }

  async getPropertyReviews(propertyId: string, query: ListPropertyReviewsQuery) {
    const property = await discoverRepository.getPublishedById(propertyId);
    if (!property) throw new NotFoundError('Propriedade não encontrada');

    const [summary, rows] = await Promise.all([
      discoverRepository.getRatingSummary(propertyId),
      discoverRepository.listReviews(propertyId, query),
    ]);

    return {
      summary,
      reviews: rows.map((row) => ({
        id: row.review.id,
        guestName: row.guestName,
        rating: row.review.rating,
        comment: row.review.comment,
        createdAt: row.review.createdAt.toISOString(),
        verified: true,
      })),
    };
  }

  async addFavorite(guestId: string, propertyId: string) {
    const property = await discoverRepository.getPublishedById(propertyId);
    if (!property) throw new NotFoundError('Propriedade não encontrada');
    await discoverRepository.addFavorite(guestId, propertyId);
    return { propertyId, favorited: true };
  }

  async removeFavorite(guestId: string, propertyId: string) {
    await discoverRepository.removeFavorite(guestId, propertyId);
    return { propertyId, favorited: false };
  }

  async listFavorites(guestId: string) {
    const rows = await discoverRepository.listFavorites(guestId);
    return rows.map(mapDiscoverCard);
  }
}

export const discoverService = new DiscoverService();
