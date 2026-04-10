# Alter

Your digital doppelganger — a living model of you that gets smarter over time.

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- Docker & Docker Compose
- [Ollama](https://ollama.com) installed on host

## Setup

```bash
# 1. Clone and install
pnpm install

# 2. Pull the AI model
ollama pull gemma4:e4b

# 3. Start infrastructure
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 4. Copy environment
cp .env.example .env

# 5. Run database migration
pnpm db:migrate

# 6. Seed demo data
pnpm db:seed

# 7. Start dev servers
pnpm dev
```

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
- **AI:** Vercel AI SDK + Ollama (Gemma 4 E4B) — fully local
- **Database:** PostgreSQL 16 (Prisma ORM)
- **Queue:** Redis 7 + BullMQ
- **State:** Zustand
- **Testing:** Vitest

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
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Prisma Studio |
