interface PersonaCard {
  summary: string;
  communicationStyle: string;
  boundaryNotes: string;
}

interface EnergyDriver {
  label: string;
  description: string;
  driverType: "ENERGIZER" | "DRAINER";
}

interface Goal {
  title: string;
  description: string;
  category: "PROFESSIONAL" | "PERSONAL";
}

interface Priority {
  dimension: "WORK" | "REST" | "SOCIAL" | "GROWTH";
  importance: number;
}

interface CalendarEvent {
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  isDrainer: boolean;
  isBooster: boolean;
}

interface BuildSuggestionPromptInput {
  persona: PersonaCard;
  drivers: EnergyDriver[];
  goals: Goal[];
  priorities: Priority[];
  calendarEvents: CalendarEvent[];
  mode: "PERSONAL" | "PROFESSIONAL";
}

function formatEvent(event: CalendarEvent): string {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const day = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
  return `- ${day}: ${event.title} (${startTime}–${endTime})${tagStr}`;
}

export function buildSuggestionPrompt(
  input: BuildSuggestionPromptInput
): string {
  const { persona, drivers, goals, priorities, calendarEvents, mode } = input;

  const energizers = drivers
    .filter((d) => d.driverType === "ENERGIZER")
    .map((d) => `- ${d.label}: ${d.description}`)
    .join("\n");

  const drainers = drivers
    .filter((d) => d.driverType === "DRAINER")
    .map((d) => `- ${d.label}: ${d.description}`)
    .join("\n");

  const modeGoals = goals
    .filter((g) => g.category === mode)
    .map((g) => `- ${g.title}: ${g.description}`)
    .join("\n");

  const allGoals = goals
    .map((g) => `- [${g.category}] ${g.title}: ${g.description}`)
    .join("\n");

  const priorityStr = priorities
    .map((p) => `- ${p.dimension}: ${p.importance}/10`)
    .join("\n");

  const eventStr =
    calendarEvents.length > 0
      ? calendarEvents.map(formatEvent).join("\n")
      : "No events scheduled.";

  return `You are Alter — an AI life dashboard that generates actionable suggestions for a user based on their persona, energy patterns, goals, and upcoming calendar.

## User Persona
${persona.summary}

Communication style: ${persona.communicationStyle}
Boundaries: ${persona.boundaryNotes}

## Energy Drivers
**Energisers:**
${energizers || "None specified."}

**Drainers:**
${drainers || "None specified."}

## Goals
${mode === "PERSONAL" ? "Focus on personal goals:" : "Focus on professional goals:"}
${modeGoals || "None specified."}

All goals for context:
${allGoals}

## Life Balance Priorities
${priorityStr}

## Upcoming Calendar (next 7 days)
${eventStr}

## Task
Generate 3-5 ${mode.toLowerCase()} suggestions that:
1. Align with the user's stated goals and priorities
2. Account for their energy drivers (avoid stacking drainers, leverage energisers)
3. Fill calendar gaps with high-value activities
4. Respect their boundaries and communication preferences
5. Are concrete and actionable — not generic advice

For each suggestion, determine:
- The appropriate autonomy level: OBSERVER (just reflect), ADVISOR (suggest with accept/decline), COPILOT (prepare a draft action), or AUTONOMOUS (act within rules)
- An action type: SCHEDULE_EVENT, BLOCK_TIME, DECLINE_MEETING, or SUGGEST_ACTIVITY
- A payload with specific details (times, titles, etc.)

Set mode to "${mode}" for all suggestions.`;
}
