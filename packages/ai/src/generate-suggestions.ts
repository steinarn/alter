import { buildSuggestionPrompt } from "./build-suggestion-prompt";
import { parseSuggestionResponse } from "./parse-suggestion-response";
import type { SuggestionResponse } from "./schemas";

interface PersonaCard {
  summary: string;
  communicationStyle: string;
  boundaryNotes: string;
}

interface EnergyDriver {
  label: string;
  description: string;
  driverType: "ENERGIZER" | "DRAINER";
}

interface Goal {
  title: string;
  description: string;
  category: "PROFESSIONAL" | "PERSONAL";
}

interface Priority {
  dimension: "WORK" | "REST" | "SOCIAL" | "GROWTH";
  importance: number;
}

interface CalendarEvent {
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  isDrainer: boolean;
  isBooster: boolean;
}

interface GenerateSuggestionsInput {
  persona: PersonaCard;
  drivers: EnergyDriver[];
  goals: Goal[];
  priorities: Priority[];
  calendarEvents: CalendarEvent[];
  mode: "PERSONAL" | "PROFESSIONAL";
}

export async function generateSuggestions(
  input: GenerateSuggestionsInput
): Promise<SuggestionResponse> {
  const prompt = buildSuggestionPrompt(input);
  return parseSuggestionResponse(prompt);
}
