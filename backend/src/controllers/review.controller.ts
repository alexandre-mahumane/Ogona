import type { Response } from 'express';
import { reviewService } from '../services/review.service';
import type { AuthenticatedRequest } from '../types/express';
import { UnauthorizedError } from '../utils/errors';

export class ReviewController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const review = await reviewService.createAsGuest(req.user.id, req.body);
    res.status(201).json({ success: true, data: { review } });
  }
}

export const reviewController = new ReviewController();
