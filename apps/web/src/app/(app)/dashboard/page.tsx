import { PrismaClient } from "@alter/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // MVP: single-user demo mode — get the first user
  const user = await prisma.user.findFirst();

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            No user found. Run the seed script first.
          </p>
        </div>
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
