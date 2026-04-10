import { Worker } from "bullmq";
import { QUEUE_NAMES } from "./queues";
import { processPersonaGenerate } from "./processors/persona-generate";
import { processSuggestionsGenerate } from "./processors/suggestions-generate";
import { processForecastGenerate } from "./processors/forecast-generate";
import { processBalanceRecalculate } from "./processors/balance-recalculate";
import { processSuggestionExecute } from "./processors/suggestion-execute";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

console.log("🔧 Alter worker starting...");

const personaWorker = new Worker(
  QUEUE_NAMES.PERSONA,
  async (job) => {
    console.log(`[persona] Processing job ${job.id}`);
    await processPersonaGenerate(job);
    console.log(`[persona] Job ${job.id} complete`);
  },
  { connection, concurrency: 1 }
);

const suggestionsWorker = new Worker(
  QUEUE_NAMES.SUGGESTIONS,
  async (job) => {
    console.log(`[suggestions] Processing job ${job.id}`);
    await processSuggestionsGenerate(job);
    console.log(`[suggestions] Job ${job.id} complete`);
  },
  { connection, concurrency: 2 }
);

const forecastWorker = new Worker(
  QUEUE_NAMES.FORECAST,
  async (job) => {
    console.log(`[forecast] Processing job ${job.id}`);
    await processForecastGenerate(job);
    console.log(`[forecast] Job ${job.id} complete`);
  },
  { connection, concurrency: 2 }
);

const balanceWorker = new Worker(
  QUEUE_NAMES.BALANCE,
  async (job) => {
    console.log(`[balance] Processing job ${job.id}`);
    await processBalanceRecalculate(job);
    console.log(`[balance] Job ${job.id} complete`);
  },
  { connection, concurrency: 2 }
);

const executeWorker = new Worker(
  QUEUE_NAMES.SUGGESTION_EXECUTE,
  async (job) => {
    console.log(`[execute] Processing job ${job.id}`);
    await processSuggestionExecute(job);
    console.log(`[execute] Job ${job.id} complete`);
  },
  { connection, concurrency: 1 }
);

const workers = [
  personaWorker,
  suggestionsWorker,
  forecastWorker,
  balanceWorker,
  executeWorker,
];

for (const worker of workers) {
  worker.on("failed", (job, err) => {
    console.error(`[${worker.name}] Job ${job?.id} failed:`, err.message);
  });
  worker.on("error", (err) => {
    console.error(`[${worker.name}] Worker error:`, err.message);
  });
}

console.log(
  `✅ Alter worker ready — listening on queues: ${Object.values(QUEUE_NAMES).join(", ")}`
);

async function shutdown() {
  console.log("Shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
