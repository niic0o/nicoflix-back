import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from '@config/database';
import { getEnvConfig } from '@config/env';

function startServer(): void {
  connectDatabase()
    .then(() => {
      const app = createApp();
      const { PORT } = getEnvConfig();

      const server = app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📚 Entorno: ${getEnvConfig().NODE_ENV}`);
      });

      const gracefulShutdown = (signal: string): void => {
        console.log(`\n⚠️  Recibida señal ${signal}. Cerrando servidor...`);
        server.close(() => {
          void (async () => {
            console.log('🔌 Servidor HTTP cerrado');
            await disconnectDatabase();
            process.exit(0);
          })();
        });

        setTimeout(() => {
          console.error('❌ Cierre forzoso tras timeout');
          process.exit(1);
        }, 10000);
      };

      process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
    })
    .catch((error) => {
      console.error('❌ Error iniciando el servidor:', error);
      process.exit(1);
    });
}

startServer();