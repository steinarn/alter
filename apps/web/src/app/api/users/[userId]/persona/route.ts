import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { updatePersonaSchema } from "@/lib/schemas/user-schemas";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();
  const parsed = updatePersonaSchema.safeParse(body);

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

  const persona = await prisma.personaCard.upsert({
    where: { userId },
    update: {
      ...parsed.data,
      confirmedAt: null,
    },
    create: {
      userId,
      ...parsed.data,
    },
  });

  return NextResponse.json(persona);
}
