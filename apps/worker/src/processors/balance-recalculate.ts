import type { Job } from "bullmq";
import { PrismaClient } from "@alter/db";
import { computeBalanceScores } from "@alter/domain";
import type { BalanceRecalculatePayload } from "../types";

const prisma = new PrismaClient();

export async function processBalanceRecalculate(
  job: Job<BalanceRecalculatePayload>
): Promise<void> {
  const { userId } = job.data;

  await job.log(`Recalculating balance scores for user ${userId}`);

  const priorities = await prisma.priority.findMany({ where: { userId } });

  // Get calendar events for the last 7 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: weekAgo, lte: now },
    },
    orderBy: { startTime: "asc" },
  });

  const balance = computeBalanceScores(calendarEvents, priorities);

  // Persist balance scores
  await Promise.all(
    balance.map((b) =>
      prisma.balanceScore.create({
        data: {
          userId,
          dimension: b.dimension,
          score: b.score,
          computedAt: now,
        },
      })
    )
  );

  await job.log(`Balance scores recalculated: ${balance.length} dimensions`);
}
