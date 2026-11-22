import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnvConfig } from '@config/env';
import { UnauthorizedError, ForbiddenError } from '@utils/errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function verifyToken(token: string): AuthenticatedUser {
  const { JWT_SECRET } = getEnvConfig();
  const decoded: unknown = jwt.verify(token, JWT_SECRET);

  if (typeof decoded !== 'object' || decoded === null) {
    throw new jwt.JsonWebTokenError('Token inválido');
  }

  const payload = decoded as Record<string, unknown>;
  const { id, email, role } = payload;

  if (typeof id !== 'string' || typeof email !== 'string') {
    throw new jwt.JsonWebTokenError('Token inválido');
  }

  return {
    id,
    email,
    role: typeof role === 'string' ? role : undefined,
  };
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    next(new UnauthorizedError('Token de autorización requerido'));
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expirado'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Token inválido'));
    } else {
      next(error);
    }
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Usuario no autenticado'));
      return;
    }

    if (allowedRoles.length > 0 && (!req.user.role || !allowedRoles.includes(req.user.role))) {
      next(new ForbiddenError('Permisos insuficientes'));
      return;
    }

    next();
  };
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    next();
    return;
  }

  try {
    req.user = verifyToken(token);
  } catch {
    // En autenticación opcional, un token inválido no bloquea la petición.
  }

  next();
}
