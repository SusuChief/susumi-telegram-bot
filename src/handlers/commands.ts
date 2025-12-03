/**
 * Command Handlers
 * Modular command implementations
 */

import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import { createLaunchpadButton, TIER_INFO } from '../utils/messages';

export const handleStart = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
  try {
    const welcomeMessage = `🔥 Welcome to the Susumi Pioneer Validator Pre-Sale!

Mint your Commander, Counsellor, or Chancellor Pioneer NFTs directly here in Telegram.

These NFTs offer exclusive Pioneer Bonus Token Entitlements, Revenue Share and Governance Rights on Susumi.

Use the commands below to explore:

/tiers /price /supply /phase /mint

You are now part of the next evolution of Susumi!`;

    await ctx.reply(welcomeMessage, createLaunchpadButton());
    
    logger.command('start', userId, username, true, {
      chatType: ctx.chat?.type,
    });
  } catch (error) {
    logger.command('start', userId, username, false);
    logger.error('Error in /start command', error as Error, { userId });
    throw error;
  }
};

export const handleTiers = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
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
    
    logger.command('tiers', userId, username);
  } catch (error) {
    logger.command('tiers', userId, username, false);
    logger.error('Error in /tiers command', error as Error, { userId });
    throw error;
  }
};

export const handlePrice = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
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
    
    logger.command('price', userId, username);
  } catch (error) {
    logger.command('price', userId, username, false);
    logger.error('Error in /price command', error as Error, { userId });
    throw error;
  }
};

export const handleSupply = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
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
    
    logger.command('supply', userId, username);
  } catch (error) {
    logger.command('supply', userId, username, false);
    logger.error('Error in /supply command', error as Error, { userId });
    throw error;
  }
};

export const handlePhase = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
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
    
    logger.command('phase', userId, username);
  } catch (error) {
    logger.command('phase', userId, username, false);
    logger.error('Error in /phase command', error as Error, { userId });
    throw error;
  }
};

export const handleMint = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
  try {
    const message = `🚀 **Mint Pioneer Validator NFTs**

To mint your NFTs:

1️⃣ Click "Open Launchpad" below
2️⃣ Connect your wallet (MetaMask, Trust Wallet, etc.)
3️⃣ Select your desired tier (Commander, Counsellor, or Chancellor)
4️⃣ Choose quantity and payment method (USDT/USDC)
5️⃣ Complete the transaction

💡 All transactions are on-chain via Polygon network.
🔒 Your funds are secure - the bot never asks for your seed phrase.

Ready to mint? Click the button below!`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...createLaunchpadButton(),
    });
    
    logger.command('mint', userId, username);
  } catch (error) {
    logger.command('mint', userId, username, false);
    logger.error('Error in /mint command', error as Error, { userId });
    throw error;
  }
};

export const handleHelp = async (ctx: Context): Promise<void> => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
  try {
    const message = `📚 **Susumi Pioneer Bot Commands**

**Available Commands:**
/tiers - View all NFT tiers and benefits
/price - Check current pricing
/supply - View supply information
/phase - Learn about pricing phases
/mint - Get instructions to mint NFTs
/help - Show this help message

**About Pioneer NFTs:**
• Utility NFTs with governance rights
• Revenue sharing from platform fees
• SUSU+ token entitlements
• Access to Validator Fund

**Security:**
✅ All purchases are on-chain via Polygon
✅ Bot never asks for seed phrases or private keys
✅ Connect wallet securely via WalletConnect

**Need Support?**
Visit https://susumi.io or use the launchpad for more information.`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...createLaunchpadButton(),
    });
    
    logger.command('help', userId, username);
  } catch (error) {
    logger.command('help', userId, username, false);
    logger.error('Error in /help command', error as Error, { userId });
    throw error;
  }
};
