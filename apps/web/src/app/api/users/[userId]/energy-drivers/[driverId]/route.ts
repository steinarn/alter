import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";

const prisma = new PrismaClient();

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string; driverId: string }> }
) {
  const { userId, driverId } = await params;

  const driver = await prisma.energyDriver.findFirst({
    where: { id: driverId, userId },
  });

  if (!driver) {
    return NextResponse.json(
      { error: "Energy driver not found" },
      { status: 404 }
    );
  }

  await prisma.energyDriver.delete({ where: { id: driverId } });

  return NextResponse.json({ deleted: true });
}
