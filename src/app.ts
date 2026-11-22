import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getEnvConfig } from '@config/env';
import routes from '@routes/index';
import { errorHandler, notFoundHandler } from '@middlewares/error.middleware';

export function createApp(): express.Application {
  const { CORS_ORIGIN } = getEnvConfig();

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}