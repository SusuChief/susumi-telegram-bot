# Susumi Pioneer Telegram Bot

A production-ready Telegram bot for the Susumi Pioneer Validator NFT Pre-Sale. Provides an intuitive command interface and direct access to the launchpad mini-app.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Bot Commands](#bot-commands)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

| Feature          | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| **Bot Commands** | `/tiers`, `/price`, `/supply`, `/phase`, `/mint`, `/help`    |
| **Mini-App**     | Direct launchpad access via Telegram WebApp button           |
| **Security**     | Webhook secret validation, input sanitization, rate limiting |
| **Logging**      | Winston with structured JSON logs and daily rotation         |
| **Dual Mode**    | Long polling (development) or Webhook server (production)    |

## Quick Start

### Prerequisites

- Node.js 18+
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### Installation

```bash
cd susumi-telegram-bot
npm install
cp .env.example .env  # Then edit .env with your values
```

### Run

```bash
# Development
npm run dev            # Long polling mode
npm run dev:server     # Webhook server mode

# Production
npm run build
npm start              # Long polling mode
npm run start:server   # Webhook server mode
```

## Configuration

### Environment Variables

| Variable            | Required | Default                       | Description                                                  |
| ------------------- | :------: | ----------------------------- | ------------------------------------------------------------ |
| `BOT_TOKEN`         |    ✓     | —                             | Telegram bot token from BotFather                            |
| `BOT_USERNAME`      |          | —                             | Bot username (without @)                                     |
| `LAUNCHPAD_URL`     |          | `https://susumi.io/launchpad` | Mini-app URL (must be HTTPS)                                 |
| `WEBHOOK_DOMAIN`    |   prod   | —                             | Server domain (must be HTTPS)                                |
| `WEBHOOK_PATH`      |   prod   | —                             | Webhook endpoint path                                        |
| `WEBHOOK_SECRET`    |   prod   | —                             | Secret token for webhook validation                          |
| `PORT`              |          | `3000`                        | Server port                                                  |
| `NODE_ENV`          |          | `development`                 | Environment (`development` \| `production`)                  |
| `LOG_LEVEL`         |          | `info`                        | Log level (`debug` \| `http` \| `info` \| `warn` \| `error`) |
| `LOGS_DIR`          |          | `./logs`                      | Directory for log files                                      |
| `RATE_LIMIT_WINDOW` |          | `60000`                       | Rate limit window in milliseconds                            |
| `RATE_LIMIT_MAX`    |          | `10`                          | Max requests per window per user                             |

## Bot Commands

| Command   | Description                                        |
| --------- | -------------------------------------------------- |
| `/start`  | Welcome message with launchpad button              |
| `/tiers`  | View NFT tiers (Commander, Counsellor, Chancellor) |
| `/price`  | Current pricing for all tiers                      |
| `/supply` | Supply information per tier                        |
| `/phase`  | Dynamic pricing phases explained                   |
| `/mint`   | Step-by-step minting instructions                  |
| `/help`   | List available commands                            |

## Architecture

```
Telegram API
     │
     ▼ HTTPS (Webhook / Long Polling)
┌─────────────────────────────────────┐
│           Express Server            │
│            (server.ts)              │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│           Bot Instance              │
│            (index.ts)               │
└──────────────────┬──────────────────┘
                   │
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│Middleware│  │ Commands │  │Callbacks │
├──────────┤  ├──────────┤  ├──────────┤
│ Error    │  │ /start   │  │ Inline   │
│ Security │  │ /tiers   │  │ Buttons  │
│ Rate     │  │ /price   │  │          │
│ Limit    │  │ /mint    │  │          │
└──────────┘  └──────────┘  └──────────┘
```

### Project Structure

```
susumi-telegram-bot/
├── src/
│   ├── index.ts           # Bot entry point (polling mode)
│   ├── server.ts          # Webhook server (production)
│   ├── config/
│   │   └── index.ts       # Configuration management
│   ├── handlers/
│   │   ├── commands.ts    # Command handlers
│   │   └── callbacks.ts   # Callback handlers
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── security.ts
│   └── utils/
│       ├── logger.ts      # Winston logger
│       └── messages.ts    # Message templates
├── package.json
├── tsconfig.json
└── .gitignore
```

## Deployment

### Deploy

```bash
npm install -g pm2              # Install PM2 globally (if not already installed)
npm run build
pm2 start ecosystem.config.js
pm2 save                        # Save process list for restore after reboot (optional)
pm2 startup                     # Auto-start PM2 on system boot (optional)
```

### Health Endpoints

| Endpoint      | Purpose                          |
| ------------- | -------------------------------- |
| `GET /health` | Health check (uptime, timestamp) |
| `GET /ready`  | Readiness probe (Kubernetes)     |

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z","uptime":3600}
```

### Webhook Configuration

The bot automatically configures the webhook on startup when `WEBHOOK_DOMAIN` and `WEBHOOK_PATH` are set.

**Verify webhook:**
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

**Manual setup (if needed):**
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/webhook/path","secret_token":"your_secret"}'
```

## Troubleshooting

### Common Issues

| Issue                         | Solution                                   |
| ----------------------------- | ------------------------------------------ |
| Bot not responding            | Check logs: `pm2 logs susumi-bot`          |
| `BOT_TOKEN is required`       | Ensure `.env` file exists with valid token |
| `LAUNCHPAD_URL must be HTTPS` | Use `https://` protocol for URL            |
| Webhook not receiving         | Verify HTTPS cert, secret, and path        |
| Users rate limited            | Increase `RATE_LIMIT_MAX` value            |
| Mini-app not opening          | Whitelist domain in BotFather settings     |

### Debugging

```bash
# Check bot status
pm2 status

# View logs
pm2 logs susumi-bot --lines 100

# Verify webhook
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"

# Test health endpoint
curl http://localhost:3000/health
```

## Scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Development with hot reload (polling) |
| `npm run dev:server`   | Development with hot reload (webhook) |
| `npm run build`        | Compile TypeScript                    |
| `npm start`            | Production (polling)                  |
| `npm run start:server` | Production (webhook)                  |
| `npm run lint`         | Run ESLint                            |

## Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Telegraf Documentation](https://telegraf.js.org/)
