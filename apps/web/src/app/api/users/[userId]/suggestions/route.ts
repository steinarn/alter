import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { z } from "zod";
import {
  getMockProfileByUserId,
  getMockSuggestions,
} from "@/mock/personas";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const revalidate = 0;

const querySchema = z.object({
  mode: z.enum(["PERSONAL", "PROFESSIONAL"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const parsed = querySchema.safeParse({
    mode: request.nextUrl.searchParams.get("mode") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const mockProfile = getMockProfileByUserId(userId);

  if (mockProfile) {
    const suggestions = getMockSuggestions(mockProfile).filter((suggestion) =>
      parsed.data.mode ? suggestion.mode === parsed.data.mode : true
    );
    return NextResponse.json({ suggestions });
  }

  const suggestions = await prisma.suggestion.findMany({
    where: {
      userId,
      ...(parsed.data.mode ? { mode: parsed.data.mode } : {}),
    },
    include: { actions: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ suggestions });
}
