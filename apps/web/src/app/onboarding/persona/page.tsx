import { PrismaClient } from "@alter/db";
import { PersonaConfirm } from "@/components/persona-confirm";

const prisma = new PrismaClient();

export default async function PersonaPage() {
  const user = await prisma.user.findFirst({
    include: {
      personaCard: true,
      energyDrivers: true,
      goals: true,
      priorities: true,
      autonomySetting: true,
    },
  });

  if (!user?.personaCard) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-muted-foreground">
          No persona generated yet. Complete the onboarding conversation first.
        </p>
      </main>
    );
  }

  return (
    <PersonaConfirm
      persona={{
        summary: user.personaCard.summary,
        communicationStyle: user.personaCard.communicationStyle,
        boundaryNotes: user.personaCard.boundaryNotes,
        confirmed: !!user.personaCard.confirmedAt,
      }}
      energyDrivers={user.energyDrivers.map((d) => ({
        label: d.label,
        description: d.description,
        driverType: d.driverType as "ENERGIZER" | "DRAINER",
      }))}
      goals={user.goals.map((g) => ({
        title: g.title,
        description: g.description,
        category: g.category as "PROFESSIONAL" | "PERSONAL",
      }))}
      priorities={user.priorities.map((p) => ({
        dimension: p.dimension as "WORK" | "REST" | "SOCIAL" | "GROWTH",
        importance: p.importance,
      }))}
      autonomyLevel={
        (user.autonomySetting?.level as
          | "OBSERVER"
          | "ADVISOR"
          | "COPILOT"
          | "AUTONOMOUS") ?? "ADVISOR"
      }
    />
  );
}
