import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { createUserSchema } from "@/lib/schemas/user-schemas";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: parsed.data,
  });

  return NextResponse.json(user, { status: 201 });
}
