import type { Request, Response } from 'express';
import { getConnectionStatus } from '@config/database';
import { formatResponse } from '@utils/helpers';

export function healthCheck(_req: Request, res: Response): void {
  const dbConnected = getConnectionStatus();
  const status = dbConnected ? 'ok' : 'degraded';
  const statusCode = dbConnected ? 200 : 503;

  const responseData = {
    status,
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  if (dbConnected) {
    res.status(statusCode).json(formatResponse(responseData, 'Health check completado'));
  } else {
    res.status(statusCode).json({
      success: false,
      error: {
        message: 'Servicio degradado: base de datos no disponible',
        statusCode,
        details: responseData,
      },
    });
  }
}