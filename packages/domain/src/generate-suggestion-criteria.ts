import type { BalanceResult } from "./compute-balance-scores";
import type { DayForecast } from "./compute-energy-forecast";
import type { Conflict } from "./detect-conflicts";
import type { Goal, AutonomyLevel, SuggestionMode } from "./types";

export interface SuggestionCriterion {
  title: string;
  description: string;
  reason: string;
  mode: SuggestionMode;
  autonomyLevelRequired: AutonomyLevel;
  priority: number; // 1-10
}

/**
 * Determine what suggestions to make based on energy forecast, balance scores,
 * conflicts, and goals. Pure function — no side effects.
 */
export function generateSuggestionCriteria(
  forecast: DayForecast[],
  balance: BalanceResult[],
  conflicts: Conflict[],
  goals: Goal[]
): SuggestionCriterion[] {
  const suggestions: SuggestionCriterion[] = [];

  // 1. Conflict-based suggestions
  for (const conflict of conflicts) {
    if (conflict.type === "consecutive_drainers") {
      suggestions.push({
        title: "Add a recovery break",
        description: `Insert a 15-30 min break between meetings on ${conflict.date} to prevent energy crash.`,
        reason: conflict.message,
        mode: "PROFESSIONAL",
        autonomyLevelRequired: "ADVISOR",
        priority: conflict.severity === "critical" ? 9 : 7,
      });
    }

    if (conflict.type === "no_recovery") {
      suggestions.push({
        title: "Schedule recovery time",
        description: `Add a buffer before or after "${conflict.events[0].title}" on ${conflict.date}.`,
        reason: conflict.message,
        mode: "PROFESSIONAL",
        autonomyLevelRequired: "ADVISOR",
        priority: 6,
      });
    }
  }

  // 2. Energy forecast-based suggestions
  const lowEnergyDays = forecast.filter((d) => d.predictedLevel <= -3);
  for (const day of lowEnergyDays) {
    suggestions.push({
      title: "Protect your energy",
      description: `${day.date} looks draining. Consider declining optional meetings or adding a booster activity.`,
      reason: day.reason,
      mode: "PERSONAL",
      autonomyLevelRequired: "ADVISOR",
      priority: 8,
    });
  }

  // 3. Balance-based suggestions
  for (const score of balance) {
    if (score.delta <= -3) {
      suggestions.push({
        title: `Invest more in ${score.dimension.toLowerCase()}`,
        description: buildBalanceSuggestion(score),
        reason: `Your ${score.dimension} score is ${score.score}/10 but your target is ${score.target}/10.`,
        mode: score.dimension === "WORK" ? "PROFESSIONAL" : "PERSONAL",
        autonomyLevelRequired: "ADVISOR",
        priority: 5,
      });
    }

    if (score.delta >= 3) {
      suggestions.push({
        title: `Rebalance away from ${score.dimension.toLowerCase()}`,
        description: `You're over-investing in ${score.dimension.toLowerCase()} (${score.score}/10 vs target ${score.target}/10). Consider redistributing time.`,
        reason: `Over-allocation in ${score.dimension}.`,
        mode: score.dimension === "WORK" ? "PROFESSIONAL" : "PERSONAL",
        autonomyLevelRequired: "ADVISOR",
        priority: 4,
      });
    }
  }

  // 4. Goal-based suggestions (if no goal-related events in forecast)
  for (const goal of goals) {
    suggestions.push({
      title: `Make progress on "${goal.title}"`,
      description: `Block time this week to work on "${goal.title}": ${goal.description}`,
      reason: `Active goal that needs attention.`,
      mode: goal.category === "PROFESSIONAL" ? "PROFESSIONAL" : "PERSONAL",
      autonomyLevelRequired: "COPILOT",
      priority: 5,
    });
  }

  // Sort by priority descending
  return suggestions.sort((a, b) => b.priority - a.priority);
}

function buildBalanceSuggestion(score: BalanceResult): string {
  switch (score.dimension) {
    case "REST":
      return "Schedule downtime — even 30 min of no-agenda time can help recharge.";
    case "SOCIAL":
      return "Reach out to a friend or colleague for a casual catch-up this week.";
    case "GROWTH":
      return "Block a learning or exercise session — growth compounds over time.";
    case "WORK":
      return "You may need more dedicated work blocks to hit your targets.";
  }
}
