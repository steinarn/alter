import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { getAutonomyLevelForMode } from "@alter/domain";
import { z } from "zod";
import {
  generateMockSuggestions,
  getMockProfileByUserId,
} from "@/mock/personas";
import { suggestionsQueue } from "@/lib/queues";

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

  const autonomyLevel = getAutonomyLevelForMode(
    user.autonomySetting,
    parsed.data.mode
  );

  const job = await suggestionsQueue.add("generate", {
    userId,
    mode: parsed.data.mode,
  });

  return NextResponse.json({
    queued: true,
    jobId: job.id,
    startedAt: new Date().toISOString(),
    autonomyLevel,
  });
}
