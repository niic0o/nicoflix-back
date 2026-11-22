import mongoose from 'mongoose';
import { getEnvConfig } from './env';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    return;
  }

  const { MONGO_URI } = getEnvConfig();

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  console.log('🔌 Desconectado de MongoDB');
}

export function getConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}