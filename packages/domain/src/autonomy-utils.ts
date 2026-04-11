import type { AutonomyLevel, SuggestionMode } from "./types";

const AUTONOMY_RANK: Record<AutonomyLevel, number> = {
  OBSERVER: 0,
  ADVISOR: 1,
  COPILOT: 2,
  AUTONOMOUS: 3,
};

export function deriveOverallAutonomyLevel(
  personalMode: AutonomyLevel,
  professionalMode: AutonomyLevel
): AutonomyLevel {
  return AUTONOMY_RANK[personalMode] >= AUTONOMY_RANK[professionalMode]
    ? personalMode
    : professionalMode;
}

export function getAutonomyLevelForMode(
  setting:
    | {
        level?: AutonomyLevel | null;
        personalMode?: AutonomyLevel | null;
        professionalMode?: AutonomyLevel | null;
      }
    | null
    | undefined,
  mode: SuggestionMode
): AutonomyLevel {
  if (!setting) return "OBSERVER";

  if (mode === "PERSONAL") {
    return setting.personalMode ?? setting.level ?? "OBSERVER";
  }

  return setting.professionalMode ?? setting.level ?? "OBSERVER";
}
