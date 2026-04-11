import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { deriveOverallAutonomyLevel } from "@alter/domain";
import { updateAutonomySchema } from "@/lib/schemas/autonomy-schemas";
import { enqueueAutonomousSuggestionsForUser } from "@/lib/autonomous-execution";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();
  const parsed = updateAutonomySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.autonomySetting.findUnique({
    where: { userId },
  });

  const nextPersonalMode =
    parsed.data.level ??
    parsed.data.personalMode ??
    existing?.personalMode ??
    "OBSERVER";
  const nextProfessionalMode =
    parsed.data.level ??
    parsed.data.professionalMode ??
    existing?.professionalMode ??
    "OBSERVER";
  const nextLevel =
    parsed.data.level ??
    deriveOverallAutonomyLevel(nextPersonalMode, nextProfessionalMode);

  const setting = await prisma.autonomySetting.upsert({
    where: { userId },
    update: {
      level: nextLevel,
      personalMode: nextPersonalMode,
      professionalMode: nextProfessionalMode,
    },
    create: {
      userId,
      level: nextLevel,
      personalMode: nextPersonalMode,
      professionalMode: nextProfessionalMode,
    },
  });

  const autonomousPass = await enqueueAutonomousSuggestionsForUser(
    prisma,
    userId,
    setting as {
      level: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
      personalMode: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
      professionalMode: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
    }
  );

  return NextResponse.json({
    ...setting,
    autonomousPass,
  });
}
