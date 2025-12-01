import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'error';
const isDevelopment = process.env.NODE_ENV === 'development' || 'production';

let logger;

try {
  logger = pino({
    level: logLevel,
    transport: isDevelopment ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    } : undefined, // JSON output in production
  });
} catch (error) {
  // Fallback to basic pino logger if pino-pretty is not available
  logger = pino({
    level: isDevelopment ? 'debug' : 'info',
  });
}

export default logger;