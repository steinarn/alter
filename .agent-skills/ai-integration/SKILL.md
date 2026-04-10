---
name: ai-integration
description: AI integration patterns using Vercel AI SDK + Ollama
version: "1.0"
tags: [ai, ollama, vercel-ai-sdk, structured-output, streaming]
---

# AI Integration

## Provider
- `packages/ai/src/provider.ts` configures the Ollama connection via `@ai-sdk/openai-compatible`.
- Model: `gemma4:e4b` (local Ollama).
- Import `model` from `@alter/ai` — never construct provider instances elsewhere.

## Structured Output
```typescript
import { generateObject } from "ai";
import { model } from "./provider";
import { suggestionResponseSchema } from "./schemas/suggestion-response-schema";

const result = await generateObject({
  model,
  schema: suggestionResponseSchema,
  prompt: buildSuggestionPrompt(context),
});
```

## Streaming Chat
```typescript
import { streamText } from "ai";
import { model } from "./provider";

const result = streamText({
  model,
  system: buildOnboardingPrompt(),
  messages: conversationHistory,
});
```

## Prompt Construction
- One file per prompt: `packages/ai/src/build-<feature>-prompt.ts`.
- Prompts are pure functions that accept context and return a string.
- Include the user's persona, energy drivers, goals, and calendar context as appropriate.
- Use `.describe()` on Zod schema fields to guide the AI model.

## Error Handling
- Wrap AI calls in try/catch.
- On failure, return empty/default results — never expose raw AI errors to users.
- Log the error for debugging.
