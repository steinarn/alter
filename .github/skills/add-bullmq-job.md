# Skill: Add BullMQ Job

When asked to add a background job:

1. Define the payload type in `apps/worker/src/types.ts`.
2. Validate the payload with Zod.
3. Create a processor file: `apps/worker/src/processors/<queue-name>.ts`.
4. Use the naming convention: `<entity>.<action>` (e.g. `suggestions.generate`).
5. Inside the processor:
   - Load data via `@alter/db`
   - Run business logic via `@alter/domain`
   - Call AI via `@alter/ai` if needed
   - Persist results via `@alter/db`
6. Register the processor in `apps/worker/src/index.ts`.
7. Add a queue enqueue helper if the job is triggered from the web app.
