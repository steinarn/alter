# Alter

Your digital doppelganger — a living model of you that gets smarter over time. Not an AI assistant you talk to — a version of you that works for you, on your terms.

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- Docker & Docker Compose
- [Ollama](https://ollama.com) installed on host

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/steinarn/alter.git
cd alter
pnpm install

# 2. Pull the AI model
ollama pull gemma4:e4b

# 3. Start infrastructure (Postgres + Redis)
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 4. Copy environment and configure
cp .env.example .env

# 5. Run database migration
pnpm db:migrate

# 6. Generate Prisma client
pnpm db:generate

# 7. Seed demo data
pnpm db:seed

# 8. Start the web app
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000) to see Alter.

### Optional: Start the background worker

```bash
# In a separate terminal
pnpm --filter @alter/worker dev
```

## Demo Flow

1. **Landing page** (`/`) — See what Alter does, click "Get started"
2. **Onboarding** (`/onboarding`) — Have a natural conversation with Alter about your energy, goals, and preferences
3. **Persona card** (`/onboarding/persona`) — Review and confirm your generated persona
4. **Dashboard** (`/dashboard`) — See your energy forecast, life balance scores, conflict alerts, and suggestions
5. **Autonomy dial** — Change the dial on the dashboard or in Settings to see how suggestions adapt in real time
6. **Suggestions** (`/dashboard/suggestions`) — View all suggestions, generate new AI suggestions, accept or decline them

The seeded demo user ("Steinar Nilsen") comes with pre-populated energy drivers, goals, priorities, and a sample week of calendar events.

## Project Structure

```
apps/
  web/          — Next.js 16 frontend + API routes
  worker/       — BullMQ background job processor
packages/
  ai/           — AI prompts, schemas, Ollama provider
  db/           — Prisma schema, client, migrations
  domain/       — Pure business logic, no framework deps
  config-typescript/ — Shared TS configs
  config-eslint/     — Shared ESLint configs
infrastructure/
  docker/       — Docker Compose (Postgres + Redis)
docs/
  plan.md       — Implementation plan
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **AI:** Vercel AI SDK + Ollama (Gemma 4 E4B) — fully local, no API keys
- **Database:** PostgreSQL 16 (Prisma ORM)
- **Queue:** Redis 7 + BullMQ
- **State:** Zustand
- **Testing:** Vitest

## Key Concepts

### Autonomy Levels

| Level | Behaviour |
|-------|-----------|
| Observer | Alter reflects on your patterns — no action buttons |
| Advisor | Alter suggests actions — you accept or decline |
| Co-pilot | Alter prepares draft actions — you confirm or edit |
| Autonomous | Alter acts within your rules — shown as notifications |

Personal and Professional modes have independent autonomy levels.

### Energy Forecast

Predicts your energy for each day based on scheduled events and known energy drivers. Drainer events reduce energy; booster events increase it. Back-to-back drainers compound the effect.

### Life Balance

Tracks four dimensions (Work, Rest, Social, Growth) by classifying calendar events and comparing actual time allocation against your stated priorities.

## MCP Server

The Next.js dev server exposes a Model Context Protocol endpoint at `/_next/mcp` for use with compatible AI tools.

## Scripts

| Command | Description |
|---------|------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type-check all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Prisma Studio |
