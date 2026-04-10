import { z } from "zod";

export const createCalendarEventSchema = z.object({
  title: z.string().min(1).max(200),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  isDrainer: z.boolean().default(false),
  isBooster: z.boolean().default(false),
  source: z.string().default("manual"),
});

export type CreateCalendarEventInput = z.infer<
  typeof createCalendarEventSchema
>;

export const bulkCreateCalendarEventsSchema = z.object({
  events: z.array(createCalendarEventSchema),
});

export type BulkCreateCalendarEventsInput = z.infer<
  typeof bulkCreateCalendarEventsSchema
>;
