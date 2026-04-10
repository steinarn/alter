import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@alter/db";
import { bulkCreateCalendarEventsSchema } from "@/lib/schemas/calendar-schemas";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();
  const parsed = bulkCreateCalendarEventsSchema.safeParse(body);

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

  const events = await prisma.calendarEvent.createMany({
    data: parsed.data.events.map((e) => ({
      userId,
      title: e.title,
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
      isDrainer: e.isDrainer,
      isBooster: e.isBooster,
      source: e.source,
    })),
  });

  return NextResponse.json({ created: events.count }, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { userId };
  if (from || to) {
    where.startTime = {};
    if (from) (where.startTime as Record<string, Date>).gte = new Date(from);
    if (to) (where.startTime as Record<string, Date>).lte = new Date(to);
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(events);
}
