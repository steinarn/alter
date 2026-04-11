import type { PrismaClient } from "@alter/db";
import { getAutonomyLevelForMode } from "@alter/domain";
import { suggestionExecuteQueue } from "@/lib/queues";

export async function enqueueAutonomousSuggestionsForUser(
  prisma: PrismaClient,
  userId: string,
  autonomySetting?: {
    level: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
    personalMode: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
    professionalMode: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
  } | null
) {
  const setting =
    autonomySetting ??
    (await prisma.autonomySetting.findUnique({
      where: { userId },
    }));

  if (!setting) {
    return { queued: 0, suggestionIds: [] as string[] };
  }

  const autonomousModes = (["PERSONAL", "PROFESSIONAL"] as const).filter(
    (mode) => getAutonomyLevelForMode(setting, mode) === "AUTONOMOUS"
  );

  if (autonomousModes.length === 0) {
    return { queued: 0, suggestionIds: [] as string[] };
  }

  const suggestions = await prisma.suggestion.findMany({
    where: {
      userId,
      status: "PENDING",
      mode: { in: autonomousModes },
    },
    orderBy: { createdAt: "asc" },
  });

  const suggestionIds: string[] = [];

  for (const suggestion of suggestions) {
    const jobId = `execute-${suggestion.id}`;
    const existing = await suggestionExecuteQueue.getJob(jobId);

    if (existing) {
      const state = await existing.getState();

      if (state !== "completed" && state !== "failed") {
        continue;
      }

      await existing.remove();
    }

    await suggestionExecuteQueue.add(
      "execute",
      { suggestionId: suggestion.id },
      { jobId }
    );
    suggestionIds.push(suggestion.id);
  }

  return { queued: suggestionIds.length, suggestionIds };
}
