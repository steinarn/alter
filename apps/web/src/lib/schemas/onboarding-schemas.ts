import { z } from "zod";

export const onboardingChatSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(
    z.object({
      role: z.enum(["USER", "ASSISTANT"]),
      content: z.string(),
    })
  ),
});

export type OnboardingChatInput = z.infer<typeof onboardingChatSchema>;

export const generatePersonaSchema = z.object({
  conversationHistory: z.array(
    z.object({
      role: z.enum(["USER", "ASSISTANT"]),
      content: z.string(),
    })
  ),
});

export type GeneratePersonaInput = z.infer<typeof generatePersonaSchema>;
