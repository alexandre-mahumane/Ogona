import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterAccountInput,
  ResetPasswordInput,
  SendOtpInput,
  VerifyOtpInput,
} from '../dtos/auth.dto';
import type { UpdateProfileInput } from '../dtos/profile.dto';
import { userRepository } from '../repositories/user.repository';
import { toPublicUser, type UserRole } from '../repositories/user.types';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors';
import { signToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import { notificationService } from './notification.service';
import { generateOtpCode, otpStore } from './otp.store';

export class AuthService {
  async registerGuest(input: RegisterAccountInput) {
    return this.registerAccount(input, 'guest');
  }

  async registerHost(input: RegisterAccountInput) {
    return this.registerAccount(input, 'host');
  }

  private async registerAccount(input: RegisterAccountInput, role: UserRole) {
    const existing = await userRepository.findByPhone(input.phone);
    if (existing) {
      throw new ConflictError('Número de celular já registado');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      phone: input.phone,
      birthDate: input.birthDate,
      role,
      passwordHash,
    });

    const publicUser = toPublicUser(user);
    const token = signToken({ sub: user.id, phone: user.phone, role: user.role });

    return { user: publicUser, token };
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByPhone(input.phone);
    if (!user) {
      throw new UnauthorizedError('Número ou senha inválidos');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Número ou senha inválidos');
    }

    const publicUser = toPublicUser(user);
    const token = signToken({ sub: user.id, phone: user.phone, role: user.role });

    return { user: publicUser, token };
  }

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Utilizador não encontrado');
    }
    return toPublicUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (Object.keys(input).length === 0) {
      return this.me(userId);
    }
    const user = await userRepository.updateProfile(userId, input);
    return toPublicUser(user);
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByPhone(input.phone);
    if (!user) {
      throw new NotFoundError('Conta não encontrada com este número');
    }

    return {
      phone: user.phone,
      maskedPhone: maskPhone(user.phone),
    };
  }

  async sendPasswordOtp(input: SendOtpInput) {
    const user = await userRepository.findByPhone(input.phone);
    if (!user) {
      throw new NotFoundError('Conta não encontrada com este número');
    }

    const code = generateOtpCode();
    await otpStore.saveOtp(input.phone, input.channel, code);
    await notificationService.sendOtp({
      phone: input.phone,
      code,
      channel: input.channel,
    });

    return {
      phone: input.phone,
      channel: input.channel,
      message: `Código enviado via ${input.channel === 'sms' ? 'SMS' : 'WhatsApp'}`,
    };
  }

  async sendRegisterOtp(input: SendOtpInput) {
    const existing = await userRepository.findByPhone(input.phone);
    if (existing) {
      throw new ConflictError('Número de celular já registado');
    }

    const code = generateOtpCode();
    await otpStore.saveOtp(input.phone, input.channel, code, 'register');
    await notificationService.sendOtp({
      phone: input.phone,
      code,
      channel: input.channel,
    });

    return {
      phone: input.phone,
      channel: input.channel,
      message: `Código enviado via ${input.channel === 'sms' ? 'SMS' : 'WhatsApp'}`,
    };
  }

  async verifyPasswordOtp(input: VerifyOtpInput) {
    const user = await userRepository.findByPhone(input.phone);
    if (!user) {
      throw new NotFoundError('Conta não encontrada com este número');
    }

    await otpStore.verifyOtp(input.phone, input.code);
    const resetToken = await otpStore.createResetToken(user.id);

    return { resetToken };
  }

  async verifyRegisterOtp(input: VerifyOtpInput) {
    await otpStore.verifyOtp(input.phone, input.code, 'register');
    return { verified: true };
  }

  async resetPassword(input: ResetPasswordInput) {
    const userId = await otpStore.consumeResetToken(input.resetToken);
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.updatePassword(userId, passwordHash);
    const publicUser = toPublicUser(user);
    const token = signToken({ sub: user.id, phone: user.phone, role: user.role });

    return { user: publicUser, token };
  }
}

function maskPhone(phone: string): string {
  if (phone.length < 6) {
    return phone;
  }
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
}

export const authService = new AuthService();
