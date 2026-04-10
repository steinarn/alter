import { describe, it, expect } from "vitest";
import { filterSuggestionsByAutonomy } from "./filter-suggestions-by-autonomy";
import type { SuggestionCriterion } from "./generate-suggestion-criteria";

function makeSuggestion(
  overrides: Partial<SuggestionCriterion> = {}
): SuggestionCriterion {
  return {
    title: "Add a recovery break",
    description: "Insert a break between meetings.",
    reason: "3 back-to-back draining events.",
    mode: "PROFESSIONAL",
    autonomyLevelRequired: "ADVISOR",
    priority: 7,
    ...overrides,
  };
}

describe("filterSuggestionsByAutonomy", () => {
  it("presents all suggestions as reflections in OBSERVER mode", () => {
    const suggestions = [
      makeSuggestion({ autonomyLevelRequired: "ADVISOR" }),
      makeSuggestion({ autonomyLevelRequired: "COPILOT" }),
    ];

    const result = filterSuggestionsByAutonomy(suggestions, "OBSERVER");
    for (const s of result) {
      expect(s.presentation).toBe("reflection");
      expect(s.showAcceptDecline).toBe(false);
    }
  });

  it("presents ADVISOR-level suggestions with accept/decline in ADVISOR mode", () => {
    const suggestions = [
      makeSuggestion({ autonomyLevelRequired: "ADVISOR" }),
    ];

    const result = filterSuggestionsByAutonomy(suggestions, "ADVISOR");
    expect(result[0].presentation).toBe("action");
    expect(result[0].showAcceptDecline).toBe(true);
  });

  it("downgrades COPILOT suggestions to ADVISOR presentation when user is ADVISOR", () => {
    const suggestions = [
      makeSuggestion({ autonomyLevelRequired: "COPILOT" }),
    ];

    const result = filterSuggestionsByAutonomy(suggestions, "ADVISOR");
    expect(result[0].presentation).toBe("action");
    expect(result[0].showAcceptDecline).toBe(true);
  });

  it("presents COPILOT suggestions as drafts when user is COPILOT", () => {
    const suggestions = [
      makeSuggestion({ autonomyLevelRequired: "COPILOT" }),
    ];

    const result = filterSuggestionsByAutonomy(suggestions, "COPILOT");
    expect(result[0].presentation).toBe("draft");
    expect(result[0].showAcceptDecline).toBe(true);
  });

  it("presents as notifications in AUTONOMOUS mode", () => {
    const suggestions = [
      makeSuggestion({ autonomyLevelRequired: "AUTONOMOUS" }),
    ];

    const result = filterSuggestionsByAutonomy(suggestions, "AUTONOMOUS");
    expect(result[0].presentation).toBe("notification");
    expect(result[0].showAcceptDecline).toBe(false);
  });

  it("keeps ADVISOR suggestions as action even in AUTONOMOUS mode", () => {
    const suggestions = [
      makeSuggestion({ autonomyLevelRequired: "ADVISOR" }),
    ];

    const result = filterSuggestionsByAutonomy(suggestions, "AUTONOMOUS");
    // ADVISOR required rank (1) ≤ AUTONOMOUS user rank (3) → effective rank is 1 → action
    expect(result[0].presentation).toBe("action");
  });

  it("preserves original suggestion fields", () => {
    const original = makeSuggestion({
      title: "Test title",
      priority: 9,
    });

    const result = filterSuggestionsByAutonomy([original], "ADVISOR");
    expect(result[0].title).toBe("Test title");
    expect(result[0].priority).toBe(9);
  });
});
