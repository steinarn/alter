import { NextRequest } from "next/server";
import { streamText } from "ai";
import { model } from "@alter/ai";
import { PrismaClient } from "@alter/db";
import { buildGuidePrompt } from "@/lib/build-guide-prompt";
import { getMockProfile, isMockProfilesEnabled } from "@/mock/personas";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { messages: incomingMessages, userId } = await request.json();

  // Resolve user data — support mock profiles
  const mockProfilesEnabled = isMockProfilesEnabled();
  let userData;

  if (mockProfilesEnabled && userId.startsWith("mock-")) {
    // Find the mock profile by checking all profiles
    const profile = getMockProfile(userId.replace("mock-", ""));
    if (profile) {
      userData = {
        name: profile.user.name,
        persona: profile.personaCard,
        drivers: profile.energyDrivers,
        goals: profile.goals,
        priorities: profile.priorities,
        calendarEvents: profile.calendarEvents,
      };
    }
  }

  if (!userData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        personaCard: true,
        energyDrivers: true,
        goals: true,
        priorities: true,
        calendarEvents: true,
      },
    });

    if (!user || !user.personaCard) {
      return new Response("User not found", { status: 404 });
    }

    userData = {
      name: user.name,
      persona: user.personaCard,
      drivers: user.energyDrivers,
      goals: user.goals,
      priorities: user.priorities,
      calendarEvents: user.calendarEvents,
    };
  }

  const systemPrompt = buildGuidePrompt({
    userName: userData.name,
    persona: userData.persona,
    drivers: userData.drivers,
    goals: userData.goals,
    priorities: userData.priorities,
    calendarEvents: userData.calendarEvents,
  });

  const messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [{ role: "system", content: systemPrompt }];

  for (const msg of incomingMessages) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  const result = streamText({
    model,
    messages,
  });

  return result.toDataStreamResponse();
}
