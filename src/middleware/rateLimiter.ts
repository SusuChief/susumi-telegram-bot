/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per user
 */

import { Context, MiddlewareFn } from 'telegraf';
import { config } from '../config';
import { logger } from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<number, RateLimitEntry>();

function getRateLimitKey(ctx: Context): number | null {
  return ctx.from?.id || null;
}

function isRateLimited(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + config.security.rateLimitWindow,
    });
    return false;
  }

  if (entry.count >= config.security.rateLimitMax) {
    return true;
  }

  entry.count++;
  return false;
}

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [userId, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(userId);
    }
  }
}

setInterval(cleanupExpiredEntries, 60000);

export const rateLimiter: MiddlewareFn<Context> = async (ctx, next) => {
  const userId = getRateLimitKey(ctx);
  const username = ctx.from?.username;
  
  if (!userId) {
    return next();
  }

  if (isRateLimited(userId)) {
    logger.warn('Rate limit exceeded', { 
      userId, 
      username,
      command: ctx.message && 'text' in ctx.message ? ctx.message.text : undefined,
      chatType: ctx.chat?.type,
    });
    await ctx.reply('⏳ Too many requests. Please wait a moment and try again.');
    return;
  }

  return next();
};
