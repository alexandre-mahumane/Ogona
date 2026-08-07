import type { Response } from 'express';
import { reservationService } from '../services/reservation.service';
import type { AuthenticatedRequest } from '../types/express';
import { UnauthorizedError } from '../utils/errors';

export class ReservationController {
  async quote(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const quote = await reservationService.quote(req.body);
    res.status(200).json({ success: true, data: { quote } });
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservation = await reservationService.createAsGuest(req.user.id, req.body);
    res.status(201).json({ success: true, data: { reservation } });
  }

  async listMineAsGuest(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservations = await reservationService.listForGuest(
      req.user.id,
      req.query as never,
    );
    res.status(200).json({ success: true, data: { reservations } });
  }

  async getMineAsGuest(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservation = await reservationService.getForGuest(
      req.user.id,
      req.params.id as string,
    );
    res.status(200).json({ success: true, data: { reservation } });
  }

  async pay(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservation = await reservationService.payAsGuest(
      req.user.id,
      req.params.id as string,
      req.body,
    );
    res.status(200).json({ success: true, data: { reservation } });
  }

  async listMineAsHost(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservations = await reservationService.listForHost(req.user.id, req.query as never);
    res.status(200).json({ success: true, data: { reservations } });
  }

  async getMineAsHost(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservation = await reservationService.getForHost(
      req.user.id,
      req.params.id as string,
    );
    res.status(200).json({ success: true, data: { reservation } });
  }

  async accept(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservation = await reservationService.accept(
      req.user.id,
      req.params.id as string,
    );
    res.status(200).json({ success: true, data: { reservation } });
  }

  async reject(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservation = await reservationService.reject(
      req.user.id,
      req.params.id as string,
    );
    res.status(200).json({ success: true, data: { reservation } });
  }

  async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const reservation = await reservationService.cancelAsGuest(
      req.user.id,
      req.params.id as string,
    );
    res.status(200).json({ success: true, data: { reservation } });
  }
}

export const reservationController = new ReservationController();
