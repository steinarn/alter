---
name: domain-logic
description: Pure business logic patterns for @alter/domain
version: "1.0"
tags: [domain, business-logic, pure-functions, testing]
---

# Domain Logic

## Location
- `packages/domain/src/`

## Rules
- **Zero framework imports.** No React, no Next.js, no Prisma, no AI SDK.
- Functions accept plain objects and return plain objects.
- All side effects happen outside domain functions (in route handlers or workers).
- Use Zod for input validation only at system boundaries.

## Key Functions (Phase 5)
- `computeEnergyForecast()` — event duration × driver impact → energy score per day
- `computeBalanceScores()` — rolling 7-day WORK/REST/SOCIAL/GROWTH scores
- `detectConflicts()` — flag ≥3 consecutive drainers or drainers without recovery
- `filterSuggestionsByAutonomy()` — shape suggestions based on autonomy level

## Test-First Approach
- Write tests before implementation: `<function-name>.test.ts` next to source.
- Test edge cases: empty arrays, single items, boundary values.
- Use `vitest` and `describe`/`it`/`expect` patterns.
- Run with `pnpm --filter @alter/domain test`.
