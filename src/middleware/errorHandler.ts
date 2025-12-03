/**
 * Error Handling Middleware
 * Centralized error handling and logging
 */

import { Context, MiddlewareFn } from 'telegraf';
import { logger } from '../utils/logger';
import { Message } from 'telegraf/typings/core/types/typegram';

export const errorHandler: MiddlewareFn<Context> = async (ctx, next) => {
  const startTime = Date.now();
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
  try {
    await next();
    
    // Log successful request duration
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        userId,
        username,
        updateType: ctx.updateType,
        duration: `${duration}ms`,
      });
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const duration = Date.now() - startTime;
    
    // Extract command or callback data safely
    const message = ctx.message as Message.TextMessage | undefined;
    // Check if callbackQuery has 'data' property (not all types do)
    const callbackData = 'data' in (ctx.callbackQuery ?? {}) ? (ctx.callbackQuery as { data?: string }).data : undefined;
    const command = message?.text || callbackData;
    
    logger.error('Unhandled error in middleware', err, {
      updateType: ctx.updateType,
      userId,
      username,
      command,
      duration: `${duration}ms`,
      chatId: ctx.chat?.id,
      chatType: ctx.chat?.type,
    });

    try {
      await ctx.reply(
        '❌ An unexpected error occurred. Please try again later or contact support if the issue persists.'
      );
    } catch (replyError) {
      logger.error('Failed to send error message to user', replyError as Error, {
        userId,
        originalError: err.message,
      });
    }
  }
};
