import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
loadEnv({ path: envFile, override: process.env.NODE_ENV === 'test' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  RESET_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  PAVULLA_API_KEY: z.string().min(1).optional(),
  SMS_PROVIDER_ID: z.string().min(1).optional(),
  PAVULLA_SMS_SENDER: z.string().default(''),
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().default('v21.0'),
  WHATSAPP_OTP_TEMPLATE_NAME: z.string().optional(),
  WHATSAPP_OTP_TEMPLATE_LANG: z.string().default('pt_PT'),
  WHATSAPP_OTP_BUTTON: z.enum(['none', 'copy_code', 'url']).default('none'),
  VONAGE_API_KEY: z.string().optional(),
  VONAGE_API_SECRET: z.string().optional(),
  VONAGE_WHATSAPP_FROM: z.string().optional(),
  VONAGE_MESSAGES_URL: z.string().url().default('https://messages-sandbox.nexmo.com/v1/messages'),
  VONAGE_SMS_FROM: z.string().default('Ogona'),
  VONAGE_SMS_URL: z.string().url().default('https://rest.nexmo.com/sms/json'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
