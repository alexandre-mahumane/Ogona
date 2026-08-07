import type { Request } from 'express';
import type { UserRole } from '../repositories/user.types';

export type AuthUser = {
  id: string;
  phone: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};
