import type { CreateRoomInput } from '../dtos/room.dto';
import { toPublicRoom } from '../repositories/listing.mappers';
import { roomRepository } from '../repositories/room.repository';
import { NotFoundError } from '../utils/errors';
import { propertyService } from './property.service';

export class RoomService {
  async create(propertyId: string, hostId: string, input: CreateRoomInput) {
    await propertyService.assertOwnedByHost(propertyId, hostId);
    const created = await roomRepository.create(propertyId, input);
    return toPublicRoom(created);
  }

  async listByProperty(propertyId: string, hostId: string) {
    await propertyService.assertOwnedByHost(propertyId, hostId);
    const rows = await roomRepository.listByProperty(propertyId);

    const detailed = await Promise.all(
      rows.map(async (row) => {
        const full = await roomRepository.findById(row.id);
        if (!full) {
          throw new NotFoundError('Quarto não encontrado');
        }
        return toPublicRoom(full);
      }),
    );

    return detailed;
  }

  async getById(roomId: string, hostId: string) {
    const full = await roomRepository.findById(roomId);
    if (!full) {
      throw new NotFoundError('Quarto não encontrado');
    }

    await propertyService.assertOwnedByHost(full.room.propertyId, hostId);
    return toPublicRoom(full);
  }
}

export const roomService = new RoomService();
