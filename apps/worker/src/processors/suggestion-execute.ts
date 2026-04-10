import type { Job } from "bullmq";
import { PrismaClient } from "@alter/db";
import type { SuggestionExecutePayload } from "../types";

const prisma = new PrismaClient();

export async function processSuggestionExecute(
  job: Job<SuggestionExecutePayload>
): Promise<void> {
  const { suggestionId } = job.data;

  await job.log(`Executing suggestion ${suggestionId}`);

  const suggestion = await prisma.suggestion.findUniqueOrThrow({
    where: { id: suggestionId },
    include: { actions: true },
  });

  if (suggestion.status !== "PENDING") {
    await job.log(
      `Suggestion already ${suggestion.status}, skipping execution`
    );
    return;
  }

  // Execute each action
  for (const action of suggestion.actions) {
    await job.log(
      `Executing action: ${action.actionType} (${JSON.stringify(action.payload)})`
    );

    switch (action.actionType) {
      case "SCHEDULE_EVENT": {
        const payload = action.payload as Record<string, string>;
        await prisma.calendarEvent.create({
          data: {
            userId: suggestion.userId,
            title: payload.title ?? suggestion.title,
            startTime: new Date(payload.start),
            endTime: new Date(payload.end),
            isDrainer: false,
            isBooster: true,
            source: "alter-autonomous",
          },
        });
        break;
      }

      case "BLOCK_TIME": {
        const payload = action.payload as Record<string, string>;
        await prisma.calendarEvent.create({
          data: {
            userId: suggestion.userId,
            title: payload.title ?? `Focus: ${suggestion.title}`,
            startTime: new Date(payload.start),
            endTime: new Date(payload.end),
            isDrainer: false,
            isBooster: true,
            source: "alter-autonomous",
          },
        });
        break;
      }

      case "SUGGEST_ACTIVITY":
        // No calendar action — just mark as acted
        break;

      case "DECLINE_MEETING":
        // In MVP, we log the intent but can't actually decline
        await job.log(
          `Would decline meeting: ${JSON.stringify(action.payload)}`
        );
        break;

      default:
        await job.log(`Unknown action type: ${action.actionType}`);
    }

    // Mark action as executed
    await prisma.suggestionAction.update({
      where: { id: action.id },
      data: { executedAt: new Date() },
    });
  }

  // Mark suggestion as acted
  await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status: "ACTED" },
  });

  await job.log("Suggestion execution complete");
}
