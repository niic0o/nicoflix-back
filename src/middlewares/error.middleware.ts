import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { getEnvConfig } from '@config/env';
import type { AppError } from '@utils/errors';
import {
  isAppError,
  ValidationError,
  InternalServerError,
} from '@utils/errors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const { NODE_ENV } = getEnvConfig();

  if (err instanceof ZodError) {
    const validationError = new ValidationError('Error de validación', err.flatten().fieldErrors);
    sendErrorResponse(res, validationError);
    return;
  }

  if (isAppError(err)) {
    sendErrorResponse(res, err);
    return;
  }

  const internalError = new InternalServerError(
    NODE_ENV === 'production' ? 'Error interno del servidor' : err.message
  );
  sendErrorResponse(res, internalError);
}

function sendErrorResponse(res: Response, error: AppError): void {
  const { NODE_ENV } = getEnvConfig();

  const errorResponse: {
    message: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
  } = {
    message: error.message,
    statusCode: error.statusCode,
  };

  if (error.details) {
    errorResponse.details = error.details;
  }

  if (NODE_ENV === 'development' && error.stack) {
    errorResponse.stack = error.stack;
  }

  const response = {
    success: false,
    error: errorResponse,
  };

  res.status(error.statusCode).json(response);
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      message: 'Ruta no encontrada',
      statusCode: 404,
    },
  });
}