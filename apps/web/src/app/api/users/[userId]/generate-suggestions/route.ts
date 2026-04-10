import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@alter/db";
import { generateSuggestions } from "@alter/ai";
import { z } from "zod";
import {
  generateMockSuggestions,
  getMockProfileByUserId,
} from "@/mock/personas";

const prisma = new PrismaClient();

const requestSchema = z.object({
  mode: z.enum(["PERSONAL", "PROFESSIONAL"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const mockProfile = getMockProfileByUserId(userId);

  if (mockProfile) {
    const suggestions = generateMockSuggestions(mockProfile, parsed.data.mode);
    return NextResponse.json({
      generated: suggestions.length,
      suggestions,
      autonomyLevel: mockProfile.autonomySetting.level,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personaCard: true,
      energyDrivers: true,
      goals: true,
      priorities: true,
      autonomySetting: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.personaCard) {
    return NextResponse.json(
      { error: "Persona card required. Complete onboarding first." },
      { status: 400 }
    );
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
    mode: parsed.data.mode,
  });

  // Persist suggestions
  const autonomyLevel = user.autonomySetting?.level ?? "OBSERVER";

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

  return NextResponse.json({
    generated: created.length,
    suggestions: created,
    autonomyLevel,
  });
}
