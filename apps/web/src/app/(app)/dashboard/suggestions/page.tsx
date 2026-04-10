import { PrismaClient } from "@alter/db";
import { SuggestionsList } from "@/components/dashboard/suggestions-list";

const prisma = new PrismaClient();

export default async function SuggestionsPage() {
  const user = await prisma.user.findFirst({
    include: { autonomySetting: true },
  });

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suggestions</h1>
          <p className="text-muted-foreground">
            No user found. Run the seed script first.
          </p>
        </div>
      </div>
    );
  }

  const suggestions = await prisma.suggestion.findMany({
    where: { userId: user.id },
    include: { actions: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Suggestions</h1>
        <p className="text-muted-foreground">
          Personalised actions Alter recommends based on your energy and goals.
        </p>
      </div>
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
