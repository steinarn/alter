import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { createEnergyDriverSchema } from "@/lib/schemas/profile-schemas";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();
  const parsed = createEnergyDriverSchema.safeParse(body);

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

  const driver = await prisma.energyDriver.create({
    data: { userId, ...parsed.data },
  });

  return NextResponse.json(driver, { status: 201 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const drivers = await prisma.energyDriver.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(drivers);
}
