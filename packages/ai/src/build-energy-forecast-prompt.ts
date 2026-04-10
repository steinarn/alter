interface EnergyDriver {
  label: string;
  description: string;
  driverType: "ENERGIZER" | "DRAINER";
}

interface CalendarEvent {
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  isDrainer: boolean;
  isBooster: boolean;
}

interface BuildEnergyForecastPromptInput {
  drivers: EnergyDriver[];
  calendarEvents: CalendarEvent[];
  days: string[];
}

function formatEvent(event: CalendarEvent): string {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTime = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const tags: string[] = [];
  if (event.isDrainer) tags.push("DRAINER");
  if (event.isBooster) tags.push("BOOSTER");
  const tagStr = tags.length > 0 ? ` [${tags.join(", ")}]` : "";
  return `  - ${event.title} (${startTime}–${endTime})${tagStr}`;
}

function groupEventsByDay(
  events: CalendarEvent[],
  days: string[]
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const day of days) {
    map.set(day, []);
  }
  for (const event of events) {
    const date = new Date(event.startTime).toISOString().split("T")[0];
    const existing = map.get(date);
    if (existing) existing.push(event);
  }
  return map;
}

export function buildEnergyForecastPrompt(
  input: BuildEnergyForecastPromptInput
): string {
  const { drivers, calendarEvents, days } = input;

  const energizers = drivers
    .filter((d) => d.driverType === "ENERGIZER")
    .map((d) => `- ${d.label}: ${d.description}`)
    .join("\n");

  const drainers = drivers
    .filter((d) => d.driverType === "DRAINER")
    .map((d) => `- ${d.label}: ${d.description}`)
    .join("\n");

  const grouped = groupEventsByDay(calendarEvents, days);
  const calendarStr = days
    .map((day) => {
      const dayLabel = new Date(day + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      const events = grouped.get(day) ?? [];
      if (events.length === 0) return `${dayLabel} (${day}): No events`;
      const eventLines = events.map(formatEvent).join("\n");
      return `${dayLabel} (${day}):\n${eventLines}`;
    })
    .join("\n\n");

  return `You are Alter — an AI that predicts a user's energy levels for the upcoming week based on their scheduled events and known energy drivers.

## Energy Drivers
**Energisers (activities that boost energy):**
${energizers || "None specified."}

**Drainers (activities that deplete energy):**
${drainers || "None specified."}

## Weekly Calendar
${calendarStr}

## Task
For each of the following dates, predict the user's energy level on a scale of 1-10:
- 1-2: Exhausted — too many drainers, no recovery
- 3-4: Low — drainer-heavy day, limited energy
- 5-6: Moderate — balanced mix
- 7-8: Good — more energisers than drainers
- 9-10: Peak — energiser-rich day with recovery time

Consider:
1. Number and duration of drainer events vs energiser events
2. Back-to-back drainers deplete energy faster (compounding effect)
3. Days with no events default to moderate-high energy (6-7)
4. Recovery time after drainers helps (gap of 30min+ between drainers)
5. Morning energisers set a positive tone for the day

Provide a prediction for each date: ${days.join(", ")}

Include a brief, specific reason for each prediction referencing the actual events scheduled.`;
}
