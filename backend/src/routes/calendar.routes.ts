import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller';
import {
  calendarDateRangeDto,
  calendarMonthQueryDto,
  setCalendarPriceDto,
} from '../dtos/calendar.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHost } from '../middlewares/require-host.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

export const calendarRoutes = Router({ mergeParams: true });

calendarRoutes.use(authenticate, requireHost);

calendarRoutes.get(
  '/',
  validate(calendarMonthQueryDto, 'query'),
  asyncHandler((req, res) => calendarController.getMonth(req, res)),
);

calendarRoutes.post(
  '/block',
  validate(calendarDateRangeDto),
  asyncHandler((req, res) => calendarController.block(req, res)),
);

calendarRoutes.post(
  '/unblock',
  validate(calendarDateRangeDto),
  asyncHandler((req, res) => calendarController.unblock(req, res)),
);

calendarRoutes.post(
  '/price',
  validate(setCalendarPriceDto),
  asyncHandler((req, res) => calendarController.setPrice(req, res)),
);

calendarRoutes.post(
  '/close-room',
  asyncHandler((req, res) => calendarController.closeRoom(req, res)),
);
