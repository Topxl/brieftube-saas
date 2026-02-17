<p align="center">
  <img src="public/logo.svg" width="80" alt="BriefTube Logo" />
</p>

<h1 align="center">BriefTube</h1>

<p align="center">
  YouTube videos, summarized as audio, delivered to your Telegram.
</p>

<p align="center">
  <a href="https://github.com/Topxl/BriefTube/stargazers"><img src="https://img.shields.io/github/stars/Topxl/BriefTube?style=social" alt="GitHub Stars" /></a>
  &nbsp;
  <a href="https://github.com/Topxl/BriefTube/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue" alt="License" /></a>
  &nbsp;
  <a href="https://github.com/Topxl/BriefTube/issues"><img src="https://img.shields.io/github/issues/Topxl/BriefTube" alt="Issues" /></a>
  &nbsp;
  <a href="https://github.com/Topxl/BriefTube/graphs/contributors"><img src="https://img.shields.io/github/contributors/Topxl/BriefTube" alt="Contributors" /></a>
</p>

---

BriefTube monitors your favorite YouTube channels, generates AI-powered summaries using Google Gemini, converts them to natural-sounding audio with neural TTS voices, and delivers everything to your Telegram — fully automated.

## Features

- **AI-Powered Summaries** — Google Gemini generates detailed video summaries
- **Natural Audio** — Microsoft Edge neural TTS voices (multi-language)
- **Telegram Delivery** — Audio summaries sent directly to your Telegram
- **RSS Monitoring** — Automatically detects new videos from subscribed channels
- **Multi-Language** — Support for English, French, and more TTS voices
- **Channel Management** — Subscribe to unlimited YouTube channels
- **Shared Processing** — Videos summarized once, delivered to all subscribers
- **Zero API Cost** — Gemini via browser automation, Edge TTS is free
- **Full SaaS Platform** — Complete authentication, billing, and admin dashboard

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS v4, shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Database | Supabase PostgreSQL with Prisma ORM |
| Auth | Better Auth (email/password, magic links, OAuth) |
| Caching | Redis (Upstash) |
| Worker | Python, Playwright, edge-tts, feedparser |
| AI | Google Gemini (browser automation) |
| Telegram | python-telegram-bot |
| Payments | Stripe subscriptions |
| Deployment | Vercel (web) + Docker (worker) |
| Testing | Vitest (unit) + Playwright (e2e) |

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or Supabase)
- Redis instance (local or Upstash)
- Python 3.10+ (for worker)

### Web App Setup

```bash
# Clone repository
git clone https://github.com/Topxl/BriefTube.git
cd BriefTube

# Install dependencies
pnpm install

# Configure environment
cp .env-template .env
# Edit .env with your credentials (see Environment Variables section)

# Setup database
pnpm prisma:migrate
pnpm prisma:seed

# Start development server
pnpm dev
```

Visit http://localhost:3000

### Worker Setup (Python)

The worker handles RSS scanning, AI summarization, TTS, and Telegram delivery.

```bash
cd worker

# Configure
cp .env.example .env
# Edit .env with your Supabase and Telegram credentials

# Using Docker (recommended)
docker compose up -d

# Or manually
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium

# Authenticate with Gemini (one-time)
python scripts/save_cookies.py

# Start worker
python main.py
```

## Environment Variables

### Web App (.env)

```bash
# Database
DATABASE_URL="postgresql://..."

# Redis (required for caching)
REDIS_URL="redis://localhost:6379"  # or Upstash URL

# Better Auth
BETTER_AUTH_SECRET="..."  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Email (Resend)
RESEND_API_KEY="..."
EMAIL_FROM="noreply@yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Worker (.env)

```bash
# Supabase
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Telegram Bot
TELEGRAM_BOT_TOKEN="123456:ABC..."

# Google Gemini API (optional - for API mode instead of browser)
GEMINI_API_KEY="AIzaSy..."

# Groq API (for Whisper transcription fallback)
GROQ_API_KEY="gsk_..."

# TTS Voice (default: fr-FR-DeniseNeural)
TTS_VOICE="fr-FR-DeniseNeural"

# RSS check interval in seconds (default: 300)
RSS_CHECK_INTERVAL=300
```

## Project Structure

```
BriefTube/
├── app/                          # Next.js App Router
│   ├── (logged-in)/              # Protected routes
│   │   └── dashboard/            # User dashboard
│   ├── api/                      # API routes
│   │   └── brieftube/            # BriefTube-specific APIs
│   ├── auth/                     # Authentication pages
│   └── page.tsx                  # Landing page
├── src/
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   └── nowts/                # Custom components
│   ├── features/                 # Feature modules
│   │   ├── youtube-summary/      # YouTube summary feature
│   │   ├── dialog-manager/       # Global dialog system
│   │   └── form/                 # Form components (TanStack Form)
│   ├── lib/                      # Utilities
│   │   ├── auth/                 # Better Auth config
│   │   ├── supabase/             # Supabase client
│   │   ├── actions/              # Server actions
│   │   └── mail/                 # Email utilities
│   └── types/                    # TypeScript types
├── worker/                       # Python worker
│   ├── main.py                   # Orchestrator (4 concurrent tasks)
│   ├── rss_scanner.py            # YouTube RSS monitoring
│   ├── gemini_browser.py         # Gemini AI via Playwright
│   ├── tts_processor.py          # Text-to-speech (edge-tts)
│   ├── telegram_deliverer.py     # Audio delivery
│   ├── bot_handler.py            # Telegram bot commands
│   ├── db.py                     # Supabase client
│   ├── Dockerfile                # Container setup
│   └── docker-compose.yml        # Docker deployment
├── prisma/
│   ├── schema/                   # Prisma schema files
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
├── emails/                       # React Email templates
├── __tests__/                    # Vitest unit tests
├── e2e/                          # Playwright e2e tests
└── public/                       # Static assets
```

## How It Works

```
YouTube RSS Feed → New video detected
                        ↓
              Gemini AI summarization
              (browser automation)
                        ↓
              Edge TTS (text → audio)
                        ↓
              Telegram bot delivers audio
              + thumbnail + video link
```

## Development Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma:migrate   # Run migrations
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:seed      # Seed database

# Testing
pnpm test:ci          # Run unit tests (CI mode)
pnpm test:e2e:ci      # Run e2e tests (headless)

# Code Quality
pnpm ts               # TypeScript check
pnpm lint             # ESLint with auto-fix
pnpm clean            # Run lint + typecheck + format

# Stripe Webhooks (development)
pnpm stripe-webhooks  # Forward Stripe events to localhost
```

## Deployment

### Web App (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Worker (Docker)

```bash
cd worker
docker compose up -d
```

Or use any Python hosting service (Railway, Fly.io, etc.)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

BriefTube is open source under the [AGPL-3.0 license](LICENSE).

---

Built with ❤️ by the BriefTube team
