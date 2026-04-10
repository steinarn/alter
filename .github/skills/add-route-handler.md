# Skill: Add Route Handler

When asked to add a new API endpoint:

1. Create a route file at `apps/web/src/app/api/<path>/route.ts`.
2. Export named functions for HTTP methods: `GET`, `POST`, `PATCH`, `DELETE`.
3. Parse and validate the request body with Zod (import schema from `@/lib/schemas/`).
4. Return `NextResponse.json()` with appropriate status codes.
5. Handle errors: return 400 for validation failures, 404 for not found, 500 for unexpected errors.
6. Use `@alter/db` for database operations.
7. Use `@alter/domain` for business logic — never put domain rules in route handlers.
