import { NextRequest, NextResponse } from "next/server";
import { parsePersonaResponse } from "@alter/ai";
import { PrismaClient } from "@alter/db";
import { generatePersonaSchema } from "@/lib/schemas/onboarding-schemas";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = generatePersonaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { conversationHistory } = parsed.data;

  const persona = await parsePersonaResponse(conversationHistory);

  // Persist to database
  const user = await prisma.user.findFirst();
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 404 });
  }

  // Upsert persona card
  await prisma.personaCard.upsert({
    where: { userId: user.id },
    update: {
      summary: persona.summary,
      communicationStyle: persona.communicationStyle,
      boundaryNotes: persona.boundaryNotes,
      confirmedAt: null,
    },
    create: {
      userId: user.id,
      summary: persona.summary,
      communicationStyle: persona.communicationStyle,
      boundaryNotes: persona.boundaryNotes,
    },
  });

  // Upsert energy drivers
  await prisma.energyDriver.deleteMany({ where: { userId: user.id } });
  for (const driver of persona.energyDrivers) {
    await prisma.energyDriver.create({
      data: {
        userId: user.id,
        label: driver.label,
        description: driver.description,
        driverType: driver.driverType,
      },
    });
  }

  // Upsert goals
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  for (const goal of persona.goals) {
    await prisma.goal.create({
      data: {
        userId: user.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
      },
    });
  }

  // Upsert priorities
  for (const priority of persona.priorities) {
    await prisma.priority.upsert({
      where: {
        userId_dimension: {
          userId: user.id,
          dimension: priority.dimension,
        },
      },
      update: { importance: priority.importance },
      create: {
        userId: user.id,
        dimension: priority.dimension,
        importance: priority.importance,
      },
    });
  }

  // Upsert autonomy setting
  await prisma.autonomySetting.upsert({
    where: { userId: user.id },
    update: { level: persona.suggestedAutonomyLevel },
    create: {
      userId: user.id,
      level: persona.suggestedAutonomyLevel,
    },
  });

  return NextResponse.json({ persona });
}
