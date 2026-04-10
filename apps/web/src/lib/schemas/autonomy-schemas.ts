import { z } from "zod";

const autonomyLevelSchema = z.enum([
  "OBSERVER",
  "ADVISOR",
  "COPILOT",
  "AUTONOMOUS",
]);

export const updateAutonomySchema = z.object({
  level: autonomyLevelSchema.optional(),
  personalMode: autonomyLevelSchema.optional(),
  professionalMode: autonomyLevelSchema.optional(),
});

export type UpdateAutonomyInput = z.infer<typeof updateAutonomySchema>;
