import { Queue } from "bullmq";
import type {
  PersonaGeneratePayload,
  SuggestionsGeneratePayload,
  ForecastGeneratePayload,
  BalanceRecalculatePayload,
  SuggestionExecutePayload,
} from "./types";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const QUEUE_NAMES = {
  PERSONA: "persona",
  SUGGESTIONS: "suggestions",
  FORECAST: "forecast",
  BALANCE: "balance",
  SUGGESTION_EXECUTE: "suggestion-execute",
} as const;

export const personaQueue = new Queue<PersonaGeneratePayload>(
  QUEUE_NAMES.PERSONA,
  { connection }
);

export const suggestionsQueue = new Queue<SuggestionsGeneratePayload>(
  QUEUE_NAMES.SUGGESTIONS,
  { connection }
);

export const forecastQueue = new Queue<ForecastGeneratePayload>(
  QUEUE_NAMES.FORECAST,
  { connection }
);

export const balanceQueue = new Queue<BalanceRecalculatePayload>(
  QUEUE_NAMES.BALANCE,
  { connection }
);

export const suggestionExecuteQueue = new Queue<SuggestionExecutePayload>(
  QUEUE_NAMES.SUGGESTION_EXECUTE,
  { connection }
);
