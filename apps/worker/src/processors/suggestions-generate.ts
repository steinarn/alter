import type { Job } from "bullmq";
import { PrismaClient, Prisma } from "@alter/db";
import { generateSuggestions } from "@alter/ai";
import { filterSuggestionsByAutonomy } from "@alter/domain";
import type { SuggestionsGeneratePayload } from "../types";
import { suggestionExecuteQueue } from "../queues";

const prisma = new PrismaClient();

export async function processSuggestionsGenerate(
  job: Job<SuggestionsGeneratePayload>
): Promise<void> {
  const { userId, mode } = job.data;

  await job.log(`Generating ${mode} suggestions for user ${userId}`);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      personaCard: true,
      energyDrivers: true,
      goals: true,
      priorities: true,
      autonomySetting: true,
    },
  });

  if (!user.personaCard) {
    throw new Error("User has no persona card — complete onboarding first");
  }

  // Get calendar events for next 7 days
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: now, lte: weekFromNow },
    },
    orderBy: { startTime: "asc" },
  });

  const aiResult = await generateSuggestions({
    persona: {
      summary: user.personaCard.summary,
      communicationStyle: user.personaCard.communicationStyle,
      boundaryNotes: user.personaCard.boundaryNotes,
    },
    drivers: user.energyDrivers,
    goals: user.goals,
    priorities: user.priorities,
    calendarEvents,
    mode,
  });

  await job.log(`AI returned ${aiResult.suggestions.length} suggestions`);

  // Persist suggestions
  const created = await Promise.all(
    aiResult.suggestions.map((s) =>
      prisma.suggestion.create({
        data: {
          userId,
          mode: s.mode,
          title: s.title,
          description: s.description,
          reason: s.reason,
          status: "PENDING",
          autonomyLevelRequired: s.autonomyLevelRequired,
          actions: {
            create: {
              actionType: s.actionType,
              payload: s.actionPayload as Prisma.InputJsonValue,
            },
          },
        },
        include: { actions: true },
      })
    )
  );

  // Check for autonomous execution
  const autonomyLevel = user.autonomySetting?.level ?? "OBSERVER";
  const criteria = created.map((s) => ({
    title: s.title,
    description: s.description,
    reason: s.reason,
    mode: s.mode as "PERSONAL" | "PROFESSIONAL",
    autonomyLevelRequired: s.autonomyLevelRequired as
      | "OBSERVER"
      | "ADVISOR"
      | "COPILOT"
      | "AUTONOMOUS",
    priority: 5,
  }));

  const filtered = filterSuggestionsByAutonomy(
    criteria,
    autonomyLevel as "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS"
  );

  // Enqueue auto-execution for autonomous suggestions
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i].presentation === "notification") {
      await suggestionExecuteQueue.add("execute", {
        suggestionId: created[i].id,
      });
    }
  }

  await job.log(
    `Persisted ${created.length} suggestions, ` +
      `${filtered.filter((f) => f.presentation === "notification").length} queued for auto-execution`
  );
}
