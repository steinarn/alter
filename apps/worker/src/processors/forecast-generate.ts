import type { Job } from "bullmq";
import { PrismaClient } from "@alter/db";
import { generateEnergyForecast } from "@alter/ai";
import type { ForecastGeneratePayload } from "../types";

const prisma = new PrismaClient();

export async function processForecastGenerate(
  job: Job<ForecastGeneratePayload>
): Promise<void> {
  const { userId, startDate, endDate } = job.data;

  await job.log(`Generating energy forecast for user ${userId}`);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { energyDrivers: true },
  });

  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      userId,
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: { startTime: "asc" },
  });

  // Build day strings
  const days: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split("T")[0]);
  }

  const aiResult = await generateEnergyForecast({
    drivers: user.energyDrivers,
    calendarEvents,
    days,
  });

  await job.log(`AI returned ${aiResult.forecast.length} day forecasts`);

  // Persist forecasts (upsert to avoid duplicates)
  await Promise.all(
    aiResult.forecast.map((f) =>
      prisma.energyForecast.create({
        data: {
          userId,
          date: new Date(f.date + "T00:00:00Z"),
          predictedLevel: f.predictedLevel,
          reason: f.reason,
        },
      })
    )
  );

  await job.log("Forecast generation complete");
}
