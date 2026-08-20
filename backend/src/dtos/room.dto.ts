import { z } from 'zod';
import { httpsUrl } from './http-url';

export const roomTypeValues = [
  'individual',
  'casal',
  'twin',
  'triple',
  'suite',
  'familiar',
  'estudio',
  'dormitorio',
] as const;

export const roomStatusValues = ['disponivel', 'indisponivel', 'manutencao'] as const;

export const bookingModalityValues = ['hora', 'noite', 'semana', 'mes'] as const;

export const amenityValues = [
  'wifi_gratuito',
  'ar_condicionado',
  'televisao',
  'casa_banho_privativa',
  'agua_quente',
  'roupa_de_cama',
  'toalhas',
  'mesa_de_trabalho',
  'minibar',
  'cofre',
  'varanda',
  'vista_mar',
  'estacionamento',
  'pequeno_almoco',
  'kitchenette',
  'frigorifico',
  'roupeiro',
  'secador_cabelo',
  'ferro_engomar',
  'rede_mosquito',
] as const;

const moneySchema = z
  .union([z.number(), z.string()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v > 0, { message: 'Preço deve ser maior que 0' });

export const createRoomDto = z
  .object({
    name: z.string().trim().min(2).max(160),
    type: z.enum(roomTypeValues),
    status: z.enum(roomStatusValues).default('disponivel'),
    description: z.string().trim().min(10).max(500),
    maxCapacity: z.number().int().min(1).max(50).default(1),
    bedLabel: z.string().trim().min(2).max(80).optional(),

    modalities: z
      .array(z.enum(bookingModalityValues))
      .min(1, 'Selecione pelo menos uma modalidade de reserva'),

    prices: z.object({
      hora: moneySchema.optional(),
      noite: moneySchema.optional(),
      semana: moneySchema.optional(),
      mes: moneySchema.optional(),
    }),

    priceLimits: z
      .object({
        hora: z.object({ min: z.number().int().min(1), max: z.number().int().min(1) }).optional(),
        noite: z.object({ min: z.number().int().min(1), max: z.number().int().min(1) }).optional(),
        semana: z.object({ min: z.number().int().min(1), max: z.number().int().min(1) }).optional(),
        mes: z.object({ min: z.number().int().min(1), max: z.number().int().min(1) }).optional(),
      })
      .optional(),

    amenities: z.array(z.enum(amenityValues)).default([]),

    images: z
      .array(httpsUrl)
      .min(1, 'Adicione pelo menos 1 foto')
      .max(10, 'Máximo de 10 fotos'),
  })
  .superRefine((data, ctx) => {
    for (const modality of data.modalities) {
      if (data.prices[modality] == null) {
        ctx.addIssue({
          code: 'custom',
          path: ['prices', modality],
          message: `Informe o preço para a modalidade "${modality}"`,
        });
      }
    }
  });

export type CreateRoomInput = z.infer<typeof createRoomDto>;
