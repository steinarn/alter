import type {
  CalendarEvent,
  Priority,
  BalanceDimension,
} from "./types";

export interface BalanceResult {
  dimension: BalanceDimension;
  score: number; // 0-10
  target: number; // from priority importance
  delta: number; // score - target (negative = under-invested)
}

const DIMENSION_KEYWORDS: Record<BalanceDimension, string[]> = {
  WORK: [
    "meeting", "standup", "sprint", "review", "planning", "retro",
    "demo", "interview", "architecture", "stakeholder", "admin",
    "code", "deploy", "feature", "bug", "work", "focus",
  ],
  REST: [
    "break", "rest", "recovery", "sleep", "nap", "downtime",
    "nothing", "chill", "relax", "off",
  ],
  SOCIAL: [
    "lunch", "dinner", "friends", "family", "coffee", "social",
    "party", "hangout", "call", "catch up", "colleague",
  ],
  GROWTH: [
    "learn", "study", "course", "book", "run", "gym", "training",
    "workout", "exercise", "yoga", "meditation", "growth", "rust",
    "personal", "hobby", "marathon",
  ],
};

/**
 * Calculate balance scores for each dimension based on calendar events
 * in the given window. Compares actual time allocation against priority targets.
 *
 * Score calculation:
 * 1. Classify each event into a dimension via keyword matching
 * 2. Sum hours per dimension
 * 3. Normalise to 0-10 scale (using total hours as denominator)
 * 4. Compare to target (priority importance)
 */
export function computeBalanceScores(
  events: CalendarEvent[],
  priorities: Priority[]
): BalanceResult[] {
  const hours: Record<BalanceDimension, number> = {
    WORK: 0,
    REST: 0,
    SOCIAL: 0,
    GROWTH: 0,
  };

  for (const event of events) {
    const dim = classifyEvent(event.title);
    const duration =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60);
    hours[dim] += duration;
  }

  const totalHours = Object.values(hours).reduce((sum, h) => sum + h, 0);

  const priorityMap = new Map(priorities.map((p) => [p.dimension, p.importance]));

  const dimensions: BalanceDimension[] = ["WORK", "REST", "SOCIAL", "GROWTH"];

  return dimensions.map((dim) => {
    const score =
      totalHours > 0
        ? round2((hours[dim] / totalHours) * 10)
        : 0;
    const target = priorityMap.get(dim) ?? 5;
    return {
      dimension: dim,
      score,
      target,
      delta: round2(score - target),
    };
  });
}

function classifyEvent(title: string): BalanceDimension {
  const lower = title.toLowerCase();

  let bestDimension: BalanceDimension = "WORK"; // default
  let bestScore = 0;

  for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS) as Array<
    [BalanceDimension, string[]]
  >) {
    const matchCount = keywords.filter((kw) => lower.includes(kw)).length;
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestDimension = dim;
    }
  }

  return bestDimension;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
