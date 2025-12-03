/**
 * Message Utilities
 * Centralized message templates and helpers
 */

import { config } from '../config';

export const TIER_INFO = {
  commander: {
    name: 'Commander',
    price: '$250',
    entitlement: '250,000 SUSU+',
    tokenId: 5001,
    maxSupply: 4500,
    description: 'Entry-level Validator with Bronze Badge',
  },
  counsellor: {
    name: 'Counsellor',
    price: '$750',
    entitlement: '750,000 SUSU+',
    tokenId: 10001,
    maxSupply: 400,
    description: 'Mid-tier Validator with Silver Badge',
  },
  chancellor: {
    name: 'Chancellor',
    price: '$2,500',
    entitlement: '2,500,000 SUSU+',
    tokenId: 12001,
    maxSupply: 100,
    description: 'Premium Validator with Gold Badge',
  },
} as const;

export const createLaunchpadButton = () => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Open Launchpad',
            web_app: { url: config.launchpad.url },
          },
        ],
      ],
    },
  };
};
