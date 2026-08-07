import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../types/express';
import { verifyToken } from '../utils/jwt';

/** Autenticação opcional — preenche req.user se houver Bearer válido. */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const payload = verifyToken(header.slice('Bearer '.length).trim());
    req.user = { id: payload.sub, phone: payload.phone, role: payload.role };
  } catch {
    // ignora token inválido em rotas públicas
  }

  next();
}
