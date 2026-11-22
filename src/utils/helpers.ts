export function formatResponse<T>(data: T, message?: string): { success: true; data: T; message?: string } {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

export function formatErrorResponse(error: Error, statusCode: number, details?: unknown): {
  success: false;
  error: { message: string; statusCode: number; details?: unknown };
} {
  return {
    success: false,
    error: {
      message: error.message,
      statusCode,
      details,
    },
  };
}

import type { Request, Response, NextFunction } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';

type AsyncHandlerFn<T extends Request = Request> = (req: T, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler<T extends Request = Request>(fn: AsyncHandlerFn<T>) {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function jwtSign(payload: string | object | Buffer, secret: jwt.Secret, options?: SignOptions): string {
  return jwt.sign(payload, secret, options) as string; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T, allowedKeys: string[]): Partial<T> {
  const sanitized: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (key in obj) {
      sanitized[key] = obj[key];
    }
  }
  return sanitized as Partial<T>;
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}