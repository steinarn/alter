import { z } from "zod";

export const energyForecastResponseSchema = z.object({
  forecast: z.array(
    z.object({
      date: z
        .string()
        .describe("ISO date string (YYYY-MM-DD) for the forecasted day"),
      predictedLevel: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("Predicted energy level from 1 (exhausted) to 10 (peak)"),
      reason: z
        .string()
        .describe(
          "Brief explanation of why this energy level is predicted based on scheduled events and known drivers"
        ),
    })
  ),
});

export type EnergyForecastResponse = z.infer<
  typeof energyForecastResponseSchema
>;
