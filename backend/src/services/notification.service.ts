import type { OtpChannel } from '../dtos/auth.dto';
import { env } from '../config/env';

export type SendOtpInput = {
  phone: string;
  code: string;
  channel: OtpChannel;
};

/**
 * Stub de envio SMS/WhatsApp.
 * Em produção: integrar Twilio / Meta WhatsApp Cloud API / provedor local.
 */
export class NotificationService {
  async sendOtp(input: SendOtpInput): Promise<void> {
    if (env.NODE_ENV !== 'production') {
      console.info(
        `[notification:stub] OTP ${input.code} → ${input.phone} via ${input.channel}`,
      );
      return;
    }

    // Placeholder: falhar de forma explícita até haver credenciais reais
    throw new Error(
      `OTP delivery via ${input.channel} not configured. Set up SMS/WhatsApp provider.`,
    );
  }
}

export const notificationService = new NotificationService();
