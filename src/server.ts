/**
 * Webhook Server for Production
 * Express server to handle Telegram webhooks
 */

import express from 'express';
import { bot, launchBot } from './index';
import { config } from './config';
import { logger } from './utils/logger';

if (!config.webhook) {
  logger.error('Webhook configuration is required for server mode');
  logger.error('Set WEBHOOK_DOMAIN and WEBHOOK_PATH environment variables');
  process.exit(1);
}

const app = express();

app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness check (for k8s)
app.get('/ready', (_req, res) => {
  res.json({ ready: true });
});

// Telegram webhook handler
app.use(bot.webhookCallback(config.webhook.path, {
  secretToken: config.webhook.secret,
}));

const PORT = process.env.PORT || 3000;

// Initialize bot and start server
launchBot().then(() => {
  app.listen(PORT, () => {
    logger.webhook('server_started', {
      port: PORT,
      webhookPath: config.webhook?.path,
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  });
}).catch((error) => {
  logger.error('Failed to initialize bot', error);
  process.exit(1);
});
