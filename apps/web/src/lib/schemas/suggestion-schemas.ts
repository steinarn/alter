import { z } from "zod";

const suggestionStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "ACTED",
]);

export const updateSuggestionSchema = z.object({
  status: suggestionStatusSchema,
});

export type UpdateSuggestionInput = z.infer<typeof updateSuggestionSchema>;

export const actOnSuggestionSchema = z.object({
  confirm: z.boolean(),
});

export type ActOnSuggestionInput = z.infer<typeof actOnSuggestionSchema>;
