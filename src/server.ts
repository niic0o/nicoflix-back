import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from '@config/database';
import { getEnvConfig } from '@config/env';
import { logger } from './utils/logger';

function startServer(): void {
  connectDatabase()
    .then(() => {
      const app = createApp();
      const { PORT, NODE_ENV } = getEnvConfig();

      const server = app.listen(PORT, () => {
        logger.info(`Servidor corriendo en http://localhost:${PORT}`);
        logger.info(`Entorno: ${NODE_ENV}`);
      });

      const gracefulShutdown = (signal: string): void => {
        logger.warn(`Recibida señal ${signal}. Cerrando servidor...`);
        server.close(() => {
          void (async () => {
            logger.info('Servidor HTTP cerrado');
            await disconnectDatabase();
            process.exit(0);
          })();
        });

        setTimeout(() => {
          logger.error('Cierre forzoso tras timeout');
          process.exit(1);
        }, 10000);
      };

      process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
    })
    .catch((error: unknown) => {
      logger.error('Error iniciando el servidor', error);
      process.exit(1);
    });
}

startServer();
