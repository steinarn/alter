import type {
  PersonaGeneratePayload,
  SuggestionsGeneratePayload,
  ForecastGeneratePayload,
  BalanceRecalculatePayload,
  SuggestionExecutePayload,
} from "./types";

console.log("🔧 Alter worker starting...");

// Worker processors will be registered in Phase 10
export type {
  PersonaGeneratePayload,
  SuggestionsGeneratePayload,
  ForecastGeneratePayload,
  BalanceRecalculatePayload,
  SuggestionExecutePayload,
};
