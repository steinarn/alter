import { PrismaClient } from "@alter/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { DevProfileSwitcher } from "@/components/dashboard/dev-profile-switcher";
import { ProfileBrief } from "@/components/dashboard/profile-brief";
import {
  MOCK_PROFILE_COOKIE,
  getMockProfile,
  getMockProfileSummaries,
  isMockProfilesEnabled,
} from "@/mock/personas";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const mockProfilesEnabled = isMockProfilesEnabled();
  const cookieStore = await cookies();
  const activeMockProfile = mockProfilesEnabled
    ? getMockProfile(cookieStore.get(MOCK_PROFILE_COOKIE)?.value)
    : null;
  const mockProfileSummaries = mockProfilesEnabled ? getMockProfileSummaries() : [];

  // MVP: single-user demo mode — get the first user
  const user = activeMockProfile
    ? {
        name: activeMockProfile.user.name,
        id: activeMockProfile.user.id,
        personaCard: activeMockProfile.personaCard,
        energyDrivers: activeMockProfile.energyDrivers,
        goals: activeMockProfile.goals,
        autonomySetting: activeMockProfile.autonomySetting,
      }
    : await prisma.user.findFirst({
        include: {
          personaCard: true,
          energyDrivers: true,
          goals: true,
          autonomySetting: true,
        },
      });

  const header = (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {activeMockProfile
            ? `Showing the ${activeMockProfile.label} demo profile.`
            : "Your life at a glance — energy, balance, and suggestions."}
        </p>
      </div>
      {mockProfilesEnabled && (
        <div className="xl:w-[30rem]">
          <DevProfileSwitcher
            profiles={mockProfileSummaries}
            activeProfileId={activeMockProfile?.id ?? null}
          />
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        {mockProfilesEnabled && (
          <div className="w-full max-w-5xl px-6 pb-2 text-left">
            {header}
          </div>
        )}
        <Sparkles className="size-10 text-muted-foreground/40" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            No user found. Run the seed script or complete onboarding.
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding">Start onboarding</Link>
        </Button>
      </div>
    );
  }

  if (!user.personaCard?.confirmedAt) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Sparkles className="size-10 text-muted-foreground/40" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Complete onboarding to see your life dashboard.
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding">Continue onboarding</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <ProfileBrief
        name={user.name}
        archetype={activeMockProfile?.label ?? null}
        summary={user.personaCard.summary}
        communicationStyle={user.personaCard.communicationStyle}
        boundaryNotes={user.personaCard.boundaryNotes}
        autonomyLevel={user.autonomySetting?.level ?? "OBSERVER"}
        energizer={
          user.energyDrivers.find(
            (driver: { driverType: string; label: string }) =>
              driver.driverType === "ENERGIZER"
          )
            ?.label ?? null
        }
        drainer={
          user.energyDrivers.find(
            (driver: { driverType: string; label: string }) =>
              driver.driverType === "DRAINER"
          )
            ?.label ?? null
        }
        goals={user.goals
          .slice(0, 3)
          .map((goal: { title: string }) => goal.title)}
      />
      <DashboardShell userId={user.id} />
    </div>
  );
}
