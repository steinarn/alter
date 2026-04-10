import { PrismaClient } from "@alter/db";
import { AutonomySettings } from "@/components/autonomy/autonomy-settings";

const prisma = new PrismaClient();

export default async function SettingsPage() {
  const user = await prisma.user.findFirst({
    include: { autonomySetting: true },
  });

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            No user found. Run the seed script first.
          </p>
        </div>
      </div>
    );
  }

  const initial = user.autonomySetting
    ? {
        level: user.autonomySetting.level as "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS",
        personalMode: user.autonomySetting.personalMode as "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS",
        professionalMode: user.autonomySetting.professionalMode as "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS",
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Adjust your autonomy level, priorities, and profile.
        </p>
      </div>
      <AutonomySettings userId={user.id} initial={initial} />
    </div>
  );
}
