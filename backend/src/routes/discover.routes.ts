import { Router } from 'express';
import { discoverController } from '../controllers/discover.controller';
import {
  discoverHomeQueryDto,
  discoverPropertiesQueryDto,
  listPropertyReviewsQueryDto,
} from '../dtos/discover.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { optionalAuth } from '../middlewares/optional-auth.middleware';
import { requireRole } from '../middlewares/require-role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

export const discoverRoutes = Router();

discoverRoutes.get(
  '/home',
  optionalAuth,
  validate(discoverHomeQueryDto, 'query'),
  asyncHandler((req, res) => discoverController.home(req, res)),
);

discoverRoutes.get(
  '/properties',
  optionalAuth,
  validate(discoverPropertiesQueryDto, 'query'),
  asyncHandler((req, res) => discoverController.search(req, res)),
);

discoverRoutes.get(
  '/cities',
  asyncHandler((req, res) => discoverController.cities(req, res)),
);

discoverRoutes.get(
  '/popular-destinations',
  asyncHandler((req, res) => discoverController.popularDestinations(req, res)),
);

discoverRoutes.get(
  '/properties/:id',
  optionalAuth,
  asyncHandler((req, res) => discoverController.getProperty(req, res)),
);

discoverRoutes.get(
  '/properties/:id/reviews',
  validate(listPropertyReviewsQueryDto, 'query'),
  asyncHandler((req, res) => discoverController.getPropertyReviews(req, res)),
);

discoverRoutes.get(
  '/rooms/:roomId',
  asyncHandler((req, res) => discoverController.getRoom(req, res)),
);

discoverRoutes.get(
  '/favorites',
  authenticate,
  requireRole('guest'),
  asyncHandler((req, res) => discoverController.listFavorites(req, res)),
);

discoverRoutes.post(
  '/favorites/:propertyId',
  authenticate,
  requireRole('guest'),
  asyncHandler((req, res) => discoverController.addFavorite(req, res)),
);

discoverRoutes.delete(
  '/favorites/:propertyId',
  authenticate,
  requireRole('guest'),
  asyncHandler((req, res) => discoverController.removeFavorite(req, res)),
);
