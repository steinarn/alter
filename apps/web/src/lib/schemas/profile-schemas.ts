import { z } from "zod";

const driverTypeSchema = z.enum(["ENERGIZER", "DRAINER"]);
const goalCategorySchema = z.enum(["PROFESSIONAL", "PERSONAL"]);
const balanceDimensionSchema = z.enum(["WORK", "REST", "SOCIAL", "GROWTH"]);

export const createEnergyDriverSchema = z.object({
  label: z.string().min(1).max(200),
  description: z.string().min(1),
  driverType: driverTypeSchema,
});

export type CreateEnergyDriverInput = z.infer<typeof createEnergyDriverSchema>;

export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: goalCategorySchema,
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  category: goalCategorySchema.optional(),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export const setPrioritiesSchema = z.object({
  priorities: z.array(
    z.object({
      dimension: balanceDimensionSchema,
      importance: z.number().int().min(1).max(10),
      notes: z.string().optional(),
    })
  ),
});

export type SetPrioritiesInput = z.infer<typeof setPrioritiesSchema>;
