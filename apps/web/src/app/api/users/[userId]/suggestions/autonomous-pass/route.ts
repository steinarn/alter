import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { enqueueAutonomousSuggestionsForUser } from "@/lib/autonomous-execution";

const prisma = new PrismaClient();

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { autonomySetting: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await enqueueAutonomousSuggestionsForUser(
    prisma,
    userId,
    user.autonomySetting as {
      level: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
      personalMode: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
      professionalMode: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
    } | null
  );

  return NextResponse.json(result);
}
