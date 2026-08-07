import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHost } from '../middlewares/require-host.middleware';
import { asyncHandler } from '../utils/async-handler';

export const dashboardRoutes = Router();

dashboardRoutes.get(
  '/',
  authenticate,
  requireHost,
  asyncHandler((req, res) => dashboardController.getHost(req, res)),
);
