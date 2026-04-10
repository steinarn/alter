---
name: bullmq-worker
description: BullMQ worker patterns for background job processing
version: "1.0"
tags: [bullmq, redis, worker, queues, jobs]
---

# BullMQ Worker

## Location
- `apps/worker/src/`

## Queue Naming
- Use `<entity>.<action>` format: `persona.generate`, `suggestions.generate`, `forecast.generate`

## Typed Payloads
- Define all job payload types in `apps/worker/src/types.ts`.
- Validate payloads with Zod at processor entry.

## Processor Pattern
```typescript
// apps/worker/src/processors/suggestions-generate.ts
import { Job } from "bullmq";
import type { SuggestionsGeneratePayload } from "../types";

export async function processSuggestionsGenerate(
  job: Job<SuggestionsGeneratePayload>
) {
  // 1. Load data via @alter/db
  // 2. Run domain logic via @alter/domain
  // 3. Call AI via @alter/ai
  // 4. Validate results via @alter/domain
  // 5. Persist via @alter/db
}
```

## Worker Bootstrap
- `apps/worker/src/index.ts` registers all processors.
- Connect to Redis via `REDIS_URL` environment variable.
- Development: `pnpm --filter worker dev` (uses tsx watch).
