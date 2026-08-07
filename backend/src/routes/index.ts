import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { calendarRoutes } from './calendar.routes';
import { dashboardRoutes } from './dashboard.routes';
import { discoverRoutes } from './discover.routes';
import { healthRoutes } from './health.routes';
import { propertyRoutes } from './property.routes';
import { reservationRoutes } from './reservation.routes';
import { reviewRoutes } from './review.routes';

export const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/discover', discoverRoutes);
router.use('/properties', propertyRoutes);
router.use('/reservations', reservationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/rooms/:roomId/calendar', calendarRoutes);
