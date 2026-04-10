---
name: nextjs-app-router
description: Next.js 16 App Router patterns for Alter
version: "1.0"
tags: [nextjs, react, app-router, route-handlers]
---

# Next.js App Router

## Route Handlers
- Place API routes in `apps/web/src/app/api/**/route.ts`.
- Export named HTTP method functions: `GET`, `POST`, `PATCH`, `DELETE`.
- Return `NextResponse.json()` with explicit status codes.
- Validate request bodies with Zod schemas from `@/lib/schemas/`.

## Server vs Client Components
- **Default to Server Components.** Only add `"use client"` when you need state, effects, event handlers, or browser APIs.
- Use `"use client"` components for: the autonomy dial, onboarding chat, interactive dashboard widgets.
- Keep data fetching in Server Components; pass data down as props.

## Feature-First Organization
```
src/app/
  (marketing)/       — landing page
  onboarding/        — AI conversation + persona
  dashboard/         — main life feed
  settings/          — autonomy dial + profile
  api/               — route handlers
src/components/
  ui/                — shadcn/ui primitives
  onboarding/        — onboarding-specific components
  dashboard/         — dashboard widgets
  autonomy/          — autonomy dial components
```

## Imports
- Use `@/` alias for all imports within `apps/web`.
- Import shared packages as `@alter/db`, `@alter/domain`, `@alter/ai`.
