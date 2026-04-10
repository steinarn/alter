import type { Job } from "bullmq";
import { PrismaClient } from "@alter/db";
import { parsePersonaResponse } from "@alter/ai";
import type { PersonaGeneratePayload } from "../types";

const prisma = new PrismaClient();

export async function processPersonaGenerate(
  job: Job<PersonaGeneratePayload>
): Promise<void> {
  const { userId, conversationHistory } = job.data;

  await job.log(`Generating persona for user ${userId}`);

  const persona = await parsePersonaResponse(conversationHistory);

  await prisma.personaCard.upsert({
    where: { userId },
    update: {
      summary: persona.summary,
      communicationStyle: persona.communicationStyle,
      boundaryNotes: persona.boundaryNotes,
      confirmedAt: null,
    },
    create: {
      userId,
      summary: persona.summary,
      communicationStyle: persona.communicationStyle,
      boundaryNotes: persona.boundaryNotes,
    },
  });

  // Persist energy drivers
  if (persona.energyDrivers.length > 0) {
    await prisma.energyDriver.deleteMany({ where: { userId } });
    await prisma.energyDriver.createMany({
      data: persona.energyDrivers.map((d) => ({
        userId,
        label: d.label,
        description: d.description,
        driverType: d.driverType,
      })),
    });
  }

  // Persist goals
  if (persona.goals.length > 0) {
    await prisma.goal.deleteMany({ where: { userId } });
    await prisma.goal.createMany({
      data: persona.goals.map((g) => ({
        userId,
        title: g.title,
        description: g.description,
        category: g.category,
      })),
    });
  }

  // Persist priorities
  if (persona.priorities.length > 0) {
    await prisma.priority.deleteMany({ where: { userId } });
    await prisma.priority.createMany({
      data: persona.priorities.map((p) => ({
        userId,
        dimension: p.dimension,
        importance: p.importance,
        notes: null,
      })),
    });
  }

  // Set suggested autonomy level
  if (persona.suggestedAutonomyLevel) {
    await prisma.autonomySetting.upsert({
      where: { userId },
      update: { level: persona.suggestedAutonomyLevel },
      create: {
        userId,
        level: persona.suggestedAutonomyLevel,
        personalMode: persona.suggestedAutonomyLevel,
        professionalMode: persona.suggestedAutonomyLevel,
      },
    });
  }

  await job.log("Persona generation complete");
}
