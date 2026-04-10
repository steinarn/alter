import { NextRequest } from "next/server";
import { streamText } from "ai";
import { model, buildOnboardingSystemPrompt } from "@alter/ai";
import { PrismaClient } from "@alter/db";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { messages: incomingMessages } = await request.json();

  // Build messages with system prompt
  const messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [{ role: "system", content: buildOnboardingSystemPrompt() }];

  for (const msg of incomingMessages) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  // Persist the latest user message
  const lastUserMsg = incomingMessages
    .filter((m: { role: string }) => m.role === "user")
    .pop();

  if (lastUserMsg) {
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.onboardingConversation.create({
        data: {
          userId: user.id,
          role: "USER",
          content: lastUserMsg.content,
          stepIndex: incomingMessages.filter(
            (m: { role: string }) => m.role === "user"
          ).length - 1,
        },
      });
    }
  }

  const result = streamText({
    model,
    messages,
  });

  return result.toDataStreamResponse();
}
