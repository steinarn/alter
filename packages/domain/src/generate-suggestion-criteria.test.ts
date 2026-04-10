import { describe, it, expect } from "vitest";
import { generateSuggestionCriteria } from "./generate-suggestion-criteria";
import type { DayForecast } from "./compute-energy-forecast";
import type { BalanceResult } from "./compute-balance-scores";
import type { Conflict } from "./detect-conflicts";
import type { Goal } from "./types";

describe("generateSuggestionCriteria", () => {
  const emptyForecast: DayForecast[] = [];
  const emptyBalance: BalanceResult[] = [];
  const emptyConflicts: Conflict[] = [];
  const emptyGoals: Goal[] = [];

  it("returns empty list when there are no inputs", () => {
    const result = generateSuggestionCriteria(
      emptyForecast,
      emptyBalance,
      emptyConflicts,
      emptyGoals
    );
    expect(result).toEqual([]);
  });

  it("creates suggestions from conflict alerts", () => {
    const conflicts: Conflict[] = [
      {
        type: "consecutive_drainers",
        severity: "warning",
        message: "3 back-to-back draining events",
        events: [
          { id: "1", title: "M1" },
          { id: "2", title: "M2" },
          { id: "3", title: "M3" },
        ],
        date: "2026-04-14",
      },
    ];

    const result = generateSuggestionCriteria(
      emptyForecast,
      emptyBalance,
      conflicts,
      emptyGoals
    );
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].title).toContain("recovery break");
  });

  it("creates suggestions for low-energy days", () => {
    const forecast: DayForecast[] = [
      {
        date: "2026-04-14",
        predictedLevel: -5,
        reason: "5 draining events",
        events: [],
      },
    ];

    const result = generateSuggestionCriteria(
      forecast,
      emptyBalance,
      emptyConflicts,
      emptyGoals
    );
    expect(result.some((s) => s.title.includes("energy"))).toBe(true);
  });

  it("creates suggestions for under-invested dimensions", () => {
    const balance: BalanceResult[] = [
      { dimension: "REST", score: 1, target: 6, delta: -5 },
      { dimension: "WORK", score: 8, target: 8, delta: 0 },
      { dimension: "SOCIAL", score: 5, target: 5, delta: 0 },
      { dimension: "GROWTH", score: 5, target: 7, delta: -2 },
    ];

    const result = generateSuggestionCriteria(
      emptyForecast,
      balance,
      emptyConflicts,
      emptyGoals
    );
    expect(result.some((s) => s.title.includes("rest"))).toBe(true);
    // GROWTH delta is -2, not ≤ -3, so no suggestion
    expect(result.some((s) => s.title.includes("growth"))).toBe(false);
  });

  it("creates goal-based suggestions", () => {
    const goals: Goal[] = [
      {
        id: "g1",
        userId: "user-1",
        title: "Learn Rust",
        description: "Complete the Rust Book",
        category: "PROFESSIONAL",
        createdAt: new Date(),
      },
    ];

    const result = generateSuggestionCriteria(
      emptyForecast,
      emptyBalance,
      emptyConflicts,
      goals
    );
    expect(result.some((s) => s.title.includes("Learn Rust"))).toBe(true);
  });

  it("sorts suggestions by priority descending", () => {
    const conflicts: Conflict[] = [
      {
        type: "consecutive_drainers",
        severity: "critical",
        message: "5 back-to-back drainers",
        events: [],
        date: "2026-04-14",
      },
    ];

    const goals: Goal[] = [
      {
        id: "g1",
        userId: "user-1",
        title: "Learn Rust",
        description: "",
        category: "PROFESSIONAL",
        createdAt: new Date(),
      },
    ];

    const result = generateSuggestionCriteria(
      emptyForecast,
      emptyBalance,
      conflicts,
      goals
    );
    // Critical conflict (9) should come before goal (5)
    expect(result[0].priority).toBeGreaterThanOrEqual(
      result[result.length - 1].priority
    );
  });
});
