import { NextRequest, NextResponse } from "next/server";
import { suggestionsQueue } from "@/lib/queues";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string; jobId: string }> }
) {
  const { jobId } = await params;
  const job = await suggestionsQueue.getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { error: "Job not found", exists: false },
      { status: 404 }
    );
  }

  const state = await job.getState();

  return NextResponse.json({
    exists: true,
    id: job.id,
    state,
    failedReason: job.failedReason ?? null,
    processedOn: job.processedOn ?? null,
    finishedOn: job.finishedOn ?? null,
  });
}
