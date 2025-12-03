/**
 * Security Middleware
 * Input validation and sanitization
 */

import { Context, MiddlewareFn } from 'telegraf';
import { config } from '../config';
import { logger } from '../utils/logger';

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, config.security.maxMessageLength);
}

function validateUserId(userId: number | undefined): boolean {
  if (!userId) return false;
  return Number.isInteger(userId) && userId > 0;
}

export const securityMiddleware: MiddlewareFn<Context> = async (ctx, next) => {
  if (!validateUserId(ctx.from?.id)) {
    logger.warn('Invalid user ID in request', { update: ctx.update });
    return;
  }

  if (ctx.message && 'text' in ctx.message) {
    ctx.message.text = sanitizeInput(ctx.message.text);
  }

  if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
    ctx.callbackQuery.data = sanitizeInput(ctx.callbackQuery.data);
  }

  return next();
};
