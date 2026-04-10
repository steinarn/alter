import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { updateSuggestionSchema } from "@/lib/schemas/suggestion-schemas";
import {
  findMockSuggestionById,
  isMockSuggestionId,
} from "@/mock/personas";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ suggestionId: string }> }
) {
  const { suggestionId } = await params;
  const body = await request.json();
  const parsed = updateSuggestionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (isMockSuggestionId(suggestionId)) {
    const existing = findMockSuggestionById(suggestionId);
    return NextResponse.json({
      ...(existing ?? { id: suggestionId }),
      status: parsed.data.status,
    });
  }

  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion) {
    return NextResponse.json(
      { error: "Suggestion not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ suggestionId: string }> }
) {
  const { suggestionId } = await params;

  if (isMockSuggestionId(suggestionId)) {
    const suggestion = findMockSuggestionById(suggestionId);
    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(suggestion);
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

  return NextResponse.json(suggestion);
}
