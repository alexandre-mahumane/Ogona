import type { Response } from 'express';
import { roomService } from '../services/room.service';
import type { AuthenticatedRequest } from '../types/express';
import { UnauthorizedError } from '../utils/errors';

export class RoomController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const room = await roomService.create(
      req.params.propertyId as string,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: { room },
    });
  }

  async listByProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const rooms = await roomService.listByProperty(
      req.params.propertyId as string,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: { rooms },
    });
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const room = await roomService.getById(req.params.roomId as string, req.user.id);

    res.status(200).json({
      success: true,
      data: { room },
    });
  }
}

export const roomController = new RoomController();
