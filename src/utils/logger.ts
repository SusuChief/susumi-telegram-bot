/**
 * Winston Logger Configuration
 * 
 * Production-ready logging with:
 * - Console output with colors
 * - Daily rotating file logs (production)
 * - Separate error log file
 * - JSON structured logging
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { config } from '../config';

const isProduction = process.env.NODE_ENV === 'production';

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level } = info;
    // coerce message and meta as suggested by lint error
    const message = typeof info.message === "string" ? info.message : JSON.stringify(info.message);
    const { message: _, level: __, timestamp: ___, ...meta } = info;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// JSON format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

winston.addColors(colors);

// Build transports
const transports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat }),
];

// Add file transports in production
if (isProduction) {
  const logsDir = path.resolve(config.logging.logsDir);

  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: fileFormat,
    })
  );
}

// Create logger
const winstonLogger = winston.createLogger({
  levels,
  level: config.logging.level,
  defaultMeta: { service: 'susumi-telegram-bot' },
  transports,
});

// Logger wrapper with typed methods
class Logger {
  debug(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.debug(message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.info(message, meta);
  }

  http(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.log('http', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.warn(message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorMeta: Record<string, unknown> = { ...meta };
    
    if (error instanceof Error) {
      errorMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error !== undefined) {
      errorMeta.error = String(error);
    }

    winstonLogger.error(message, errorMeta);
  }

  userAction(action: string, userId?: number, username?: string, meta?: Record<string, unknown>): void {
    winstonLogger.info(action, { ...meta, user: { id: userId, username } });
  }

  command(command: string, userId?: number, username?: string, success = true, meta?: Record<string, unknown>): void {
    const level = success ? 'info' : 'warn';
    winstonLogger.log(level, `Command: ${command}`, {
      ...meta,
      command,
      success,
      user: { id: userId, username },
    });
  }

  webhook(event: string, meta?: Record<string, unknown>): void {
    winstonLogger.info(`Webhook: ${event}`, { ...meta, type: 'webhook' });
  }

  metric(name: string, value: number, unit: string, meta?: Record<string, unknown>): void {
    winstonLogger.info(`Metric: ${name}`, { ...meta, metric: { name, value, unit } });
  }

  startTimer(label: string): () => void {
    const start = Date.now();
    return () => this.metric(label, Date.now() - start, 'ms');
  }

  startup(mode: string, meta?: Record<string, unknown>): void {
    winstonLogger.info('🚀 Bot starting', {
      ...meta,
      mode,
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    });
  }

  shutdown(signal: string, meta?: Record<string, unknown>): void {
    winstonLogger.info('🛑 Bot shutting down', { ...meta, signal, uptime: process.uptime() });
  }

  healthCheck(meta?: Record<string, unknown>): void {
    const mem = process.memoryUsage();
    winstonLogger.info('💓 Health check', {
      ...meta,
      uptime: process.uptime(),
      memory: {
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
      },
    });
  }
}

export const logger = new Logger();
export { winstonLogger };
