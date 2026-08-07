import type { Response } from 'express';
import { discoverService } from '../services/discover.service';
import type { AuthenticatedRequest } from '../types/express';
import { UnauthorizedError } from '../utils/errors';

export class DiscoverController {
  async home(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = await discoverService.home(req.query as never, req.user?.id);
    res.status(200).json({ success: true, data });
  }

  async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = await discoverService.search(req.query as never, req.user?.id);
    res.status(200).json({ success: true, data });
  }

  async cities(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const cities = await discoverService.cities();
    res.status(200).json({ success: true, data: { cities } });
  }

  async popularDestinations(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const destinations = await discoverService.popularDestinations();
    res.status(200).json({ success: true, data: { destinations } });
  }

  async getProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
    const property = await discoverService.getProperty(
      req.params.id as string,
      req.user?.id,
    );
    res.status(200).json({ success: true, data: { property } });
  }

  async getRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    const room = await discoverService.getRoom(req.params.roomId as string);
    res.status(200).json({ success: true, data: { room } });
  }

  async getPropertyReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = await discoverService.getPropertyReviews(
      req.params.id as string,
      req.query as never,
    );
    res.status(200).json({ success: true, data });
  }

  async addFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await discoverService.addFavorite(
      req.user.id,
      req.params.propertyId as string,
    );
    res.status(201).json({ success: true, data: result });
  }

  async removeFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await discoverService.removeFavorite(
      req.user.id,
      req.params.propertyId as string,
    );
    res.status(200).json({ success: true, data: result });
  }

  async listFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const properties = await discoverService.listFavorites(req.user.id);
    res.status(200).json({ success: true, data: { properties } });
  }
}

export const discoverController = new DiscoverController();
