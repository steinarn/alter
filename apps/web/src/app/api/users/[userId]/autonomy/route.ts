import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { updateAutonomySchema } from "@/lib/schemas/autonomy-schemas";

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

  const setting = await prisma.autonomySetting.upsert({
    where: { userId },
    update: parsed.data,
    create: {
      userId,
      level: parsed.data.level ?? "OBSERVER",
      personalMode: parsed.data.personalMode ?? "OBSERVER",
      professionalMode: parsed.data.professionalMode ?? "OBSERVER",
    },
  });

  return NextResponse.json(setting);
}
