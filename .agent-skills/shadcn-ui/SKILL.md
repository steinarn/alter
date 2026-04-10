---
name: shadcn-ui
description: shadcn/ui component patterns with Tailwind CSS v4
version: "1.0"
tags: [shadcn, tailwind, components, ui, radix]
---

# shadcn/ui

## Setup
- Config: `apps/web/components.json`
- Components live in `apps/web/src/components/ui/`.
- Import as `@/components/ui/<component>`.

## Adding Components
```bash
cd apps/web
npx shadcn@latest add <component>
```

## Tailwind CSS v4 Theme
- Theme tokens defined in `apps/web/src/app/globals.css` using `@theme {}`.
- NO `tailwind.config.ts` — Tailwind v4 is CSS-first.
- Use theme tokens (e.g. `bg-primary`, `text-muted-foreground`) — avoid arbitrary values.

## Customization
- shadcn components are source code you own — edit freely.
- Use `cn()` from `@/lib/utils` for conditional class merging.
- Compose complex components from shadcn primitives.

## Key Components for Alter
- **Card** — suggestion cards, conflict alerts, persona card
- **Button** — accept/decline/confirm actions
- **Slider** — autonomy dial
- **Dialog** — autonomous mode rule confirmation
- **Avatar** — onboarding chat bubbles
- **Badge** — energy level indicators, suggestion mode tags
- **Progress** — onboarding conversation progress
