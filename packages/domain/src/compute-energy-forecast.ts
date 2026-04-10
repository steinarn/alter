import type {
  CalendarEvent,
  EnergyDriver,
} from "./types";

export interface DayForecast {
  date: string; // ISO date string (YYYY-MM-DD)
  predictedLevel: number; // -10 to +10
  reason: string;
  events: Array<{ title: string; impact: number }>;
}

/**
 * Predict energy levels for each day based on scheduled events and known drivers.
 *
 * Algorithm: for each day, sum up `duration_hours × impact` for every event.
 * - Drainer events contribute negative impact (-1 per hour by default)
 * - Booster events contribute positive impact (+1 per hour by default)
 * - Events matching a known driver get their impact amplified ×1.5
 * - Neutral events (neither drainer nor booster) contribute 0
 *
 * The raw score is clamped to [-10, +10].
 */
export function computeEnergyForecast(
  events: CalendarEvent[],
  drivers: EnergyDriver[],
  days: string[] // ISO date strings
): DayForecast[] {
  const driverLabels = new Map(
    drivers.map((d) => [d.label.toLowerCase(), d.driverType])
  );

  return days.map((day) => {
    const dayEvents = events.filter(
      (e) => toDateString(e.startTime) === day
    );

    let totalScore = 0;
    const eventImpacts: Array<{ title: string; impact: number }> = [];

    for (const event of dayEvents) {
      const durationHours = getDurationHours(event.startTime, event.endTime);

      let baseImpact = 0;
      if (event.isDrainer) baseImpact = -1;
      if (event.isBooster) baseImpact = 1;

      // Amplify if matches a known driver
      const matchesDriver = driverLabels.has(event.title.toLowerCase());
      const multiplier = matchesDriver ? 1.5 : 1;

      const impact = baseImpact * durationHours * multiplier;
      totalScore += impact;
      eventImpacts.push({ title: event.title, impact: round2(impact) });
    }

    const clamped = clamp(round2(totalScore), -10, 10);

    const reason = buildReason(dayEvents, clamped);

    return {
      date: day,
      predictedLevel: clamped,
      reason,
      events: eventImpacts,
    };
  });
}

function buildReason(events: CalendarEvent[], level: number): string {
  if (events.length === 0) return "No events scheduled — a recovery day.";

  const drainerCount = events.filter((e) => e.isDrainer).length;
  const boosterCount = events.filter((e) => e.isBooster).length;

  if (level >= 3)
    return `${boosterCount} energising event${boosterCount !== 1 ? "s" : ""} — looking like a great day.`;
  if (level <= -3)
    return `${drainerCount} draining event${drainerCount !== 1 ? "s" : ""} — energy will be low.`;
  return `Mix of ${boosterCount} energiser${boosterCount !== 1 ? "s" : ""} and ${drainerCount} drainer${drainerCount !== 1 ? "s" : ""}.`;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDurationHours(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
