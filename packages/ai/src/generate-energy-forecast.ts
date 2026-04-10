import { buildEnergyForecastPrompt } from "./build-energy-forecast-prompt";
import { parseEnergyForecastResponse } from "./parse-energy-forecast-response";
import type { EnergyForecastResponse } from "./schemas";

interface EnergyDriver {
  label: string;
  description: string;
  driverType: "ENERGIZER" | "DRAINER";
}

interface CalendarEvent {
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  isDrainer: boolean;
  isBooster: boolean;
}

interface GenerateEnergyForecastInput {
  drivers: EnergyDriver[];
  calendarEvents: CalendarEvent[];
  days: string[];
}

export async function generateEnergyForecast(
  input: GenerateEnergyForecastInput
): Promise<EnergyForecastResponse> {
  const prompt = buildEnergyForecastPrompt(input);
  return parseEnergyForecastResponse(prompt);
}
