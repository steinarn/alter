import type { AutonomyLevel } from "./types";
import type { SuggestionCriterion } from "./generate-suggestion-criteria";

export interface FilteredSuggestion extends SuggestionCriterion {
  presentation: "reflection" | "action" | "draft" | "notification";
  showAcceptDecline: boolean;
}

const AUTONOMY_RANK: Record<AutonomyLevel, number> = {
  OBSERVER: 0,
  ADVISOR: 1,
  COPILOT: 2,
  AUTONOMOUS: 3,
};

/**
 * Filter and shape suggestions based on the current autonomy level.
 *
 * Rules:
 * - OBSERVER: all suggestions shown as reflections (no action buttons)
 * - ADVISOR: suggestions ≤ ADVISOR shown with Accept/Decline buttons
 * - COPILOT: suggestions ≤ COPILOT shown as pre-drafted actions (confirm to execute)
 * - AUTONOMOUS: suggestions ≤ AUTONOMOUS auto-acted, shown as notifications
 *
 * Suggestions requiring a higher autonomy level than the user's setting are
 * downgraded to the maximum presentation available.
 */
export function filterSuggestionsByAutonomy(
  suggestions: SuggestionCriterion[],
  userLevel: AutonomyLevel
): FilteredSuggestion[] {
  if (userLevel === "AUTONOMOUS") {
    return suggestions.map((suggestion) => ({
      ...suggestion,
      presentation: "notification",
      showAcceptDecline: false,
    }));
  }

  const userRank = AUTONOMY_RANK[userLevel];

  return suggestions.map((suggestion) => {
    const requiredRank = AUTONOMY_RANK[suggestion.autonomyLevelRequired];
    const effectiveRank = Math.min(requiredRank, userRank);

    return {
      ...suggestion,
      ...getPresentation(effectiveRank),
    };
  });
}

function getPresentation(rank: number): {
  presentation: FilteredSuggestion["presentation"];
  showAcceptDecline: boolean;
} {
  switch (rank) {
    case 0:
      return { presentation: "reflection", showAcceptDecline: false };
    case 1:
      return { presentation: "action", showAcceptDecline: true };
    case 2:
      return { presentation: "draft", showAcceptDecline: true };
    case 3:
      return { presentation: "notification", showAcceptDecline: false };
    default:
      return { presentation: "reflection", showAcceptDecline: false };
  }
}
