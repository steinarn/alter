import { NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";

const prisma = new PrismaClient();

export async function POST() {
  const user = await prisma.user.findFirst();
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 404 });
  }

  await prisma.personaCard.update({
    where: { userId: user.id },
    data: { confirmedAt: new Date() },
  });

  return NextResponse.json({ confirmed: true });
}
