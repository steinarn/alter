import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const suggestionsQueue = new Queue<{
  userId: string;
  mode: "PERSONAL" | "PROFESSIONAL";
}>("suggestions", { connection });

export const suggestionExecuteQueue = new Queue<{
  suggestionId: string;
}>("suggestion-execute", { connection });
