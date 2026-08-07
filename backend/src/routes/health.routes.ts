import { Router } from 'express';
import { healthController } from '../controllers/health.controller';
import { asyncHandler } from '../utils/async-handler';

export const healthRoutes = Router();

healthRoutes.get(
  '/',
  asyncHandler((req, res) => healthController.check(req, res)),
);

/** Alias leve (também disponível em GET /ping na root). */
healthRoutes.get('/ping', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'pong',
      timestamp: new Date().toISOString(),
    },
  });
});
