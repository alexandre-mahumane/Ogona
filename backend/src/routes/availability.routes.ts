import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller';
import { calendarAvailabilityQueryDto } from '../dtos/calendar.dto';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

export const availabilityRoutes = Router({ mergeParams: true });

availabilityRoutes.get(
  '/',
  validate(calendarAvailabilityQueryDto, 'query'),
  asyncHandler((req, res) => calendarController.getAvailability(req, res)),
);
