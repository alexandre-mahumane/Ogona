import type { Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import type { AuthenticatedRequest } from '../types/express';
import { UnauthorizedError } from '../utils/errors';

export class DashboardController {
  async getHost(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const dashboard = await dashboardService.getHostDashboard(req.user.id);
    res.status(200).json({ success: true, data: { dashboard } });
  }
}

export const dashboardController = new DashboardController();
