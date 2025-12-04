/**
 * Winston Logger Configuration
 * Provides structured logging throughout the application
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'easygen-platform' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs to `combined.log`
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production, log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Create logs directory if it doesn't exist (handled by winston)
export default logger;

/**
 * Helper functions for common log patterns
 */
export const loggers = {
  api: (method: string, path: string, statusCode: number, duration: number) => {
    logger.info('API Request', {
      method,
      path,
      statusCode,
      duration,
    });
  },

  error: (message: string, error: Error, context?: Record<string, any>) => {
    logger.error(message, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    });
  },

  db: (operation: string, model: string, duration: number) => {
    logger.debug('Database Operation', {
      operation,
      model,
      duration,
    });
  },

  ai: (provider: string, model: string, tokens: number, duration: number) => {
    logger.info('AI Request', {
      provider,
      model,
      tokens,
      duration,
    });
  },

  security: (event: string, userId?: string, details?: Record<string, any>) => {
    logger.warn('Security Event', {
      event,
      userId,
      ...details,
    });
  },
};
