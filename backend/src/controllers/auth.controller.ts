import type { Request, Response } from 'express';
import { env } from '../config/env';
import { authService } from '../services/auth.service';
import type { AuthenticatedRequest } from '../types/express';
import { UnauthorizedError } from '../utils/errors';

export class AuthController {
  async registerGuest(req: Request, res: Response): Promise<void> {
    const result = await authService.registerGuest(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  }

  async registerHost(req: Request, res: Response): Promise<void> {
    const result = await authService.registerHost(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await authService.me(req.user.id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: { user },
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async sendPasswordOtp(req: Request, res: Response): Promise<void> {
    const result = await authService.sendPasswordOtp(req.body);
    res.status(200).json({
      success: true,
      data: {
        ...result,
        expiresInSeconds: env.OTP_TTL_SECONDS,
      },
    });
  }

  async sendRegisterOtp(req: Request, res: Response): Promise<void> {
    const result = await authService.sendRegisterOtp(req.body);
    res.status(200).json({
      success: true,
      data: {
        ...result,
        expiresInSeconds: env.OTP_TTL_SECONDS,
      },
    });
  }

  async verifyPasswordOtp(req: Request, res: Response): Promise<void> {
    const result = await authService.verifyPasswordOtp(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async verifyRegisterOtp(req: Request, res: Response): Promise<void> {
    const result = await authService.verifyRegisterOtp(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const result = await authService.resetPassword(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  }
}

export const authController = new AuthController();
