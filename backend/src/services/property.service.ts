import type {
  CreatePropertyInput,
  ListPropertiesQuery,
  UpdatePropertyInput,
} from '../dtos/property.dto';
import { toPublicProperty } from '../repositories/listing.mappers';
import { propertyRepository } from '../repositories/property.repository';
import { reservationRepository } from '../repositories/reservation.repository';
import { roomRepository } from '../repositories/room.repository';
import { toPublicRoom } from '../repositories/listing.mappers';
import { ForbiddenError, NotFoundError } from '../utils/errors';

export class PropertyService {
  async create(hostId: string, input: CreatePropertyInput) {
    const property = await propertyRepository.create(hostId, input);
    return toPublicProperty(property);
  }

  async listMine(hostId: string, query: ListPropertiesQuery) {
    const rows = await propertyRepository.listByHost(hostId, {
      status: query.status,
      search: query.search,
    });

    return Promise.all(
      rows.map(async (property) => {
        const [roomsCount, reservationsCount, revenue] = await Promise.all([
          propertyRepository.countRooms(property.id),
          reservationRepository.countByProperty(property.id),
          reservationRepository.paidRevenueByProperty(property.id),
        ]);

        return {
          ...toPublicProperty(property),
          stats: {
            rooms: roomsCount,
            reservations: reservationsCount,
            revenue,
          },
        };
      }),
    );
  }

  async getMine(propertyId: string, hostId: string) {
    const property = await propertyRepository.findByIdForHost(propertyId, hostId);
    if (!property) {
      throw new NotFoundError('Propriedade não encontrada');
    }

    const [roomsCount, reservationsCount, revenue, roomRows] = await Promise.all([
      propertyRepository.countRooms(property.id),
      reservationRepository.countByProperty(property.id),
      reservationRepository.paidRevenueByProperty(property.id),
      roomRepository.listByProperty(property.id),
    ]);

    const roomsDetailed = await Promise.all(
      roomRows.map(async (row) => {
        const full = await roomRepository.findById(row.id);
        if (!full) return null;
        const publicRoom = toPublicRoom(full);
        const nightPrice = publicRoom.prices.noite ?? Object.values(publicRoom.prices)[0] ?? null;
        return {
          ...publicRoom,
          displayPrice: nightPrice,
        };
      }),
    );

    return {
      ...toPublicProperty(property),
      stats: {
        rooms: roomsCount,
        reservations: reservationsCount,
        revenue,
      },
      rooms: roomsDetailed.filter(Boolean),
    };
  }

  async update(propertyId: string, hostId: string, input: UpdatePropertyInput) {
    const updated = await propertyRepository.update(propertyId, hostId, input);
    if (!updated) throw new NotFoundError('Propriedade não encontrada');
    return toPublicProperty(updated);
  }

  async setStatus(
    propertyId: string,
    hostId: string,
    status: 'draft' | 'published' | 'hidden' | 'under_review',
  ) {
    const updated = await propertyRepository.setStatus(propertyId, hostId, status);
    if (!updated) throw new NotFoundError('Propriedade não encontrada');
    return toPublicProperty(updated);
  }

  async remove(propertyId: string, hostId: string) {
    const deleted = await propertyRepository.delete(propertyId, hostId);
    if (!deleted) throw new NotFoundError('Propriedade não encontrada');
    return { id: deleted.id };
  }

  async assertOwnedByHost(propertyId: string, hostId: string) {
    const property = await propertyRepository.findByIdForHost(propertyId, hostId);
    if (!property) {
      throw new ForbiddenError('Não tem acesso a esta propriedade');
    }
    return property;
  }
}

export const propertyService = new PropertyService();
