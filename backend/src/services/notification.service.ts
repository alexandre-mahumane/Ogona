import { env } from '../config/env';
import type { OtpChannel } from '../dtos/auth.dto';
import { AppError } from '../utils/errors';
import { isSmsConfigured, smsService } from './sms.service';
import { isVonageConfigured, isVonageSmsConfigured, sendVonageSms, sendVonageWhatsApp } from './vonage.service';
import { isWhatsAppConfigured, sendWhatsAppOtp } from './whatsapp.service';

export type SendOtpInput = {
  phone: string;
  code: string;
  channel: OtpChannel;
};

export class NotificationService {
  async sendOtp(input: SendOtpInput): Promise<void> {
    const minutes = Math.max(1, Math.round(env.OTP_TTL_SECONDS / 60));
    const message = `Ogona: o seu código é ${input.code}. Válido por ${minutes} min.`;

    if (env.NODE_ENV === 'test') {
      console.info(`[notification:test] OTP ${input.code} → ${input.phone} via ${input.channel}`);
      return;
    }

    if (input.channel === 'whatsapp') {
      await this.sendWhatsApp(input.phone, input.code, message);
      return;
    }

    await this.sendSms(input.phone, message);
  }

  private async sendSms(phone: string, message: string): Promise<void> {
    if (isVonageSmsConfigured()) {
      const result = await sendVonageSms(phone, message);
      if (!result.success) {
        throw new AppError(
          502,
          result.error ?? 'Não foi possível enviar o SMS. Tente novamente.',
          'SMS_FAILED',
        );
      }
      return;
    }

    if (!isSmsConfigured()) {
      if (env.NODE_ENV === 'production') {
        throw new AppError(503, 'Envio de SMS não configurado', 'SMS_NOT_CONFIGURED');
      }
      console.info(`[notification:stub] OTP SMS → ${phone}`);
      return;
    }

    const result = await smsService(phone, message);
    if (!result.success) {
      throw new AppError(
        502,
        result.error ?? 'Não foi possível enviar o SMS. Tente novamente.',
        'SMS_FAILED',
      );
    }
  }

  private async sendWhatsApp(phone: string, code: string, message: string): Promise<void> {
    if (isVonageConfigured()) {
      const result = await sendVonageWhatsApp(phone, message);
      if (!result.success) {
        throw new AppError(
          502,
          result.error ?? 'Não foi possível enviar o WhatsApp. Tente novamente.',
          'WHATSAPP_FAILED',
        );
      }
      return;
    }

    if (!isWhatsAppConfigured()) {
      if (env.NODE_ENV === 'production') {
        throw new AppError(503, 'Envio de WhatsApp não configurado', 'WHATSAPP_NOT_CONFIGURED');
      }
      console.info(`[notification:stub] OTP WhatsApp → ${phone}`);
      return;
    }

    const result = await sendWhatsAppOtp(phone, code);
    if (!result.success) {
      throw new AppError(
        502,
        result.error ?? 'Não foi possível enviar o WhatsApp. Tente novamente.',
        'WHATSAPP_FAILED',
      );
    }
  }
}

export const notificationService = new NotificationService();
