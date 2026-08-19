import { z } from 'zod';
import { propertyTypeValues } from './property.dto';

export const discoverPropertiesQueryDto = z.object({
  q: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  type: z.enum(propertyTypeValues).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minRooms: z.coerce.number().int().min(1).optional(),
  minBathrooms: z.coerce.number().int().min(1).optional(),
  minParking: z.coerce.number().int().min(0).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  sort: z.enum(['relevance', 'distance', 'price_asc', 'price_desc', 'rating', 'popular']).default('relevance'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const discoverHomeQueryDto = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export const listPropertyReviewsQueryDto = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type DiscoverPropertiesQuery = z.infer<typeof discoverPropertiesQueryDto>;
export type DiscoverHomeQuery = z.infer<typeof discoverHomeQueryDto>;
export type ListPropertyReviewsQuery = z.infer<typeof listPropertyReviewsQueryDto>;
