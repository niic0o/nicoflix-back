import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { getEnvConfig } from '@config/env';
import { UnauthorizedError, ForbiddenError } from '@utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Token de autorización requerido'));
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    next(new UnauthorizedError('Token de autorización requerido'));
    return;
  }

  try {
    const { JWT_SECRET } = getEnvConfig();
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload & {
      id: string;
      email: string;
      role?: string;
    };

    if (decoded.id && decoded.email) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

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

    if (allowedRoles.length > 0 && req.user.role && !allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Permisos insuficientes'));
      return;
    }

    next();
  };
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const { JWT_SECRET } = getEnvConfig();
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload & {
      id: string;
      email: string;
      role?: string;
    };

    if (decoded.id && decoded.email) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }
  } catch {
    // Silenciosamente ignoramos tokens inválidos en auth opcional
  }

  next();
}