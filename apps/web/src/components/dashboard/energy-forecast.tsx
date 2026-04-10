"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DayForecast {
  date: string;
  predictedLevel: number;
  reason: string;
  events: Array<{ title: string; impact: number }>;
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getEnergyColor(level: number): string {
  if (level >= 5) return "bg-emerald-500";
  if (level >= 2) return "bg-emerald-400";
  if (level >= 0) return "bg-amber-400";
  if (level >= -3) return "bg-orange-400";
  return "bg-red-500";
}

function getEnergyLabel(level: number): string {
  if (level >= 5) return "High";
  if (level >= 2) return "Good";
  if (level >= 0) return "Neutral";
  if (level >= -3) return "Low";
  return "Drained";
}

export function EnergyForecast({ forecast }: { forecast: DayForecast[] }) {
  const maxAbsLevel = 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Energy Forecast</CardTitle>
        <CardDescription>Predicted energy levels for the week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          {forecast.map((day) => {
            const barHeight = Math.max(
              8,
              ((Math.abs(day.predictedLevel) / maxAbsLevel) * 100)
            );

            return (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {day.predictedLevel > 0 ? "+" : ""}
                      {day.predictedLevel}
                    </span>
                    <div className="flex h-28 w-full items-end justify-center">
                      <div
                        className={cn(
                          "w-full max-w-10 rounded-t-sm transition-all",
                          getEnergyColor(day.predictedLevel)
                        )}
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium">{getDayLabel(day.date)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {getDateLabel(day.date)}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  <p className="font-medium">
                    {getEnergyLabel(day.predictedLevel)} energy
                  </p>
                  <p className="text-xs text-muted-foreground">{day.reason}</p>
                  {day.events.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {day.events.map((e, i) => (
                        <li key={i} className="text-xs">
                          {e.title}:{" "}
                          <span
                            className={cn(
                              "font-medium",
                              e.impact > 0
                                ? "text-emerald-600"
                                : e.impact < 0
                                  ? "text-red-500"
                                  : "text-muted-foreground"
                            )}
                          >
                            {e.impact > 0 ? "+" : ""}
                            {e.impact}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
