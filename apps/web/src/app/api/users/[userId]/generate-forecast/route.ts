import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { generateEnergyForecast } from "@alter/ai";

const prisma = new PrismaClient();

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { energyDrivers: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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

  // Build day strings for the next 7 days
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().split("T")[0]);
  }

  const aiResult = await generateEnergyForecast({
    drivers: user.energyDrivers,
    calendarEvents,
    days,
  });

  // Persist forecasts
  const created = await Promise.all(
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

  return NextResponse.json({
    generated: created.length,
    forecast: created,
  });
}
