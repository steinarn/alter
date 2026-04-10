import { generateObject } from "ai";
import { model } from "./provider";
import {
  energyForecastResponseSchema,
  type EnergyForecastResponse,
} from "./schemas";

export async function parseEnergyForecastResponse(
  prompt: string
): Promise<EnergyForecastResponse> {
  const { object } = await generateObject({
    model,
    schema: energyForecastResponseSchema,
    prompt,
  });

  return object;
}
