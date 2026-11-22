import request from 'supertest';
import express from 'express';
import { errorHandler, notFoundHandler } from '@middlewares/error.middleware';
import { resetEnvConfig } from '@config/env';

function buildApp(): express.Application {
  const app = express();
  app.get('/boom', () => {
    throw new Error('detalle sensible');
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe('Error Handler Integration', () => {
  afterEach(() => {
    process.env.NODE_ENV = 'test';
    resetEnvConfig();
  });

  it('no filtra stack trace en producción', async () => {
    process.env.NODE_ENV = 'production';
    resetEnvConfig();

    const response = await request(buildApp()).get('/boom');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Error interno del servidor');
    expect(response.body.error.stack).toBeUndefined();
  });

  it('incluye stack trace en desarrollo', async () => {
    process.env.NODE_ENV = 'development';
    resetEnvConfig();

    const response = await request(buildApp()).get('/boom');

    expect(response.status).toBe(500);
    expect(response.body.error.stack).toBeDefined();
  });
});
