// ── Enums (mirrored from Prisma, kept pure — no Prisma imports) ────────────

export type AutonomyLevel = "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";

export type DriverType = "ENERGIZER" | "DRAINER";

export type GoalCategory = "PROFESSIONAL" | "PERSONAL";

export type SuggestionMode = "PERSONAL" | "PROFESSIONAL";

export type SuggestionStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "ACTED";

export type BalanceDimension = "WORK" | "REST" | "SOCIAL" | "GROWTH";

export type ConversationRole = "USER" | "ASSISTANT";

// ── Entity Types ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonaCard {
  id: string;
  userId: string;
  summary: string;
  communicationStyle: string;
  boundaryNotes: string;
  confirmedAt: Date | null;
  createdAt: Date;
}

export interface EnergyDriver {
  id: string;
  userId: string;
  label: string;
  description: string;
  driverType: DriverType;
  createdAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  createdAt: Date;
}

export interface Priority {
  id: string;
  userId: string;
  dimension: BalanceDimension;
  importance: number;
  notes: string | null;
  createdAt: Date;
}

export interface AutonomySetting {
  id: string;
  userId: string;
  level: AutonomyLevel;
  personalMode: AutonomyLevel;
  professionalMode: AutonomyLevel;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isDrainer: boolean;
  isBooster: boolean;
  source: string;
  createdAt: Date;
}

export interface EnergyForecast {
  id: string;
  userId: string;
  date: Date;
  predictedLevel: number;
  reason: string;
  createdAt: Date;
}

export interface BalanceScore {
  id: string;
  userId: string;
  dimension: BalanceDimension;
  score: number;
  computedAt: Date;
}

export interface Suggestion {
  id: string;
  userId: string;
  mode: SuggestionMode;
  title: string;
  description: string;
  reason: string;
  status: SuggestionStatus;
  autonomyLevelRequired: AutonomyLevel;
  createdAt: Date;
}

export interface SuggestionAction {
  id: string;
  suggestionId: string;
  actionType: string;
  payload: Record<string, unknown>;
  executedAt: Date | null;
}

export interface OnboardingConversation {
  id: string;
  userId: string;
  role: ConversationRole;
  content: string;
  stepIndex: number;
  createdAt: Date;
}
