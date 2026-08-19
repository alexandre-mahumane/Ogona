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

    console.info('[otp] notify.start', {
      phone: input.phone,
      channel: input.channel,
      code: input.code,
      env: env.NODE_ENV,
      vonageSms: isVonageSmsConfigured(),
      vonageWhatsapp: isVonageConfigured(),
      pavullaSms: isSmsConfigured(),
      metaWhatsapp: isWhatsAppConfigured(),
    });

    if (env.NODE_ENV === 'test') {
      console.info('[otp] notify.test_skip', {
        phone: input.phone,
        channel: input.channel,
        code: input.code,
      });
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
      console.info('[otp] notify.sms.provider', { provider: 'vonage', phone });
      const result = await sendVonageSms(phone, message);
      console.info('[otp] notify.sms.result', {
        provider: 'vonage',
        phone,
        success: result.success,
        messageUuid: result.messageUuid,
        error: result.error,
      });
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
      console.warn('[otp] notify.sms.not_configured', {
        phone,
        env: env.NODE_ENV,
      });
      if (env.NODE_ENV === 'production') {
        throw new AppError(503, 'Envio de SMS não configurado', 'SMS_NOT_CONFIGURED');
      }
      console.info('[otp] notify.sms.stub', { phone, message });
      return;
    }

    console.info('[otp] notify.sms.provider', { provider: 'pavulla', phone });
    const result = await smsService(phone, message);
    console.info('[otp] notify.sms.result', {
      provider: 'pavulla',
      phone,
      success: result.success,
      error: result.error,
    });
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
      console.info('[otp] notify.whatsapp.provider', { provider: 'vonage', phone });
      const result = await sendVonageWhatsApp(phone, message);
      console.info('[otp] notify.whatsapp.result', {
        provider: 'vonage',
        phone,
        success: result.success,
        messageUuid: result.messageUuid,
        error: result.error,
      });
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
      console.warn('[otp] notify.whatsapp.not_configured', {
        phone,
        env: env.NODE_ENV,
      });
      if (env.NODE_ENV === 'production') {
        throw new AppError(503, 'Envio de WhatsApp não configurado', 'WHATSAPP_NOT_CONFIGURED');
      }
      console.info('[otp] notify.whatsapp.stub', { phone, code });
      return;
    }

    console.info('[otp] notify.whatsapp.provider', { provider: 'meta', phone });
    const result = await sendWhatsAppOtp(phone, code);
    console.info('[otp] notify.whatsapp.result', {
      provider: 'meta',
      phone,
      success: result.success,
      error: result.error,
    });
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
