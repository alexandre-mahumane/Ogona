import type { Request, Response } from 'express';
import { calendarService } from '../services/calendar.service';
import type { AuthenticatedRequest } from '../types/express';
import { UnauthorizedError } from '../utils/errors';

export class CalendarController {
  async getAvailability(req: Request, res: Response): Promise<void> {
    const availability = await calendarService.getAvailability(
      req.params.roomId as string,
      req.query as never,
    );
    res.status(200).json({ success: true, data: { availability } });
  }

  async getMonth(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const calendar = await calendarService.getMonth(
      req.params.roomId as string,
      req.user.id,
      req.query as never,
    );
    res.status(200).json({ success: true, data: { calendar } });
  }

  async block(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await calendarService.block(
      req.params.roomId as string,
      req.user.id,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  }

  async unblock(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await calendarService.unblock(
      req.params.roomId as string,
      req.user.id,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  }

  async setPrice(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await calendarService.setPrice(
      req.params.roomId as string,
      req.user.id,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  }

  async closeRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const room = await calendarService.closeRoom(req.params.roomId as string, req.user.id);
    res.status(200).json({ success: true, data: { room } });
  }
}

export const calendarController = new CalendarController();
