/**
 * Susumi Pioneer Telegram Bot
 * Production-ready Telegram bot for NFT launchpad
 */

import { Telegraf, Context } from 'telegraf';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { securityMiddleware } from './middleware/security';
import {
  handleStart,
  handleTiers,
  handlePrice,
  handleSupply,
  handlePhase,
  handleMint,
  handleHelp,
} from './handlers/commands';
import {
  handleTiersCallback,
  handlePriceCallback,
  handleSupplyCallback,
  handlePhaseCallback,
} from './handlers/callbacks';

const bot = new Telegraf(config.bot.token);

bot.use(errorHandler);
bot.use(securityMiddleware);
bot.use(rateLimiter);

bot.start(handleStart);
bot.command('tiers', handleTiers);
bot.command('price', handlePrice);
bot.command('supply', handleSupply);
bot.command('phase', handlePhase);
bot.command('mint', handleMint);
bot.command('help', handleHelp);

bot.action('tiers', handleTiersCallback);
bot.action('price', handlePriceCallback);
bot.action('supply', handleSupplyCallback);
bot.action('phase', handlePhaseCallback);

bot.catch((err: unknown, ctx: Context) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('Unhandled bot error', error, {
    updateType: ctx.updateType,
    userId: ctx.from?.id,
  });
});

function healthCheck(): void {
  logger.healthCheck({
    hasWebhook: !!config.webhook,
    launchpadUrl: config.launchpad.url,
  });
}

const launchBot = async (): Promise<void> => {
  const mode = config.webhook ? 'webhook' : 'polling';
  
  logger.startup(mode, {
    username: config.bot.username,
    launchpadUrl: config.launchpad.url,
  });

  try {
    if (config.webhook) {
      const webhookUrl = `${config.webhook.domain}${config.webhook.path}`;
      
      await bot.telegram.setWebhook(webhookUrl, {
        secret_token: config.webhook.secret,
      });
      
      logger.webhook('configured', {
        url: webhookUrl,
        hasSecret: !!config.webhook.secret,
      });
    } else {
      await bot.launch({
        dropPendingUpdates: true,
      });
      
      logger.info('Bot running with long polling');
    }

    logger.info('✅ Bot initialized successfully', {
      username: config.bot.username,
      launchpadUrl: config.launchpad.url,
      mode,
    });

    // Health check every 5 minutes
    setInterval(healthCheck, 300000);
    healthCheck();
  } catch (error) {
    logger.error('Failed to launch bot', error as Error);
    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  logger.shutdown(signal);
  
  try {
    if (config.webhook) {
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      logger.info('Webhook deleted');
    } else {
      await bot.stop(signal);
    }
    
    logger.info('✅ Bot stopped successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error as Error);
    process.exit(1);
  }
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled rejection', new Error(String(reason)), {
    promise: String(promise),
  });
  shutdown('unhandledRejection');
});

// Only auto-launch if this is the main module (not imported by server.ts)
if (require.main === module) {
  launchBot();
}

export { bot, launchBot };
