import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import {
  createReservationDto,
  listReservationsQueryDto,
  payReservationDto,
  quoteReservationDto,
} from '../dtos/reservation.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHost } from '../middlewares/require-host.middleware';
import { requireRole } from '../middlewares/require-role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

export const reservationRoutes = Router();

reservationRoutes.post(
  '/quote',
  authenticate,
  requireRole('guest'),
  validate(quoteReservationDto),
  asyncHandler((req, res) => reservationController.quote(req, res)),
);

reservationRoutes.post(
  '/',
  authenticate,
  requireRole('guest'),
  validate(createReservationDto),
  asyncHandler((req, res) => reservationController.create(req, res)),
);

reservationRoutes.get(
  '/mine',
  authenticate,
  requireRole('guest'),
  validate(listReservationsQueryDto, 'query'),
  asyncHandler((req, res) => reservationController.listMineAsGuest(req, res)),
);

reservationRoutes.get(
  '/mine/:id',
  authenticate,
  requireRole('guest'),
  asyncHandler((req, res) => reservationController.getMineAsGuest(req, res)),
);

reservationRoutes.post(
  '/:id/pay',
  authenticate,
  requireRole('guest'),
  validate(payReservationDto),
  asyncHandler((req, res) => reservationController.pay(req, res)),
);

reservationRoutes.post(
  '/:id/cancel',
  authenticate,
  requireRole('guest'),
  asyncHandler((req, res) => reservationController.cancel(req, res)),
);

reservationRoutes.get(
  '/',
  authenticate,
  requireHost,
  validate(listReservationsQueryDto, 'query'),
  asyncHandler((req, res) => reservationController.listMineAsHost(req, res)),
);

reservationRoutes.get(
  '/:id',
  authenticate,
  requireHost,
  asyncHandler((req, res) => reservationController.getMineAsHost(req, res)),
);

reservationRoutes.post(
  '/:id/accept',
  authenticate,
  requireHost,
  asyncHandler((req, res) => reservationController.accept(req, res)),
);

reservationRoutes.post(
  '/:id/reject',
  authenticate,
  requireHost,
  asyncHandler((req, res) => reservationController.reject(req, res)),
);
