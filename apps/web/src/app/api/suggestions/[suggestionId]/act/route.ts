import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { actOnSuggestionSchema } from "@/lib/schemas/suggestion-schemas";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ suggestionId: string }> }
) {
  const { suggestionId } = await params;
  const body = await request.json();
  const parsed = actOnSuggestionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
    include: { actions: true },
  });

  if (!suggestion) {
    return NextResponse.json(
      { error: "Suggestion not found" },
      { status: 404 }
    );
  }

  if (suggestion.status !== "ACCEPTED" && suggestion.status !== "PENDING") {
    return NextResponse.json(
      { error: "Suggestion cannot be acted upon in its current state" },
      { status: 409 }
    );
  }

  if (!parsed.data.confirm) {
    // User declined to act
    const updated = await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: "DECLINED" },
    });
    return NextResponse.json(updated);
  }

  // Mark as acted and create action record
  const [updated, action] = await prisma.$transaction([
    prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: "ACTED" },
    }),
    prisma.suggestionAction.create({
      data: {
        suggestionId,
        actionType: "executed",
        payload: {},
        executedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ suggestion: updated, action });
}
