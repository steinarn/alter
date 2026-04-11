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

  let finalStatus: "ACTED" | "DECLINED" = "ACTED";
  let decisionComment = `Accepted because ${suggestion.reason}`;

  // Execute each action
  for (const action of suggestion.actions) {
    await job.log(
      `Executing action: ${action.actionType} (${JSON.stringify(action.payload)})`
    );

    try {
      switch (action.actionType) {
        case "SCHEDULE_EVENT": {
          const payload = action.payload as Record<string, string>;
          const startTime = getPayloadDate(payload, ["start", "startTime"]);
          const endTime = getPayloadDate(payload, ["end", "endTime"]);

          if (!startTime || !endTime) {
            await job.log("Missing or invalid schedule payload, declining suggestion");
            finalStatus = "DECLINED";
            decisionComment =
              "Declined because the schedule details were not concrete enough to act safely on your behalf.";
            break;
          }

          await prisma.calendarEvent.create({
            data: {
              userId: suggestion.userId,
              title: payload.title ?? suggestion.title,
              startTime,
              endTime,
              isDrainer: false,
              isBooster: true,
              source: "alter-autonomous",
            },
          });
          break;
        }

        case "BLOCK_TIME": {
          const payload = action.payload as Record<string, string>;
          const startTime = getPayloadDate(payload, ["start", "startTime"]);
          const endTime = getPayloadDate(payload, ["end", "endTime"]);

          if (!startTime || !endTime) {
            await job.log("Missing or invalid block payload, declining suggestion");
            finalStatus = "DECLINED";
            decisionComment =
              "Declined because the time block details were not concrete enough to protect your time safely.";
            break;
          }

          await prisma.calendarEvent.create({
            data: {
              userId: suggestion.userId,
              title: payload.title ?? `Focus: ${suggestion.title}`,
              startTime,
              endTime,
              isDrainer: false,
              isBooster: true,
              source: "alter-autonomous",
            },
          });
          break;
        }

        case "SUGGEST_ACTIVITY":
          // No calendar action — just mark as acted
          decisionComment = `Accepted because ${suggestion.reason}`;
          break;

        case "DECLINE_MEETING":
          // In MVP, we log the intent but can't actually decline
          await job.log(
            `Would decline meeting: ${JSON.stringify(action.payload)}`
          );
          finalStatus = "ACTED";
          decisionComment =
            "Accepted because protecting your focus and boundaries fits the profile Alter is using for you.";
          break;

        default:
          await job.log(`Unknown action type: ${action.actionType}`);
          finalStatus = "DECLINED";
          decisionComment =
            "Declined because the action type was not safe for Alter to execute automatically.";
      }
    } catch (error) {
      finalStatus = "DECLINED";
      decisionComment =
        "Declined because Alter could not execute it safely with the details available.";
      await job.log(
        `Execution failed for ${action.actionType}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Mark action as executed
    await prisma.suggestionAction.update({
      where: { id: action.id },
      data: {
        executedAt: new Date(),
        payload: mergeDecisionMetadata(action.payload, {
          decisionComment,
          decisionOutcome: finalStatus === "ACTED" ? "ACCEPTED" : "DECLINED",
        }),
      },
    });
  }

  // Mark suggestion as acted
  await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status: finalStatus },
  });

  await job.log("Suggestion execution complete");
}

function getPayloadDate(
  payload: Record<string, string>,
  keys: string[]
): Date | null {
  const raw = keys.map((key) => payload[key]).find(Boolean);

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  return Number.isNaN(date.getTime()) ? null : date;
}

function mergeDecisionMetadata(
  payload: unknown,
  decision: { decisionComment: string; decisionOutcome: "ACCEPTED" | "DECLINED" }
) {
  const base =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  return {
    ...base,
    ...decision,
  };
}
