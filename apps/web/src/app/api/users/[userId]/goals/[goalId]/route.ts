import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { updateGoalSchema } from "@/lib/schemas/profile-schemas";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; goalId: string }> }
) {
  const { userId, goalId } = await params;
  const body = await request.json();
  const parsed = updateGoalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string; goalId: string }> }
) {
  const { userId, goalId } = await params;

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  await prisma.goal.delete({ where: { id: goalId } });

  return NextResponse.json({ deleted: true });
}
