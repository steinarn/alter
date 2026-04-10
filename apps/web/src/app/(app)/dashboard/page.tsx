import { PrismaClient } from "@alter/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // MVP: single-user demo mode — get the first user
  const user = await prisma.user.findFirst({
    include: { personaCard: true },
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your life at a glance — energy, balance, and suggestions.
        </p>
      </div>
      <DashboardShell userId={user.id} />
    </div>
  );
}
