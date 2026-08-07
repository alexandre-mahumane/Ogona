import { z } from 'zod';

export const updateProfileDto = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((v) => v.toLowerCase())
    .optional()
    .nullable(),
  photoUrl: z.string().url().max(2048).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileDto>;
