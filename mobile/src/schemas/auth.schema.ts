import { z } from 'zod';

const phoneField = z
  .string()
  .trim()
  .min(9, 'Telefone inválido')
  .regex(/^\+?[0-9\s-]+$/, 'Use apenas dígitos');

export const loginSchema = z.object({
  identifier: phoneField,
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const DEFAULT_BIRTH_DATE = '01/01/1995';

export const registerAccountSchema = z
  .object({
    role: z.enum(['guest', 'host']),
    name: z.string().trim().min(2, 'Nome obrigatório'),
    identifier: phoneField,
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirme a palavra-passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As palavras-passe não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterAccountInput = z.infer<typeof registerAccountSchema>;

export const registerBusinessSchema = z.object({
  businessName: z.string().trim().min(2, 'Nome obrigatório'),
  propertyType: z.string().min(1, 'Seleccione o tipo'),
  province: z.string().min(1, 'Seleccione a província'),
  city: z.string().trim().min(2, 'Cidade obrigatória'),
  whatsapp: phoneField,
  altPhone: phoneField,
});

export type RegisterBusinessInput = z.infer<typeof registerBusinessSchema>;

export const registerSchema = registerAccountSchema;
export type RegisterInput = RegisterAccountInput;

export const forgotPasswordSchema = z.object({
  identifier: phoneField,
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
  phone: phoneField,
});

export type WalletInput = z.infer<typeof walletSchema>;

/** Extrai telefone para a API (backend actual usa phone). */
export function toPhone(identifier: string) {
  return identifier.replace(/\s|-/g, '');
}

export function isValidMzPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('258') ? digits.slice(3) : digits;
  return local.length >= 9;
}

export function formatDisplayPhone(identifier: string) {
  const digits = identifier.replace(/\D/g, '');
  const local = digits.startsWith('258') ? digits.slice(3) : digits;
  if (local.length < 9) return identifier.trim();
  const n = local.slice(0, 9);
  return `+258 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
}
