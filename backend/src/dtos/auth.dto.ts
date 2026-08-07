import { z } from 'zod';
import { isValidPhone, normalizePhone } from '../utils/phone';

const phoneField = z
  .string()
  .trim()
  .min(9)
  .max(32)
  .transform(normalizePhone)
  .refine(isValidPhone, { message: 'Número de celular inválido' });

/** Aceita DD/MM/YYYY e devolve Date (UTC). */
const birthDateField = z
  .string()
  .trim()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato DD/MM/YYYY')
  .transform((value, ctx) => {
    const [day, month, year] = value.split('/').map(Number) as [number, number, number];
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      ctx.addIssue({ code: 'custom', message: 'Data de nascimento inválida' });
      return z.NEVER;
    }

    const today = new Date();
    let age = today.getUTCFullYear() - year;
    const monthDiff = today.getUTCMonth() - (month - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < day)) {
      age -= 1;
    }

    if (age < 18) {
      ctx.addIssue({ code: 'custom', message: 'Deve ter pelo menos 18 anos' });
      return z.NEVER;
    }

    if (age > 120) {
      ctx.addIssue({ code: 'custom', message: 'Data de nascimento inválida' });
      return z.NEVER;
    }

    return date;
  });

export const otpChannelDto = z.enum(['sms', 'whatsapp']);
export type OtpChannel = z.infer<typeof otpChannelDto>;

/** Base do cadastro (hóspede / anfitrião). */
export const registerAccountDto = z
  .object({
    name: z.string().trim().min(2).max(120),
    birthDate: birthDateField,
    phone: phoneField,
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const registerGuestDto = registerAccountDto;
export const registerHostDto = registerAccountDto;

export const loginDto = z.object({
  phone: phoneField,
  password: z.string().min(1),
});

export const forgotPasswordDto = z.object({
  phone: phoneField,
});

export const sendOtpDto = z.object({
  phone: phoneField,
  channel: otpChannelDto,
});

export const verifyOtpDto = z.object({
  phone: phoneField,
  code: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Código deve ter 4 dígitos'),
});

export const resetPasswordDto = z
  .object({
    resetToken: z.string().uuid(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterAccountInput = z.infer<typeof registerAccountDto>;
export type LoginInput = z.infer<typeof loginDto>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordDto>;
export type SendOtpInput = z.infer<typeof sendOtpDto>;
export type VerifyOtpInput = z.infer<typeof verifyOtpDto>;
export type ResetPasswordInput = z.infer<typeof resetPasswordDto>;
