import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updatePersonaSchema = z.object({
  summary: z.string().min(1),
  communicationStyle: z.string().min(1),
  boundaryNotes: z.string().min(1),
});

export type UpdatePersonaInput = z.infer<typeof updatePersonaSchema>;
