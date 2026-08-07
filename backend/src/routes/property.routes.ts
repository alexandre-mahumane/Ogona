import { Router } from 'express';
import { catalogController } from '../controllers/catalog.controller';
import { propertyController } from '../controllers/property.controller';
import { roomController } from '../controllers/room.controller';
import {
  createPropertyDto,
  listPropertiesQueryDto,
  setPropertyStatusDto,
  updatePropertyDto,
} from '../dtos/property.dto';
import { createRoomDto } from '../dtos/room.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHost } from '../middlewares/require-host.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

export const propertyRoutes = Router();

propertyRoutes.use(authenticate, requireHost);

propertyRoutes.get(
  '/catalogs',
  asyncHandler((req, res) => catalogController.list(req, res)),
);

propertyRoutes.post(
  '/',
  validate(createPropertyDto),
  asyncHandler((req, res) => propertyController.create(req, res)),
);

propertyRoutes.get(
  '/',
  validate(listPropertiesQueryDto, 'query'),
  asyncHandler((req, res) => propertyController.listMine(req, res)),
);

propertyRoutes.get(
  '/rooms/:roomId',
  asyncHandler((req, res) => roomController.getById(req, res)),
);

propertyRoutes.patch(
  '/:id',
  validate(updatePropertyDto),
  asyncHandler((req, res) => propertyController.update(req, res)),
);

propertyRoutes.patch(
  '/:id/status',
  validate(setPropertyStatusDto),
  asyncHandler((req, res) => propertyController.setStatus(req, res)),
);

propertyRoutes.delete(
  '/:id',
  asyncHandler((req, res) => propertyController.remove(req, res)),
);

propertyRoutes.get(
  '/:id',
  asyncHandler((req, res) => propertyController.getMine(req, res)),
);

propertyRoutes.post(
  '/:propertyId/rooms',
  validate(createRoomDto),
  asyncHandler((req, res) => roomController.create(req, res)),
);

propertyRoutes.get(
  '/:propertyId/rooms',
  asyncHandler((req, res) => roomController.listByProperty(req, res)),
);
