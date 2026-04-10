# Skill: Implement Domain Rule

When asked to implement a business rule:

1. Add the function in `packages/domain/src/`.
2. Keep the function **pure** — no database calls, no framework imports, no side effects.
3. Accept plain objects as input; return plain objects.
4. Use Zod for input validation if the function accepts external data.
5. Write a test file next to the source: `<function-name>.test.ts`.
6. Test edge cases: empty inputs, boundary values, invalid states.
7. Export from `packages/domain/src/index.ts`.
