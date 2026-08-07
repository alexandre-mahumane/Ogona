import type { Response } from 'express';
import { propertyService } from '../services/property.service';
import type { AuthenticatedRequest } from '../types/express';
import { UnauthorizedError } from '../utils/errors';

export class PropertyController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const property = await propertyService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: { property } });
  }

  async listMine(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const properties = await propertyService.listMine(req.user.id, req.query as never);
    res.status(200).json({ success: true, data: { properties } });
  }

  async getMine(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const property = await propertyService.getMine(req.params.id as string, req.user.id);
    res.status(200).json({ success: true, data: { property } });
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const property = await propertyService.update(
      req.params.id as string,
      req.user.id,
      req.body,
    );
    res.status(200).json({ success: true, data: { property } });
  }

  async setStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const property = await propertyService.setStatus(
      req.params.id as string,
      req.user.id,
      req.body.status,
    );
    res.status(200).json({ success: true, data: { property } });
  }

  async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await propertyService.remove(req.params.id as string, req.user.id);
    res.status(200).json({ success: true, data: result });
  }
}

export const propertyController = new PropertyController();
