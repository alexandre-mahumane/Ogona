import { z } from 'zod';
import { bookingModalityValues } from './room.dto';

export const reservationStatusValues = [
  'pending',
  'awaiting_payment',
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
] as const;

export const paymentMethodValues = ['m_pesa', 'e_mola'] as const;

export const quoteReservationDto = z.object({
  roomId: z.string().uuid(),
  modality: z.enum(bookingModalityValues),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Use HH:mm')
    .optional(),
  units: z.number().int().min(1).max(365),
  guestCount: z.number().int().min(1).max(50).default(1),
});

export const createReservationDto = quoteReservationDto.superRefine((data, ctx) => {
  if (data.modality === 'hora' && !data.startTime) {
    ctx.addIssue({
      code: 'custom',
      path: ['startTime'],
      message: 'Hora de entrada é obrigatória para reserva por hora',
    });
  }
});

export const listReservationsQueryDto = z.object({
  status: z
    .enum([
      'all',
      'pending',
      'awaiting_payment',
      'confirmed',
      'rejected',
      'cancelled',
      'completed',
    ])
    .optional()
    .default('all'),
  search: z.string().trim().max(120).optional(),
});

export const payReservationDto = z.object({
  method: z.enum(paymentMethodValues),
});

export type QuoteReservationInput = z.infer<typeof quoteReservationDto>;
export type CreateReservationInput = z.infer<typeof createReservationDto>;
export type ListReservationsQuery = z.infer<typeof listReservationsQueryDto>;
export type PayReservationInput = z.infer<typeof payReservationDto>;
