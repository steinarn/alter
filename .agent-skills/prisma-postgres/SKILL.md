---
name: prisma-postgres
description: Prisma ORM patterns for Alter's PostgreSQL database
version: "1.0"
tags: [prisma, postgresql, database, migrations]
---

# Prisma + PostgreSQL

## Schema Location
- `packages/db/prisma/schema.prisma`

## Workflow
1. Edit the schema file.
2. `pnpm db:generate` — regenerate the Prisma client.
3. `pnpm db:migrate` — create and apply migration.
4. Update domain types in `packages/domain/src/types.ts` to match.

## Conventions
- Use `@id @default(cuid())` for all primary keys.
- Use `@updatedAt` on `updatedAt` fields.
- Add `@@index` for frequently queried foreign keys.
- Relation names should be explicit: `@relation("UserPersona")`.
- Enum names are PascalCase. Enum values are SCREAMING_SNAKE_CASE.

## Seed Pattern
- Seed script: `packages/db/prisma/seed.ts`
- Uses `tsx` to run TypeScript directly.
- Always use `upsert` to make seeds idempotent.

## Client Singleton
- Import `PrismaClient` from `@alter/db`.
- In Next.js, use a global singleton to avoid connection exhaustion in dev.
