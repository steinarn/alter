import { describe, it, expect } from "vitest";
import { resolveSuggestionAction } from "./resolve-suggestion-action";
import type { FilteredSuggestion } from "./filter-suggestions-by-autonomy";

function makeSuggestion(
  presentation: FilteredSuggestion["presentation"],
  showAcceptDecline: boolean
): FilteredSuggestion {
  return {
    title: "Test",
    description: "Test",
    reason: "Test",
    mode: "PERSONAL",
    autonomyLevelRequired: "ADVISOR",
    priority: 5,
    presentation,
    showAcceptDecline,
  };
}

describe("resolveSuggestionAction", () => {
  describe("reflection (OBSERVER)", () => {
    it("returns show action with PENDING status", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("reflection", false)
      );
      expect(result).toEqual({ action: "show", newStatus: "PENDING" });
    });
  });

  describe("action (ADVISOR)", () => {
    it("returns show when no decision is made", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("action", true)
      );
      expect(result).toEqual({ action: "show", newStatus: "PENDING" });
    });

    it("returns accept when user accepts", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("action", true),
        "accept"
      );
      expect(result).toEqual({ action: "accept", newStatus: "ACCEPTED" });
    });

    it("returns decline when user declines", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("action", true),
        "decline"
      );
      expect(result).toEqual({ action: "decline", newStatus: "DECLINED" });
    });
  });

  describe("draft (COPILOT)", () => {
    it("returns prepare_draft when no decision is made", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("draft", true)
      );
      expect(result).toEqual({
        action: "prepare_draft",
        newStatus: "PENDING",
      });
    });

    it("returns accept when user confirms the draft", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("draft", true),
        "accept"
      );
      expect(result).toEqual({ action: "accept", newStatus: "ACCEPTED" });
    });

    it("returns decline when user rejects the draft", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("draft", true),
        "decline"
      );
      expect(result).toEqual({ action: "decline", newStatus: "DECLINED" });
    });
  });

  describe("notification (AUTONOMOUS)", () => {
    it("auto-executes with ACTED status", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("notification", false)
      );
      expect(result).toEqual({
        action: "auto_execute",
        newStatus: "ACTED",
      });
    });

    it("auto-executes regardless of any user decision", () => {
      const result = resolveSuggestionAction(
        makeSuggestion("notification", false),
        "decline" // should be ignored
      );
      expect(result).toEqual({
        action: "auto_execute",
        newStatus: "ACTED",
      });
    });
  });
});
