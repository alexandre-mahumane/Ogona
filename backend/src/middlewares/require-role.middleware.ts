import type { NextFunction, Response } from 'express';
import type { UserRole } from '../repositories/user.types';
import type { AuthenticatedRequest } from '../types/express';
import { ForbiddenError } from '../utils/errors';

export function requireRole(role: UserRole) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      next(new ForbiddenError(`Apenas utilizadores com papel "${role}" podem aceder`));
      return;
    }
    next();
  };
}
