import { z } from "zod";

export const suggestionResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z
        .string()
        .describe("Short, actionable suggestion title"),
      description: z
        .string()
        .describe(
          "Detailed explanation of the suggestion and why it fits the user's current situation"
        ),
      reason: z
        .string()
        .describe(
          "Concise reason linking the suggestion to the user's goals, energy drivers, or calendar"
        ),
      mode: z
        .enum(["PERSONAL", "PROFESSIONAL"])
        .describe("Whether this is a personal or professional suggestion"),
      autonomyLevelRequired: z
        .enum(["OBSERVER", "ADVISOR", "COPILOT", "AUTONOMOUS"])
        .describe(
          "The minimum autonomy level needed for this suggestion to be actionable"
        ),
      actionType: z
        .string()
        .describe(
          "The type of action: SCHEDULE_EVENT, BLOCK_TIME, DECLINE_MEETING, SUGGEST_ACTIVITY"
        ),
      actionPayload: z
        .record(z.unknown())
        .describe("Action-specific data (e.g. event title, start/end times)"),
    })
  ),
});

export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>;
