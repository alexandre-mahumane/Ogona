import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import {
  forgotPasswordDto,
  loginDto,
  registerGuestDto,
  registerHostDto,
  resetPasswordDto,
  sendOtpDto,
  verifyOtpDto,
} from '../dtos/auth.dto';
import { updateProfileDto } from '../dtos/profile.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

export const authRoutes = Router();

authRoutes.post(
  '/register/guest',
  validate(registerGuestDto),
  asyncHandler((req, res) => authController.registerGuest(req, res)),
);

authRoutes.post(
  '/register/host',
  validate(registerHostDto),
  asyncHandler((req, res) => authController.registerHost(req, res)),
);

authRoutes.post(
  '/register/send-otp',
  validate(sendOtpDto),
  asyncHandler((req, res) => authController.sendRegisterOtp(req, res)),
);

authRoutes.post(
  '/register/verify-otp',
  validate(verifyOtpDto),
  asyncHandler((req, res) => authController.verifyRegisterOtp(req, res)),
);

authRoutes.post(
  '/login',
  validate(loginDto),
  asyncHandler((req, res) => authController.login(req, res)),
);

authRoutes.get(
  '/me',
  authenticate,
  asyncHandler((req, res) => authController.me(req, res)),
);

authRoutes.patch(
  '/me',
  authenticate,
  validate(updateProfileDto),
  asyncHandler((req, res) => authController.updateProfile(req, res)),
);

authRoutes.post(
  '/password/forgot',
  validate(forgotPasswordDto),
  asyncHandler((req, res) => authController.forgotPassword(req, res)),
);

authRoutes.post(
  '/password/send-otp',
  validate(sendOtpDto),
  asyncHandler((req, res) => authController.sendPasswordOtp(req, res)),
);

authRoutes.post(
  '/password/verify-otp',
  validate(verifyOtpDto),
  asyncHandler((req, res) => authController.verifyPasswordOtp(req, res)),
);

authRoutes.post(
  '/password/reset',
  validate(resetPasswordDto),
  asyncHandler((req, res) => authController.resetPassword(req, res)),
);
