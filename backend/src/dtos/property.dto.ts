import { z } from 'zod';
import { isValidPhone, normalizePhone } from '../utils/phone';
import { emptyToUndefined, optionalHttpsUrl } from './http-url';

const phoneField = z
  .string()
  .trim()
  .min(9)
  .max(32)
  .transform(normalizePhone)
  .refine(isValidPhone, { message: 'Número de celular inválido' });

export const provinceValues = [
  'maputo_cidade',
  'maputo_provincia',
  'gaza',
  'inhambane',
  'sofala',
  'manica',
  'tete',
  'zambezia',
  'nampula',
  'cabo_delgado',
  'niassa',
] as const;

export const communityValues = [
  'polana',
  'sommerschield',
  'costa_do_sol',
  'bairro_central',
  'malhangalene',
  'maxaquene',
  'alto_mae',
  'coop',
  'triunfo',
  'matola_cidade',
  'matola_rio',
  'ka_tembe',
  'catembe',
  'marracuene',
  'xai_xai',
  'bilene',
  'inhambane_cidade',
  'tofo',
  'barra',
  'vilanculos',
  'bazaruto',
  'beira',
  'chimoio',
  'tete_cidade',
  'quelimane',
  'nampula_cidade',
  'ilha_de_mocambique',
  'pemba',
  'nacala',
  'lichinga',
  'outra',
] as const;

export const propertyTypeValues = [
  'pensao',
  'apartamento',
  'hotel',
  'casa',
  'hostel',
  'villa',
  'lodge',
  'resort',
] as const;

export const propertyStatusValues = [
  'draft',
  'published',
  'hidden',
  'under_review',
] as const;

export const createPropertyDto = z.object({
  name: z.string().trim().min(2).max(160),
  type: z.enum(propertyTypeValues),
  description: z.string().trim().min(10).max(500),
  contactPhone: phoneField,
  whatsapp: z.preprocess(emptyToUndefined, phoneField.optional()),
  coverImageUrl: optionalHttpsUrl,

  province: z.enum(provinceValues),
  city: z.string().trim().min(2).max(120),
  community: z.enum(communityValues).optional(),
  neighborhood: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(255),
  postalCode: z.preprocess(emptyToUndefined, z.string().trim().min(2).max(20).optional()),

  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  bathrooms: z.number().int().min(0).max(50).optional().default(1),
  parkingSpots: z.number().int().min(0).max(50).optional().default(0),
  houseRules: z.array(z.string().trim().min(2).max(200)).max(20).optional().default([]),
});

export const updatePropertyDto = createPropertyDto.partial();

export const listPropertiesQueryDto = z.object({
  status: z
    .enum(['all', 'draft', 'published', 'hidden', 'under_review'])
    .optional()
    .default('all'),
  search: z.string().trim().max(120).optional(),
});

export const setPropertyStatusDto = z.object({
  status: z.enum(propertyStatusValues),
});

export type CreatePropertyInput = z.infer<typeof createPropertyDto>;
export type UpdatePropertyInput = z.infer<typeof updatePropertyDto>;
export type ListPropertiesQuery = z.infer<typeof listPropertiesQueryDto>;
