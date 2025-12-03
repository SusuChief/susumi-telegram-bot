/**
 * Callback Query Handlers
 * Handle inline button interactions
 */

import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import { createLaunchpadButton, TIER_INFO } from '../utils/messages';

export const handleTiersCallback = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;

  await ctx.answerCbQuery();

  try {
    let message = '🎯 **Pioneer Validator NFT Tiers**\n\n';

    Object.values(TIER_INFO).forEach((tier) => {
      message += `**${tier.name}**\n`;
      message += `💰 Price: ${tier.price}\n`;
      message += `🎁 Entitlement: ${tier.entitlement}\n`;
      message += `📦 Max Supply: ${tier.maxSupply}\n`;
      message += `📝 ${tier.description}\n\n`;
    });

    message += 'Use /mint to purchase NFTs or click the button below to open the launchpad.';

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...createLaunchpadButton(),
    });

    logger.userAction('callback:tiers', userId, username);
  } catch (error) {
    logger.error('Error in tiers callback', error as Error, { userId });
    throw error;
  }
};

export const handlePriceCallback = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;

  await ctx.answerCbQuery();

  try {
    let message = '💰 **Current NFT Prices**\n\n';

    Object.values(TIER_INFO).forEach((tier) => {
      message += `**${tier.name}**: ${tier.price}\n`;
      message += `   Entitlement: ${tier.entitlement}\n\n`;
    });

    message += '💡 Prices are dynamic and may change based on supply milestones.';
    message += '\n\nClick below to view real-time pricing in the launchpad.';

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...createLaunchpadButton(),
    });

    logger.userAction('callback:price', userId, username);
  } catch (error) {
    logger.error('Error in price callback', error as Error, { userId });
    throw error;
  }
};

export const handleSupplyCallback = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;

  await ctx.answerCbQuery();

  try {
    let message = '📈 **NFT Supply Information**\n\n';

    Object.values(TIER_INFO).forEach((tier) => {
      message += `**${tier.name}**\n`;
      message += `📦 Max Supply: ${tier.maxSupply}\n`;
      message += `🆔 Token ID: ${tier.tokenId}\n\n`;
    });

    message += '💡 Real-time supply data is available in the launchpad.';

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...createLaunchpadButton(),
    });

    logger.userAction('callback:supply', userId, username);
  } catch (error) {
    logger.error('Error in supply callback', error as Error, { userId });
    throw error;
  }
};

export const handlePhaseCallback = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;

  await ctx.answerCbQuery();

  try {
    const message = `🎯 **Current Phase Information**

The launchpad uses a dynamic 4-phase pricing system:

**Phase 1 - Early Bird**
- Lowest prices
- Highest SUSU+ entitlements

**Phase 2 - Standard**
- Moderate pricing
- Good value

**Phase 3 - Advanced**
- Higher pricing
- Still competitive

**Phase 4 - Final Rush**
- Final pricing tier
- Last chance pricing

💡 Current phase depends on supply milestones for each tier.
📊 Check the launchpad for real-time phase information.`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...createLaunchpadButton(),
    });

    logger.userAction('callback:phase', userId, username);
  } catch (error) {
    logger.error('Error in phase callback', error as Error, { userId });
    throw error;
  }
};
