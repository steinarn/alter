# Alter — Copilot Instructions

## Project

Alter is a digital doppelganger — an AI-powered life dashboard that models who you are, reflects what's happening, and acts on your behalf at the autonomy level you choose.

## Architecture

- **Monorepo:** pnpm workspace with Turborepo
- **Frontend:** `apps/web` — Next.js 16 App Router, Tailwind CSS v4, shadcn/ui, Zustand
- **Worker:** `apps/worker` — BullMQ job processor
- **Packages:** `@alter/db` (Prisma), `@alter/domain` (pure logic), `@alter/ai` (Ollama via AI SDK)

## Rules

1. **English only** in all code, comments, commit messages, and content.
2. **TypeScript strict mode** everywhere — no `any`, no `@ts-ignore`.
3. **Server Components by default** — only add `"use client"` when state, effects, or browser APIs are needed.
4. **Zod for all validation** — request bodies, AI responses, queue payloads.
5. **Domain logic is pure** — `@alter/domain` has zero framework imports. No database calls, no React, no Next.js.
6. **Tailwind CSS v4** — use `@theme` in CSS, not `tailwind.config.ts`. No arbitrary values when a theme token exists.
7. **shadcn/ui components** live in `apps/web/src/components/ui/`. Import from `@/components/ui/`.
8. **Zustand** for client state — autonomy dial, onboarding progress, dashboard filters. No Redux. No Context for mutable state.
9. **AI via Ollama** — all AI calls go through `@alter/ai` using Vercel AI SDK with `@ai-sdk/openai-compatible`. Model: `gemma4:e4b`.
10. **No auth** in MVP — single-user demo mode.
11. **Import paths:** use `@/` alias in `apps/web`, package names (`@alter/db`, `@alter/domain`, `@alter/ai`) elsewhere.
12. **Tests with Vitest** — domain logic must have unit tests. Test files next to source: `foo.test.ts`.
13. **Route Handlers** for API endpoints — `app/api/**/route.ts`. Return `NextResponse.json()`.
14. **Package scoping:** all workspace packages use `@alter/*` namespace.
