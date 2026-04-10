# Skill: Add Prisma Model

When asked to add a new database model:

1. Open `packages/db/prisma/schema.prisma`.
2. Add the model with all fields, relations, and indexes.
3. Add any new enums above the model.
4. Run `pnpm db:generate` to regenerate the client.
5. Run `pnpm db:migrate` to create the migration.
6. Update `packages/domain/src/types.ts` with the corresponding TypeScript type (do NOT import from Prisma in domain — keep it pure).
7. If the model needs seed data, update `packages/db/prisma/seed.ts`.
