/**
 * Configuration Management
 * Centralized configuration with validation
 */

import * as dotenv from 'dotenv';

dotenv.config();

interface Config {
  bot: {
    token: string;
    username?: string;
  };
  launchpad: {
    url: string;
  };
  webhook?: {
    domain: string;
    path: string;
    secret?: string;
  };
  security: {
    rateLimitWindow: number;
    rateLimitMax: number;
    maxMessageLength: number;
  };
  logging: {
    level: 'debug' | 'http' | 'info' | 'warn' | 'error';
    logsDir: string;
  };
}

function validateConfig(): Config {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken || botToken.trim() === '') {
    throw new Error('BOT_TOKEN is required in environment variables');
  }

  const launchpadUrl = process.env.LAUNCHPAD_URL || 'https://susumi.io/launchpad';
  if (!isValidUrl(launchpadUrl)) {
    throw new Error('LAUNCHPAD_URL must be a valid HTTPS URL');
  }

  const config: Config = {
    bot: {
      token: botToken,
      username: process.env.BOT_USERNAME,
    },
    launchpad: {
      url: launchpadUrl,
    },
    security: {
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
      maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || '4096', 10),
    },
    logging: {
      level: (process.env.LOG_LEVEL || 'info') as 'debug' | 'http' | 'info' | 'warn' | 'error',
      logsDir: process.env.LOGS_DIR || './logs',
    },
  };

  if (process.env.WEBHOOK_DOMAIN && process.env.WEBHOOK_PATH) {
    const webhookDomain = process.env.WEBHOOK_DOMAIN;
    if (!isValidUrl(webhookDomain)) {
      throw new Error('WEBHOOK_DOMAIN must be a valid HTTPS URL');
    }

    config.webhook = {
      domain: webhookDomain,
      path: process.env.WEBHOOK_PATH,
      secret: process.env.WEBHOOK_SECRET,
    };
  }

  return config;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const config = validateConfig();
