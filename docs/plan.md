# Alter — Implementation Plan

## Overview

Phased implementation plan for a local-first pnpm monorepo **Alter** — your digital doppelganger. An AI-powered life dashboard that models who you are, reflects what's happening, and acts on your behalf at the autonomy level you choose.

**Core concept:** _"It's not an AI assistant you talk to. It's a version of you that works for you — on your terms."_

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 16 (App Router, Turbopack) | Server components by default, Route Handlers for API |
| **Styling** | Tailwind CSS v4 | CSS-first config (`@theme` in CSS, no `tailwind.config.ts`) |
| **Components** | shadcn/ui (Radix primitives) | `npx shadcn@latest init` — copy-paste components in `src/components/ui/` |
| **Icons** | Lucide | Default shadcn icon set |
| **Font** | Geist (Vercel) | `next/font/local` or `geist` package |
| **AI** | Vercel AI SDK + Ollama (Gemma 4 E4B) | `@ai-sdk/openai-compatible` → `localhost:11434/v1`. `useChat` for streaming, `generateObject` for structured output. Fully local, no cloud keys. |
| **Client state** | Zustand | Autonomy dial state, onboarding progress, dashboard filters |
| **ORM** | Prisma | PostgreSQL 16 |
| **Queue** | BullMQ | Redis 7 |
| **Validation** | Zod | Request schemas, AI response validation, shared contracts |
| **Testing** | Vitest | Unit + integration tests, no e2e in MVP |
| **Package manager** | pnpm | Workspace monorepo |
| **Infrastructure** | Docker Compose | PostgreSQL 16 + Redis 7 — local only. Ollama runs on host. |

---

## Phase 0 — Repository Foundation

**Status:** Complete

**Goal:** Scaffolded monorepo that installs, boots infrastructure, has Copilot instructions, development agent skills, custom Copilot agents, and Next.js MCP server integration.

### 0A — Monorepo scaffold

1. Root files: `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `.gitignore`, `.env.example`, `README.md`
2. `packages/config-typescript/` with `base.json` and `nextjs.json`
3. `packages/config-eslint/` with `base.js` and `nextjs.js`
4. `apps/web/` — Next.js **16** with App Router, Turbopack, minimal `src/app/page.tsx`
5. Tailwind CSS v4 setup — `@tailwindcss/postcss` + CSS-first config in `apps/web/src/app/globals.css`
6. shadcn/ui init — `npx shadcn@latest init` in `apps/web/`, generates `components.json` + `src/components/ui/`
7. Geist font — install `geist` package, configure in root layout via `next/font`
8. Zustand — install in `apps/web/`, create `src/stores/` directory
9. `apps/worker/` — BullMQ worker scaffold with `src/index.ts`
10. `packages/db/` — Prisma bootstrap with starter `schema.prisma`
11. `packages/domain/` — barrel export at `src/index.ts`
12. `packages/ai/` — barrel export at `src/index.ts`
13. Vercel AI SDK — install `ai` + `@ai-sdk/openai-compatible` in `packages/ai/`, create `src/provider.ts` (Ollama config)
14. Vitest — configure in root `vitest.config.ts` with workspace support, add test scripts to each package
15. `infrastructure/docker/docker-compose.yml` (PostgreSQL 16 + Redis 7)
16. Ollama prerequisite — document `ollama pull gemma4:e4b` in README, `.env.example` with `OLLAMA_BASE_URL=http://localhost:11434/v1` and `OLLAMA_MODEL=gemma4:e4b`

### 0B — Copilot instructions & GitHub skills

17. `.github/copilot-instructions.md` — repo-wide rules
18. `.github/skills/` — 6 skill files: setup-monorepo, add-prisma-model, add-route-handler, implement-domain-rule, add-bullmq-job, add-ai-feature

### 0C — Agent Skills (agentskills.io format)

Development-focused skills following the open Agent Skills standard.

19. `.agent-skills/nextjs-app-router/SKILL.md` — Route Handlers, server/client boundaries, feature-first organization
20. `.agent-skills/prisma-postgres/SKILL.md` — schema editing, migration workflow, seed patterns
21. `.agent-skills/domain-logic/SKILL.md` — pure functions, Zod validation, test-first approach
22. `.agent-skills/zod-validation/SKILL.md` — request schemas, AI response validation, shared contracts
23. `.agent-skills/bullmq-worker/SKILL.md` — typed payloads, queue naming, processor conventions
24. `.agent-skills/ai-integration/SKILL.md` — prompt construction, structured output, normalization
25. `.agent-skills/shadcn-ui/SKILL.md` — component installation, customization patterns, Tailwind v4 theme tokens

### 0D — Custom Copilot agents

VS Code Copilot custom agents as chat participants, one per domain.

26. `.github/agents/repo-setup.md` — owns monorepo structure, configs, Docker
27. `.github/agents/contracts.md` — owns Prisma models, domain types, Zod schemas
28. `.github/agents/backend.md` — owns packages/domain, packages/db, route handlers
29. `.github/agents/frontend.md` — owns pages, components, onboarding UI, dashboard
30. `.github/agents/infra-worker.md` — owns Redis, BullMQ, worker app, queue definitions
31. `.github/agents/ai-integration.md` — owns packages/ai, prompts, persona generation, suggestion engine
32. `.github/agents/ux-product.md` — owns screen flows, labels, microcopy, autonomy dial UX

### 0E — Next.js MCP Server

33. `.mcp.json` at project root with `next-devtools-mcp` configuration
34. `apps/web` uses Next.js 16+ (exposes `/_next/mcp` endpoint in dev server)
35. MCP server usage documented in README

### 0F — Documentation

36. `docs/plan.md` (this file)

**Verification:**

- [ ] `pnpm install` succeeds
- [ ] `pnpm --filter web build` passes
- [ ] All packages pass typecheck
- [ ] 7 `.agent-skills/*/SKILL.md` files exist with valid frontmatter
- [ ] 7 `.github/agents/*.md` files exist
- [ ] `.mcp.json` exists at root
- [ ] `npx shadcn@latest add button` works (validates shadcn setup)
- [ ] Tailwind classes render correctly in dev server
- [ ] `pnpm test` runs Vitest (even if 0 tests)
- [ ] `ollama run gemma4:e4b "hello"` works locally
- [ ] AI SDK connects to Ollama and gets a response

---

## Phase 1 — Contracts

**Status:** Complete

**Goal:** Shared types, Zod schemas, and AI response shapes defined before feature work.

### Data Models (Prisma)

**Enums:**

- `AutonomyLevel` — `OBSERVER`, `ADVISOR`, `COPILOT`, `AUTONOMOUS`
- `DriverType` — `ENERGIZER`, `DRAINER`
- `GoalCategory` — `PROFESSIONAL`, `PERSONAL`
- `SuggestionMode` — `PERSONAL`, `PROFESSIONAL`
- `SuggestionStatus` — `PENDING`, `ACCEPTED`, `DECLINED`, `ACTED`
- `BalanceDimension` — `WORK`, `REST`, `SOCIAL`, `GROWTH`
- `ConversationRole` — `USER`, `ASSISTANT`

**Models:**

- `User` — id, name, email, createdAt, updatedAt
- `PersonaCard` — id, userId, summary, communicationStyle, boundaryNotes, confirmedAt, createdAt
- `EnergyDriver` — id, userId, label, description, driverType, createdAt
- `Goal` — id, userId, title, description, category, createdAt
- `Priority` — id, userId, dimension, importance (1–10), notes, createdAt
- `AutonomySetting` — id, userId, level, personalMode, professionalMode, updatedAt
- `CalendarEvent` — id, userId, title, startTime, endTime, isDrainer, isBoosted, source, createdAt
- `EnergyForecast` — id, userId, date, predictedLevel (1–10), reason, createdAt
- `BalanceScore` — id, userId, dimension, score (0–100), computedAt
- `Suggestion` — id, userId, mode, title, description, reason, status, autonomyLevelRequired, createdAt
- `SuggestionAction` — id, suggestionId, actionType, payload (JSON), executedAt
- `OnboardingConversation` — id, userId, role, content, stepIndex, createdAt

### Steps

1. Write full Prisma schema in `packages/db/prisma/schema.prisma` — 12 models + 7 enums
2. Define domain entity types in `packages/domain/src/types.ts`
3. Define Zod request schemas per API endpoint group in `apps/web/src/lib/schemas/`
4. Define AI response schemas in `packages/ai/src/schemas/`:
   - `persona-response-schema.ts` — onboarding persona extraction
   - `suggestion-response-schema.ts` — weekly suggestion generation
   - `energy-forecast-response-schema.ts` — energy prediction
5. Define queue payload types in `apps/worker/src/types.ts`

**Verification:**

- [ ] `pnpm typecheck` passes
- [ ] All enums and types match data model spec above

---

## Phase 2 — Database & Seed

**Status:** Complete

**Goal:** Prisma migration applied, demo seed running.

**Steps:**

1. Finalize Prisma schema (from Phase 1)
2. Run first migration: `pnpm db:migrate`
3. Generate Prisma client: `pnpm db:generate`
4. Create seed script with demo user data:
   - User: Steinar Nilsen
   - Energy drivers: "Deep focus coding" (energizer), "Back-to-back meetings" (drainer), "Morning run" (energizer), "Admin tasks" (drainer)
   - Goals: "Learn Rust" (professional), "Run a half marathon" (personal)
   - Priorities: WORK=8, REST=6, SOCIAL=5, GROWTH=7
   - Autonomy setting: ADVISOR level
   - Calendar events: sample week with meetings, focus blocks, social events
   - Persona card: pre-generated summary
5. Run seed: `pnpm db:seed`

**Verification:**

- [x] Migration succeeds against Docker Postgres
- [x] Seed inserts user, persona card, energy drivers, goals, priorities, autonomy setting, calendar events
- [ ] Prisma Studio shows correct data

---

## Phase 3 — Web App Shell

**Status:** Complete

**Goal:** Basic Next.js app with routing, layout, and health endpoint.

**Steps:**

1. Add health endpoint: `GET /api/health`
2. Add page shells:
   - `/` — landing / start onboarding
   - `/onboarding` — AI conversation flow
   - `/onboarding/persona` — persona card confirmation
   - `/dashboard` — main life feed dashboard
   - `/dashboard/suggestions` — suggestion detail view
   - `/settings` — autonomy dial + profile editing
3. App layout with sidebar navigation (Dashboard, Suggestions, Settings)
4. Responsive shell — mobile-first

**Verification:**

- [x] `pnpm --filter web dev` starts
- [x] `/api/health` returns 200
- [x] All pages render (even if empty shells)

---

## Phase 4 — AI Onboarding Conversation

**Status:** Complete

**Goal:** Conversational onboarding that draws out the user's profile and generates a persona card.

**Steps:**

1. `buildOnboardingPrompt()` in `packages/ai/src/build-onboarding-prompt.ts`
   - System prompt positions AI as empathetic interviewer
   - Structured conversation flow: energy → goals → priorities → communication style → autonomy preference
   - Follow-up question generation based on previous answers
2. `parsePersonaResponse()` in `packages/ai/src/parse-persona-response.ts`
   - Extracts structured persona from conversation transcript
   - Validates against `persona-response-schema.ts`
3. `POST /api/onboarding/chat` — streaming chat endpoint
   - Accepts conversation history + new message
   - Returns AI follow-up question or persona generation trigger
4. `POST /api/onboarding/generate-persona` — persona extraction endpoint
   - Takes full conversation transcript
   - Returns structured persona card for confirmation
5. Onboarding chat UI:
   - Chat bubble interface (user + AI messages)
   - Progress indicator showing conversation stage
   - "Generate my persona" button when conversation is sufficient
6. Persona card display + confirm/edit flow

**AI onboarding conversation stages:**

1. Welcome + what energizes you
2. What drains you
3. Professional goals
4. Personal priorities
5. Communication style + boundaries
6. Autonomy preference
7. Reflection + persona card generation

**Verification:**

- [x] AI asks meaningful follow-up questions
- [x] Persona card is generated from conversation
- [x] User can confirm or request revision of persona
- [x] Conversation persisted to `OnboardingConversation` table

---

## Phase 5 — Domain Logic

**Status:** Complete

**Goal:** Pure business rules tested in isolation.

**Steps:**

1. ~~`computeEnergyForecast()` — predict energy levels for upcoming days based on scheduled events + known drivers~~
2. ~~`computeBalanceScores()` — calculate WORK / REST / SOCIAL / GROWTH balance from calendar data + priorities~~
3. ~~`detectConflicts()` — flag schedule conflicts (e.g. back-to-back drainer meetings, no recovery time after draining blocks)~~
4. ~~`generateSuggestionCriteria()` — determine what suggestions to make based on forecast + balance + goals~~
5. ~~`filterSuggestionsByAutonomy()` — filter and shape suggestions based on current autonomy level~~
6. ~~`resolveSuggestionAction()` — determine what action to take for a suggestion at a given autonomy level~~
7. ~~Unit tests for each function (Vitest)~~

**Key rules:**

- **Observer mode:** suggestions are computed but only shown as reflections, no action buttons
- **Advisor mode:** suggestions shown with "Accept" / "Decline" buttons
- **Co-pilot mode:** suggestions shown as drafts already prepared (e.g. "I've drafted a calendar block for focus time — confirm?")
- **Autonomous mode:** suggestions acted on within user-defined rules, shown as "I did this for you" notifications
- Energy forecast uses weighted scoring: event duration × driver impact
- Conflict detection flags ≥3 consecutive drainer events or drainer events without adjacent recovery time
- Balance scores are rolling 7-day calculations
- Domain functions remain pure — no database calls, no framework imports

**Verification:**

- [x] `pnpm --filter @alter/domain test` passes — 43 tests, 6 files
- [x] Energy forecast tests pass with known event/driver inputs
- [x] Conflict detection identifies back-to-back drainer scenarios
- [x] Autonomy filtering correctly shapes suggestions per level

---

## Phase 6 — CRUD APIs

**Status:** Complete

**Goal:** All REST endpoints for profile and data management.

**Steps:**

1. ~~`POST /api/users` — create user~~
2. ~~`GET /api/users/:userId` — get user with persona card~~
3. ~~`PATCH /api/users/:userId/persona` — update persona card~~
4. ~~`POST /api/users/:userId/energy-drivers` — add energy driver~~
5. ~~`DELETE /api/users/:userId/energy-drivers/:driverId` — remove energy driver~~
6. ~~`POST /api/users/:userId/goals` — add goal~~
7. ~~`PATCH /api/users/:userId/goals/:goalId` — update goal~~
8. ~~`POST /api/users/:userId/priorities` — set priority scores~~
9. ~~`PATCH /api/users/:userId/autonomy` — update autonomy level~~
10. ~~`POST /api/users/:userId/calendar-events` — add calendar events (mock import)~~
11. ~~`GET /api/users/:userId/dashboard` — aggregated dashboard data (forecast + balance + conflicts + suggestions)~~
12. ~~`PATCH /api/suggestions/:suggestionId` — accept/decline suggestion~~
13. ~~`POST /api/suggestions/:suggestionId/act` — execute suggestion action~~

**Verification:**

- [x] Each endpoint responds correctly via curl/httpie
- [x] Validation errors return proper 4xx responses
- [x] Zod schemas validate all request bodies

---

## Phase 7 — Dashboard & Life Feed

**Status:** Not started

**Goal:** Main dashboard showing energy forecast, balance scores, conflicts, and suggestions.

**Steps:**

1. **Energy Forecast widget** — week view showing predicted energy per day (color-coded bar chart)
2. **Balance Score widget** — radar/spider chart or 4-bar visualization for WORK / REST / SOCIAL / GROWTH
3. **Conflict alerts** — banner cards highlighting flagged conflicts with explanation (e.g. "You have 6 back-to-back meetings Thursday and you've said those drain you")
4. **Suggestion cards** — actionable cards rendered per autonomy mode:
   - Observer: insight cards (read-only reflections)
   - Advisor: cards with Accept / Decline buttons
   - Co-pilot: cards with pre-drafted action + Confirm / Edit buttons
   - Autonomous: "completed" cards with Undo option
5. **Calendar preview** — condensed week-at-a-glance showing events tagged by energy impact
6. Mode toggle (Personal / Professional) that filters suggestions

**Verification:**

- [ ] Dashboard loads with real data from `/api/users/:userId/dashboard`
- [ ] Energy forecast visualizes correctly
- [ ] Balance scores reflect actual data
- [ ] Conflict alerts render with clear explanations
- [ ] Suggestions respect current autonomy level

---

## Phase 8 — Autonomy Dial

**Status:** Not started

**Goal:** The autonomy dial interaction — the key differentiator.

**Steps:**

1. Autonomy dial component — visual slider/toggle with 4 levels:
   - 🔵 Observer — "Alter reflects, no actions"
   - 🟡 Advisor — "Alter suggests, you decide"
   - 🟠 Co-pilot — "Alter prepares, you confirm"
   - 🔴 Autonomous — "Alter acts within your rules"
2. Separate dials for Personal mode and Professional mode
3. Real-time preview: changing the dial immediately updates how suggestions are rendered on dashboard
4. Rule configuration for Autonomous mode:
   - "Can schedule recovery time after draining meetings"
   - "Can decline meetings during focus blocks"
   - "Can suggest social plans on weekends"
5. Confirmation UX when escalating to Autonomous level
6. Animation/transition when dial changes level
7. Persist autonomy level via `PATCH /api/users/:userId/autonomy`

**Verification:**

- [ ] Dial smoothly transitions between 4 levels
- [ ] Changing dial updates suggestion rendering in real time
- [ ] Personal and Professional modes have independent autonomy levels
- [ ] Autonomous mode requires rule confirmation
- [ ] Autonomy setting persists across page reloads

---

## Phase 9 — AI Suggestion Engine

**Status:** Not started

**Goal:** AI-powered suggestion generation and energy forecasting.

**Steps:**

1. `buildSuggestionPrompt()` in `packages/ai/src/build-suggestion-prompt.ts`
   - Includes persona card, energy drivers, goals, priorities, upcoming calendar
   - Differentiates personal vs. professional mode
2. `buildEnergyForecastPrompt()` in `packages/ai/src/build-energy-forecast-prompt.ts`
   - Weekly calendar + energy driver profiles → forecasted energy levels
3. `parseSuggestionResponse()` in `packages/ai/src/parse-suggestion-response.ts`
4. `generateSuggestions()` in `packages/ai/src/generate-suggestions.ts`
5. `generateEnergyForecast()` in `packages/ai/src/generate-energy-forecast.ts`
6. `POST /api/users/:userId/generate-suggestions` — trigger suggestion generation
7. `POST /api/users/:userId/generate-forecast` — trigger energy forecast

**AI output shapes:**

Suggestion response:
```json
{
  "suggestions": [
    {
      "title": "Block 2h focus time Wednesday morning",
      "description": "Your calendar is empty 9-11am and you've said deep focus coding energizes you.",
      "reason": "Supports your 'Learn Rust' goal and boosts energy before afternoon meetings.",
      "mode": "PROFESSIONAL",
      "autonomyLevelRequired": "ADVISOR",
      "actionType": "SCHEDULE_EVENT",
      "actionPayload": { "title": "Focus: Rust learning", "start": "2026-04-15T09:00", "end": "2026-04-15T11:00" }
    }
  ]
}
```

Energy forecast response:
```json
{
  "forecast": [
    { "date": "2026-04-13", "predictedLevel": 7, "reason": "Light meeting day + morning run scheduled" },
    { "date": "2026-04-14", "predictedLevel": 4, "reason": "6 meetings including 3 back-to-back in afternoon" }
  ]
}
```

**Verification:**

- [ ] AI suggestions are validated with Zod
- [ ] Invalid AI output is rejected gracefully
- [ ] Suggestions pass domain validation before persistence
- [ ] Energy forecast produces reasonable levels

---

## Phase 10 — Worker & Background Jobs

**Status:** Not started

**Goal:** Background job processing for AI generation and scheduled recalculations.

**Steps:**

1. BullMQ setup in `apps/worker`
2. `persona.generate` job — extract persona from onboarding conversation
3. `suggestions.generate` job — generate weekly suggestions for a user
4. `forecast.generate` job — generate energy forecast for a user
5. `balance.recalculate` job — recalculate balance scores after calendar changes
6. `suggestion.execute` job — execute autonomous suggestion actions
7. Worker boots and processes jobs

**Job flow (suggestions.generate):**

1. Load user aggregate from `@alter/db` (persona, drivers, goals, priorities, calendar)
2. Build suggestion criteria via `@alter/domain`
3. Call AI via `@alter/ai`
4. Validate AI results via `@alter/domain`
5. Filter by autonomy level via `@alter/domain`
6. Persist suggestions via `@alter/db`
7. Execute autonomous suggestions if applicable

**Verification:**

- [ ] `pnpm --filter worker dev` starts
- [ ] Enqueued job gets processed
- [ ] Results persisted in DB
- [ ] Autonomous suggestions trigger action execution

---

## Phase 11 — Polish & Demo Flow

**Status:** Not started

**Goal:** Production-quality MVP UX and end-to-end demo flow.

**Steps:**

1. Empty states for all pages
2. Loading states (skeleton screens)
3. Error states with retry
4. Onboarding → Dashboard transition animation
5. Demo-ready flow:
   - New user lands on `/` → starts onboarding conversation
   - Alter generates their persona card → user confirms
   - Dashboard loads with week view, energy forecast, and 2–3 suggestions
   - Demo the autonomy dial changing how a suggestion is presented
6. Clear suggestion reasons ("why did Alter suggest this?")
7. README with startup instructions
8. Test coverage improvements

**Verification:**

- [ ] All pages handle empty/loading/error gracefully
- [ ] End-to-end demo flow works without hiccups
- [ ] README startup instructions work from clone to running app

---

## Decisions

- **No auth** in MVP — single-user demo mode
- **English only** in all code and content
- **Docker-first** for Postgres and Redis — no hosted DB dependency
- **Package scoping:** `@alter/*` namespace for all packages
- **Next.js 16+** required for MCP server support
- **Agent Skills format** (agentskills.io) — open standard, portable across agents
- **Custom Copilot agents** in `.github/agents/` — one per domain
- **Fully local AI** — Ollama + Gemma 4 E4B, zero cloud dependency, no API keys required
- **Vercel AI SDK + OpenAI-compatible provider** — keeps `useChat`/`generateObject` hooks while targeting local Ollama
- **Tailwind CSS v4** — CSS-first configuration (no JS config file); use `@theme` directive in CSS
- **shadcn/ui** — components are copied into `src/components/ui/`, not imported from node_modules
- **Zustand** for client-side state that doesn't belong in URL or server (autonomy dial, onboarding chat, UI filters)
- **Mock calendar data** — no real calendar integration in MVP; events are manually created or seeded
- **Autonomy dial is UX-first** — the interaction must feel smooth and immediate; backend catches up async
- **Cut order if tight on time:** autonomous execution → background jobs → energy forecast → balance scores → calendar preview (keep onboarding + dashboard + autonomy dial as must-haves)

## Scope

**In scope:** Onboarding conversation, persona card generation, energy drivers, goals, priorities, dashboard with energy forecast + balance scores + conflict alerts, suggestion generation (personal + professional), autonomy dial (4 levels), suggestion accept/decline/act, mock calendar data.

**Out of scope:** Real calendar integrations (Google/Outlook), authentication, multi-user, mobile app, push notifications, real email/calendar actions (meeting decline, event creation), app usage tracking, historical trend analysis, sharing/collaboration.

## Implementation order

| Phase | Name | Depends on | Agent |
|-------|------|------------|-------|
| 0 | Repository Foundation | — | `@repo-setup` |
| 1 | Contracts | Phase 0 | `@contracts` |
| 2 | Database & Seed | Phase 1 | `@backend` |
| 3 | Web App Shell | Phase 0 | `@frontend` |
| 4 | AI Onboarding Conversation | Phase 1, 3 | `@ai-integration` + `@frontend` |
| 5 | Domain Logic | Phase 1 | `@backend` |
| 6 | CRUD APIs | Phase 2, 5 | `@backend` |
| 7 | Dashboard & Life Feed | Phase 6 | `@frontend` |
| 8 | Autonomy Dial | Phase 6, 7 | `@frontend` + `@ux-product` |
| 9 | AI Suggestion Engine | Phase 1, 5 | `@ai-integration` |
| 10 | Worker & Background Jobs | Phase 6, 9 | `@infra-worker` |
| 11 | Polish & Demo Flow | Phase 7, 8 | `@frontend` + `@ux-product` |
