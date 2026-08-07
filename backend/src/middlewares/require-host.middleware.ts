import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../types/express';
import { ForbiddenError } from '../utils/errors';

export function requireHost(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== 'host') {
    next(new ForbiddenError('Apenas anfitriões podem aceder a este recurso'));
    return;
  }
  next();
}
