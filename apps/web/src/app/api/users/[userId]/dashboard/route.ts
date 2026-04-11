import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import {
  computeEnergyForecast,
  computeBalanceScores,
  detectConflicts,
  generateSuggestionCriteria,
  filterSuggestionsByAutonomy,
  getAutonomyLevelForMode,
} from "@alter/domain";
import { buildMockDashboardData, getMockProfileByUserId } from "@/mock/personas";

const prisma = new PrismaClient();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const mockProfile = getMockProfileByUserId(userId);

  if (mockProfile) {
    return NextResponse.json(buildMockDashboardData(mockProfile));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      energyDrivers: true,
      goals: true,
      priorities: true,
      autonomySetting: true,
    },
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

  // Run domain functions
  const forecast = computeEnergyForecast(calendarEvents, user.energyDrivers, days);
  const balance = computeBalanceScores(calendarEvents, user.priorities);
  const conflicts = detectConflicts(calendarEvents);
  const criteria = generateSuggestionCriteria(
    forecast,
    balance,
    conflicts,
    user.goals
  );

  const personalSuggestions = filterSuggestionsByAutonomy(
    criteria.filter((suggestion) => suggestion.mode === "PERSONAL"),
    getAutonomyLevelForMode(user.autonomySetting, "PERSONAL")
  );
  const professionalSuggestions = filterSuggestionsByAutonomy(
    criteria.filter((suggestion) => suggestion.mode === "PROFESSIONAL"),
    getAutonomyLevelForMode(user.autonomySetting, "PROFESSIONAL")
  );
  const suggestions = [...personalSuggestions, ...professionalSuggestions].sort(
    (a, b) => b.priority - a.priority
  );

  // Fetch persisted suggestions for this user
  const persistedSuggestions = await prisma.suggestion.findMany({
    where: { userId },
    include: { actions: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    forecast,
    balance,
    conflicts,
    suggestions,
    persistedSuggestions,
    calendarEvents,
    autonomy: user.autonomySetting,
  });
}
