# Skill: Add AI Feature

When asked to add an AI-powered feature:

1. Write the prompt builder in `packages/ai/src/build-<feature>-prompt.ts`.
2. Define the Zod response schema in `packages/ai/src/schemas/<feature>-response-schema.ts`.
3. Write the response parser in `packages/ai/src/parse-<feature>-response.ts`.
4. Create the generation function in `packages/ai/src/generate-<feature>.ts`:
   - Import `model` from `./provider`.
   - Use `generateObject()` with the Zod schema for structured output.
   - Or use `streamText()` for streaming responses (e.g. chat).
5. Handle invalid AI output gracefully — return empty/default results, never throw to the user.
6. Export from `packages/ai/src/index.ts`.
7. All AI calls go through `@alter/ai` — never call Ollama directly from `apps/web` or `apps/worker`.
