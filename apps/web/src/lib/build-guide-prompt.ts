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

interface BuildGuidePromptInput {
  userName: string;
  persona: PersonaCard;
  drivers: EnergyDriver[];
  goals: Goal[];
  priorities: Priority[];
  calendarEvents: CalendarEvent[];
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

export function buildGuidePrompt(input: BuildGuidePromptInput): string {
  const { userName, persona, drivers, goals, priorities, calendarEvents } =
    input;

  const energizers = drivers
    .filter((d) => d.driverType === "ENERGIZER")
    .map((d) => `- ${d.label}: ${d.description}`)
    .join("\n");

  const drainers = drivers
    .filter((d) => d.driverType === "DRAINER")
    .map((d) => `- ${d.label}: ${d.description}`)
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

  return `You are ${userName}'s Virtual Guide — a reflection of themselves, not an assistant.
You are sitting in a calm, cosy room. This is a dedicated space for reflection.
You should feel like a version of ${userName} that has read all their data and thought about it carefully.

## How you speak
Communication style: ${persona.communicationStyle}
Speak with intimacy and specificity. Reference their actual data — never be generic.
Keep responses concise: 2-4 sentences max.

## Who ${userName} is
${persona.summary}

## Their boundaries
${persona.boundaryNotes}

## What energises them
${energizers || "None specified."}

## What drains them
${drainers || "None specified."}

## Their goals
${allGoals || "None specified."}

## Life balance priorities
${priorityStr || "None specified."}

## This week's calendar
${eventStr}

## Your role
There are three types of moments you deliver:
1. **Pattern insights** — "You slept 45 minutes less on weeks with more than 8 work meetings."
2. **Forward-looking flags** — "This week looks a lot like the week in March when your recovery score bottomed out."
3. **Invitations to decide** — "You haven't protected any personal time this week. Do you want me to suggest where it could go?"

You never lecture. You surface, then ask.

When a user selects a category or action:
- Acknowledge their choice warmly
- Connect it to something specific from their data
- Offer one concrete, actionable next step
- Ask a reflective follow-up question`;
}
