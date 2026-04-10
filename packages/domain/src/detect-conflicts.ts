import type { CalendarEvent } from "./types";

export interface Conflict {
  type: "consecutive_drainers" | "no_recovery";
  severity: "warning" | "critical";
  message: string;
  events: Array<{ id: string; title: string }>;
  date: string;
}

/**
 * Detect schedule conflicts that will drain energy:
 *
 * 1. **Consecutive drainers:** ≥3 back-to-back drainer events (gap ≤ 15 min)
 * 2. **No recovery:** A drainer event ≥2 hours with no booster/free gap (≥30 min) adjacent
 */
export function detectConflicts(events: CalendarEvent[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Group events by date
  const byDate = groupByDate(events);

  for (const [date, dayEvents] of byDate) {
    const sorted = dayEvents.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    // Check consecutive drainers
    const drainerRuns = findConsecutiveDrainerRuns(sorted);
    for (const run of drainerRuns) {
      if (run.length >= 3) {
        conflicts.push({
          type: "consecutive_drainers",
          severity: run.length >= 5 ? "critical" : "warning",
          message: `${run.length} back-to-back draining events — your energy will crash.`,
          events: run.map((e) => ({ id: e.id, title: e.title })),
          date,
        });
      }
    }

    // Check no recovery after long drainer
    for (let i = 0; i < sorted.length; i++) {
      const event = sorted[i];
      if (!event.isDrainer) continue;

      const durationHours =
        (event.endTime.getTime() - event.startTime.getTime()) /
        (1000 * 60 * 60);
      if (durationHours < 2) continue;

      const hasRecoveryAfter = checkRecoveryGap(sorted, i, "after");
      const hasRecoveryBefore = checkRecoveryGap(sorted, i, "before");

      if (!hasRecoveryAfter && !hasRecoveryBefore) {
        conflicts.push({
          type: "no_recovery",
          severity: "warning",
          message: `"${event.title}" is a ${Math.round(durationHours)}h drainer with no recovery time nearby.`,
          events: [{ id: event.id, title: event.title }],
          date,
        });
      }
    }
  }

  return conflicts;
}

function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const date = event.startTime.toISOString().slice(0, 10);
    const existing = map.get(date) ?? [];
    existing.push(event);
    map.set(date, existing);
  }
  return map;
}

/**
 * Find runs of consecutive drainer events where the gap between
 * one event's end and the next event's start is ≤15 minutes.
 */
function findConsecutiveDrainerRuns(
  sorted: CalendarEvent[]
): CalendarEvent[][] {
  const runs: CalendarEvent[][] = [];
  let currentRun: CalendarEvent[] = [];

  for (const event of sorted) {
    if (!event.isDrainer) {
      if (currentRun.length > 0) {
        runs.push(currentRun);
        currentRun = [];
      }
      continue;
    }

    if (currentRun.length === 0) {
      currentRun.push(event);
      continue;
    }

    const lastEvent = currentRun[currentRun.length - 1];
    const gapMinutes =
      (event.startTime.getTime() - lastEvent.endTime.getTime()) /
      (1000 * 60);

    if (gapMinutes <= 15) {
      currentRun.push(event);
    } else {
      runs.push(currentRun);
      currentRun = [event];
    }
  }

  if (currentRun.length > 0) {
    runs.push(currentRun);
  }

  return runs;
}

/**
 * Check if there's a ≥30 min gap (or a booster event) adjacent to the event.
 */
function checkRecoveryGap(
  sorted: CalendarEvent[],
  index: number,
  direction: "before" | "after"
): boolean {
  const event = sorted[index];
  const MIN_RECOVERY_MINUTES = 30;

  if (direction === "after") {
    const next = sorted[index + 1];
    if (!next) {
      // No event after — rest of day is free
      return true;
    }
    const gapMinutes =
      (next.startTime.getTime() - event.endTime.getTime()) / (1000 * 60);
    return gapMinutes >= MIN_RECOVERY_MINUTES || next.isBooster;
  }

  // direction === "before"
  const prev = sorted[index - 1];
  if (!prev) {
    // First event of the day — morning before it is free
    return true;
  }
  const gapMinutes =
    (event.startTime.getTime() - prev.endTime.getTime()) / (1000 * 60);
  return gapMinutes >= MIN_RECOVERY_MINUTES || prev.isBooster;
}
