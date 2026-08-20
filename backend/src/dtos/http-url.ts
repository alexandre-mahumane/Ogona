import { z } from 'zod';

export function emptyToUndefined(value: unknown) {
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

export const httpsUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => /^https:\/\//i.test(value), {
    message: 'URL da imagem inválido',
  });

export const optionalHttpsUrl = z.preprocess(emptyToUndefined, httpsUrl.optional());
