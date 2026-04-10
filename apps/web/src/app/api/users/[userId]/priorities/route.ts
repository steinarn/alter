import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { setPrioritiesSchema } from "@/lib/schemas/profile-schemas";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();
  const parsed = setPrioritiesSchema.safeParse(body);

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

  const results = [];
  for (const p of parsed.data.priorities) {
    const priority = await prisma.priority.upsert({
      where: { userId_dimension: { userId, dimension: p.dimension } },
      update: { importance: p.importance, notes: p.notes ?? null },
      create: {
        userId,
        dimension: p.dimension,
        importance: p.importance,
        notes: p.notes ?? null,
      },
    });
    results.push(priority);
  }

  return NextResponse.json(results);
}
