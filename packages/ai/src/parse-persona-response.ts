import { generateObject } from "ai";
import { model } from "./provider";
import { personaResponseSchema, type PersonaResponse } from "./schemas";

export async function parsePersonaResponse(
  conversationHistory: Array<{ role: "USER" | "ASSISTANT"; content: string }>
): Promise<PersonaResponse> {
  const transcript = conversationHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");

  const { object } = await generateObject({
    model,
    schema: personaResponseSchema,
    prompt: `You are Alter — an AI that builds persona cards from onboarding conversations.

Analyse the following conversation transcript between an AI interviewer and a new user. Extract a complete persona card.

## Rules
- Only include information the user actually stated. Never fabricate.
- For energy drivers, include at least 2 energisers and 2 drainers if mentioned.
- For goals, separate professional from personal.
- For priorities, rate all four dimensions (WORK, REST, SOCIAL, GROWTH) even if the user was vague — use reasonable inference from context.
- For the suggested autonomy level, pick the one closest to what the user described.
- The summary should capture who this person is, not just list facts.

## Transcript
${transcript}`,
  });

  return object;
}
