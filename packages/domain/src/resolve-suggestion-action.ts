import type { AutonomyLevel, SuggestionStatus } from "./types";
import type { FilteredSuggestion } from "./filter-suggestions-by-autonomy";

export type ActionResolution =
  | { action: "show"; newStatus: SuggestionStatus }
  | { action: "prepare_draft"; newStatus: SuggestionStatus }
  | { action: "auto_execute"; newStatus: SuggestionStatus }
  | { action: "accept"; newStatus: "ACCEPTED" }
  | { action: "decline"; newStatus: "DECLINED" };

/**
 * Determine what action to take for a suggestion at a given autonomy level
 * and user decision.
 *
 * - OBSERVER: no action beyond showing the reflection → status stays PENDING
 * - ADVISOR: user must accept or decline → status changes accordingly
 * - COPILOT: suggestion is prepared as a draft, user confirms or declines
 * - AUTONOMOUS: suggestion is auto-executed → status immediately ACTED
 */
export function resolveSuggestionAction(
  suggestion: FilteredSuggestion,
  userDecision?: "accept" | "decline"
): ActionResolution {
  switch (suggestion.presentation) {
    case "reflection":
      return { action: "show", newStatus: "PENDING" };

    case "action":
      if (userDecision === "accept") {
        return { action: "accept", newStatus: "ACCEPTED" };
      }
      if (userDecision === "decline") {
        return { action: "decline", newStatus: "DECLINED" };
      }
      return { action: "show", newStatus: "PENDING" };

    case "draft":
      if (userDecision === "accept") {
        return { action: "accept", newStatus: "ACCEPTED" };
      }
      if (userDecision === "decline") {
        return { action: "decline", newStatus: "DECLINED" };
      }
      return { action: "prepare_draft", newStatus: "PENDING" };

    case "notification":
      return { action: "auto_execute", newStatus: "ACTED" };
  }
}
