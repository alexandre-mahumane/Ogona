import type { CreateReviewInput } from '../dtos/review.dto';
import { reservationRepository } from '../repositories/reservation.repository';
import { reviewRepository } from '../repositories/review.repository';
import { userRepository } from '../repositories/user.repository';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { activityService } from './activity.service';

export class ReviewService {
  async createAsGuest(guestId: string, input: CreateReviewInput) {
    const reservation = await reservationRepository.findById(input.reservationId);
    if (!reservation || reservation.guestId !== guestId) {
      throw new NotFoundError('Reserva não encontrada');
    }

    if (!['completed', 'confirmed'].includes(reservation.status)) {
      throw new ForbiddenError('Só pode avaliar reservas concluídas/confirmadas');
    }

    const existing = await reviewRepository.findByReservation(input.reservationId);
    if (existing) {
      throw new ConflictError('Já existe avaliação para esta reserva');
    }

    const review = await reviewRepository.create({
      reservationId: reservation.id,
      propertyId: reservation.propertyId,
      roomId: reservation.roomId,
      guestId,
      hostId: reservation.hostId,
      rating: input.rating,
      comment: input.comment,
    });

    const guest = await userRepository.findById(guestId);

    await activityService.log({
      hostId: reservation.hostId,
      type: 'review_created',
      title: 'Nova avaliação',
      description: `${guest?.name ?? 'Hóspede'} deixou ${input.rating}★`,
      metadata: { reviewId: review.id, rating: input.rating },
    });

    return {
      id: review.id,
      reservationId: review.reservationId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };
  }
}

export const reviewService = new ReviewService();
