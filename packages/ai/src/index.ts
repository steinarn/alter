export { ollama, model } from "./provider";
export {
  personaResponseSchema,
  suggestionResponseSchema,
  energyForecastResponseSchema,
  type PersonaResponse,
  type SuggestionResponse,
  type EnergyForecastResponse,
} from "./schemas";
export {
  buildOnboardingSystemPrompt,
  buildOnboardingUserPrompt,
  detectConversationStage,
  isConversationSufficient,
  type OnboardingStage,
} from "./build-onboarding-prompt";
export { parsePersonaResponse } from "./parse-persona-response";
export { buildSuggestionPrompt } from "./build-suggestion-prompt";
export { buildEnergyForecastPrompt } from "./build-energy-forecast-prompt";
export { parseSuggestionResponse } from "./parse-suggestion-response";
export { parseEnergyForecastResponse } from "./parse-energy-forecast-response";
export { generateSuggestions } from "./generate-suggestions";
export { generateEnergyForecast } from "./generate-energy-forecast";
