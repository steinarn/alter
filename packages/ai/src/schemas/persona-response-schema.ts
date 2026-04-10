import { z } from "zod";

export const personaResponseSchema = z.object({
  summary: z
    .string()
    .describe(
      "A 2-3 sentence summary of who this person is — their core identity, values, and what drives them."
    ),
  communicationStyle: z
    .string()
    .describe(
      "How this person prefers to communicate and be communicated with. Include tone, frequency, and boundaries."
    ),
  boundaryNotes: z
    .string()
    .describe(
      "Key boundaries this person has set — things they want to protect, limits on availability, non-negotiables."
    ),
  energyDrivers: z.array(
    z.object({
      label: z.string().describe("Short name for the energy driver"),
      description: z
        .string()
        .describe("Why this energizes or drains the person"),
      driverType: z
        .enum(["ENERGIZER", "DRAINER"])
        .describe("Whether this gives or takes energy"),
    })
  ),
  goals: z.array(
    z.object({
      title: z.string().describe("Goal title"),
      description: z.string().describe("What achieving this goal looks like"),
      category: z
        .enum(["PROFESSIONAL", "PERSONAL"])
        .describe("Whether this is a work or life goal"),
    })
  ),
  priorities: z.array(
    z.object({
      dimension: z.enum(["WORK", "REST", "SOCIAL", "GROWTH"]),
      importance: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("How important this dimension is, 1-10"),
    })
  ),
  suggestedAutonomyLevel: z
    .enum(["OBSERVER", "ADVISOR", "COPILOT", "AUTONOMOUS"])
    .describe(
      "The autonomy level that best matches this person's stated preferences"
    ),
});

export type PersonaResponse = z.infer<typeof personaResponseSchema>;
