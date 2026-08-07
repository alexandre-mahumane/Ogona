import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { createReviewDto } from '../dtos/review.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/require-role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

export const reviewRoutes = Router();

reviewRoutes.post(
  '/',
  authenticate,
  requireRole('guest'),
  validate(createReviewDto),
  asyncHandler((req, res) => reviewController.create(req, res)),
);
