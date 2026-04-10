import { PrismaClient } from "@alter/db";
import { cookies } from "next/headers";
import { SuggestionsList } from "@/components/dashboard/suggestions-list";
import { DevProfileSwitcher } from "@/components/dashboard/dev-profile-switcher";
import {
  MOCK_PROFILE_COOKIE,
  getMockProfile,
  getMockProfileSummaries,
  getMockSuggestions,
  isMockProfilesEnabled,
} from "@/mock/personas";

const prisma = new PrismaClient();

export default async function SuggestionsPage() {
  const mockProfilesEnabled = isMockProfilesEnabled();
  const cookieStore = await cookies();
  const activeMockProfile = mockProfilesEnabled
    ? getMockProfile(cookieStore.get(MOCK_PROFILE_COOKIE)?.value)
    : null;
  const mockProfileSummaries = mockProfilesEnabled ? getMockProfileSummaries() : [];

  const user = activeMockProfile
    ? {
        id: activeMockProfile.user.id,
        autonomySetting: activeMockProfile.autonomySetting,
      }
    : await prisma.user.findFirst({
        include: { autonomySetting: true },
      });

  const header = (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Suggestions</h1>
        <p className="text-muted-foreground">
          {activeMockProfile
            ? `Showing suggestion history for the ${activeMockProfile.label} demo profile.`
            : "Personalised actions Alter recommends based on your energy and goals."}
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
      <div className="flex flex-col gap-6">
        {header}
        <p className="text-muted-foreground">
          No user found. Run the seed script first.
        </p>
      </div>
    );
  }

  const suggestions = activeMockProfile
    ? getMockSuggestions(activeMockProfile)
    : await prisma.suggestion.findMany({
        where: { userId: user.id },
        include: { actions: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

  return (
    <div className="flex flex-col gap-6">
      {header}
      <SuggestionsList
        suggestions={suggestions.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          reason: s.reason,
          mode: s.mode as "PERSONAL" | "PROFESSIONAL",
          status: s.status as "PENDING" | "ACCEPTED" | "DECLINED" | "ACTED",
          autonomyLevelRequired: s.autonomyLevelRequired,
          createdAt: s.createdAt.toISOString(),
          actions: s.actions.map((a) => ({
            actionType: a.actionType,
            executedAt: a.executedAt?.toISOString() ?? null,
          })),
        }))}
        userId={user.id}
      />
    </div>
  );
}
