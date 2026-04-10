import { PrismaClient } from "@alter/db";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { RoomLoading } from "@/components/room/room-loading";
import {
  MOCK_PROFILE_COOKIE,
  getMockProfile,
  isMockProfilesEnabled,
} from "@/mock/personas";

const RoomScene = dynamic(
  () => import("@/components/room/room-scene").then((m) => m.RoomScene),
  {
    ssr: false,
    loading: () => <RoomLoading />,
  }
);

const prisma = new PrismaClient();

export default async function RoomPage() {
  const mockProfilesEnabled = isMockProfilesEnabled();
  const cookieStore = await cookies();
  const activeMockProfile = mockProfilesEnabled
    ? getMockProfile(cookieStore.get(MOCK_PROFILE_COOKIE)?.value)
    : null;

  const user = activeMockProfile
    ? {
        id: activeMockProfile.user.id,
        name: activeMockProfile.user.name,
        personaCard: activeMockProfile.personaCard,
      }
    : await prisma.user.findFirst({
        include: { personaCard: true },
      });

  if (!user || !user.personaCard?.confirmedAt) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <Sparkles className="size-10 text-muted-foreground/40" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room</h1>
          <p className="mt-1 text-muted-foreground">
            Complete onboarding to enter the room.
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding">Start onboarding</Link>
        </Button>
      </div>
    );
  }

  return <RoomScene userName={user.name} userId={user.id} />;
}
