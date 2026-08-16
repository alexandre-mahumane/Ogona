import { z } from 'zod';

const phoneOrEmail = z
  .string()
  .trim()
  .min(3, 'Campo obrigatório')
  .refine(
    (value) => value.includes('@') || /^(\+?258)?[0-9\s-]{9,}$/.test(value),
    'Introduza um e-mail ou telefone válido',
  );

export const loginSchema = z.object({
  identifier: phoneOrEmail,
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    role: z.enum(['guest', 'host']),
    name: z.string().trim().min(2, 'Nome obrigatório'),
    identifier: phoneOrEmail,
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirme a palavra-passe'),
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As palavras-passe não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.acceptTerms, {
    message: 'Aceite os termos para continuar',
    path: ['acceptTerms'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  identifier: phoneOrEmail,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Código deve ter 4 dígitos'),
});

export type OtpInput = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirme a palavra-passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As palavras-passe não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const walletSchema = z.object({
  provider: z.enum(['mpesa', 'emola']),
  phone: z
    .string()
    .trim()
    .min(9, 'Telefone inválido')
    .regex(/^\+?[0-9\s-]+$/, 'Use apenas dígitos'),
});

export type WalletInput = z.infer<typeof walletSchema>;

/** Extrai telefone para a API (backend actual usa phone). */
export function toPhone(identifier: string) {
  if (identifier.includes('@')) {
    return identifier.trim();
  }
  return identifier.replace(/\s|-/g, '');
}
