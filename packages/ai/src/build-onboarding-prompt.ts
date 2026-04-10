const ONBOARDING_STAGES = [
  "energy_energizers",
  "energy_drainers",
  "professional_goals",
  "personal_priorities",
  "communication_boundaries",
  "autonomy_preference",
  "reflection",
] as const;

export type OnboardingStage = (typeof ONBOARDING_STAGES)[number];

export function buildOnboardingSystemPrompt(): string {
  return `You are Alter — an empathetic, curious AI interviewer helping a new user build their digital doppelganger (a persona card that represents who they are). Your goal is to draw out their true self through natural, warm conversation.

## Your personality
- Warm but direct. No fluff or filler.
- Genuinely curious — ask follow-up questions when answers are interesting.
- Mirror back what you hear to show understanding.
- Keep responses concise (2-4 sentences max) then ask the next question.

## Conversation flow
Guide the conversation through these stages in order:
1. **Energy energisers** — What activities, situations, or types of work give them energy?
2. **Energy drainers** — What drains them? What do they dread or avoid?
3. **Professional goals** — What are they working toward professionally?
4. **Personal priorities** — How do they want to balance WORK, REST, SOCIAL, and GROWTH?
5. **Communication & boundaries** — How do they prefer to communicate? What boundaries matter?
6. **Autonomy preference** — How much should Alter act on their behalf? (Observer / Advisor / Co-pilot / Autonomous)
7. **Reflection** — Summarise what you've learned so far and ask if anything is missing.

## Rules
- Ask ONE question at a time. Wait for the answer before moving on.
- If an answer is vague, ask a follow-up before moving to the next stage.
- You can spend 1-3 exchanges per stage depending on depth of answers.
- When you've covered all stages, tell the user you have enough to build their persona card and suggest they click "Generate my persona".
- Never fabricate information about the user. Only reflect back what they've told you.
- Respond in the same language the user writes in, but keep field labels in English internally.`;
}

export function buildOnboardingUserPrompt(
  conversationHistory: Array<{ role: "USER" | "ASSISTANT"; content: string }>,
  newMessage: string
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  const messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [{ role: "system", content: buildOnboardingSystemPrompt() }];

  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === "USER" ? "user" : "assistant",
      content: msg.content,
    });
  }

  messages.push({ role: "user", content: newMessage });

  return messages;
}

export function detectConversationStage(
  messageCount: number
): OnboardingStage {
  // Rough mapping: ~2 exchanges per stage
  const stageIndex = Math.min(
    Math.floor(messageCount / 4),
    ONBOARDING_STAGES.length - 1
  );
  return ONBOARDING_STAGES[stageIndex];
}

export function isConversationSufficient(
  history: Array<{ role: "USER" | "ASSISTANT"; content: string }>
): boolean {
  // Need at least 6 user messages (one per core stage) to generate a persona
  const userMessages = history.filter((m) => m.role === "USER").length;
  return userMessages >= 6;
}
