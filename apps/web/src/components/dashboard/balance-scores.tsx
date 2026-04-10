"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BalanceResult {
  dimension: "WORK" | "REST" | "SOCIAL" | "GROWTH";
  score: number;
  target: number;
  delta: number;
}

const DIMENSION_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  WORK: { label: "Work", icon: "💼", color: "bg-blue-500" },
  REST: { label: "Rest", icon: "🛌", color: "bg-violet-500" },
  SOCIAL: { label: "Social", icon: "👥", color: "bg-amber-500" },
  GROWTH: { label: "Growth", icon: "🌱", color: "bg-emerald-500" },
};

export function BalanceScores({ balance }: { balance: BalanceResult[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Life Balance</CardTitle>
        <CardDescription>
          How your week maps to your priorities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {balance.map((b) => {
          const meta = DIMENSION_META[b.dimension];
          const scorePercent = (b.score / 10) * 100;
          const targetPercent = (b.target / 10) * 100;

          return (
            <div key={b.dimension} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span>{meta.icon}</span>
                  {meta.label}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    b.delta >= 0
                      ? "text-emerald-600"
                      : b.delta >= -2
                        ? "text-amber-600"
                        : "text-red-500"
                  )}
                >
                  {b.score.toFixed(1)} / {b.target}
                </span>
              </div>
              <div className="relative">
                <Progress value={scorePercent} className="h-2.5" />
                <div
                  className="absolute top-0 h-2.5 w-0.5 bg-foreground/50"
                  style={{ left: `${targetPercent}%` }}
                  title={`Target: ${b.target}`}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
