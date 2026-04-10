import Link from "next/link";
import { PrismaClient } from "@alter/db";
import { Sparkles } from "lucide-react";
import { PersonaConfirm } from "@/components/persona-confirm";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

export default async function ProfilePage() {
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
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Sparkles className="size-10 text-muted-foreground/40" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="mt-1 text-muted-foreground">
            No persona profile found yet. Complete onboarding to create one.
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding">Start onboarding</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PersonaConfirm
        mode="profile"
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
    </div>
  );
}
