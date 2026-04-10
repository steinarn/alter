---
name: zod-validation
description: Zod validation patterns for request schemas, AI responses, and shared contracts
version: "1.0"
tags: [zod, validation, schemas, typescript]
---

# Zod Validation

## Request Schemas
- Location: `apps/web/src/lib/schemas/`
- One file per API endpoint group (e.g. `user-schemas.ts`, `suggestion-schemas.ts`).
- Export both the schema and the inferred type: `export type CreateUserInput = z.infer<typeof createUserSchema>`.

## AI Response Schemas
- Location: `packages/ai/src/schemas/`
- Used with `generateObject({ schema })` from Vercel AI SDK.
- Keep schemas strict — no `.passthrough()`. Invalid AI output should fail validation.
- Provide `.describe()` annotations on fields to help the AI model.

## Shared Contracts
- Domain types live in `packages/domain/src/types.ts` as plain TypeScript interfaces.
- Zod schemas should align with domain types but are NOT the source of truth for domain logic.
- Domain functions accept plain objects; Zod validates at the boundary (route handlers, AI parsing).

## Patterns
```typescript
// Schema definition
export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

// Type inference
export type CreateUserInput = z.infer<typeof createUserSchema>;

// Usage in route handler
const body = createUserSchema.parse(await request.json());
```
