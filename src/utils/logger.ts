type LogLevel = 'info' | 'warn' | 'error' | 'success';

const streams: Record<LogLevel, NodeJS.WriteStream> = {
  info: process.stdout,
  success: process.stdout,
  warn: process.stderr,
  error: process.stderr,
};

function serializeMeta(meta: unknown): string {
  if (meta instanceof Error) {
    return JSON.stringify({ name: meta.name, message: meta.message, stack: meta.stack });
  }

  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
}

function write(level: LogLevel, message: string, meta?: unknown): void {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  const output = meta === undefined ? line : `${line} ${serializeMeta(meta)}`;
  streams[level].write(`${output}\n`);
}

/**
 * Logger centralizado para reemplazar `console.*` en el código fuente.
 * Separa salida informativa (stdout) de advertencias/errores (stderr).
 */
export const logger = {
  info: (message: string, meta?: unknown): void => write('info', message, meta),
  success: (message: string, meta?: unknown): void => write('success', message, meta),
  warn: (message: string, meta?: unknown): void => write('warn', message, meta),
  error: (message: string, meta?: unknown): void => write('error', message, meta),
};
