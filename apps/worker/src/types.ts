export interface PersonaGeneratePayload {
  userId: string;
  conversationHistory: Array<{
    role: "USER" | "ASSISTANT";
    content: string;
  }>;
}

export interface SuggestionsGeneratePayload {
  userId: string;
  mode: "PERSONAL" | "PROFESSIONAL";
}

export interface ForecastGeneratePayload {
  userId: string;
  startDate: string;
  endDate: string;
}

export interface BalanceRecalculatePayload {
  userId: string;
}

export interface SuggestionExecutePayload {
  suggestionId: string;
}
