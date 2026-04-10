"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { EnergyForecast } from "./energy-forecast";
import { BalanceScores } from "./balance-scores";
import { ConflictAlerts } from "./conflict-alerts";
import { SuggestionCards } from "./suggestion-cards";
import { CalendarPreview } from "./calendar-preview";
import { ModeToggle } from "./mode-toggle";

interface DashboardData {
  forecast: Array<{
    date: string;
    predictedLevel: number;
    reason: string;
    events: Array<{ title: string; impact: number }>;
  }>;
  balance: Array<{
    dimension: "WORK" | "REST" | "SOCIAL" | "GROWTH";
    score: number;
    target: number;
    delta: number;
  }>;
  conflicts: Array<{
    type: "consecutive_drainers" | "no_recovery";
    severity: "warning" | "critical";
    message: string;
    events: Array<{ id: string; title: string }>;
    date: string;
  }>;
  suggestions: Array<{
    title: string;
    description: string;
    reason: string;
    mode: "PERSONAL" | "PROFESSIONAL";
    autonomyLevelRequired: string;
    priority: number;
    presentation: "reflection" | "action" | "draft" | "notification";
    showAcceptDecline: boolean;
  }>;
  calendarEvents: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    isDrainer: boolean;
    isBooster: boolean;
  }>;
  autonomy: {
    level: string;
    personalMode: string;
    professionalMode: string;
  } | null;
}

export function DashboardShell({ userId }: { userId: string }) {
  const mode = useDashboardStore((s) => s.mode);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${userId}/dashboard`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setError("Failed to load dashboard data");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
    return () => controller.abort();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          {error ?? "Something went wrong"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conflict alerts — top priority */}
      <ConflictAlerts conflicts={data.conflicts} />

      {/* Top row: energy forecast + balance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EnergyForecast forecast={data.forecast} />
        <BalanceScores balance={data.balance} />
      </div>

      {/* Suggestions with mode toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suggestions</h2>
          <ModeToggle />
        </div>
        <SuggestionCards suggestions={data.suggestions} mode={mode} />
      </div>

      {/* Calendar preview */}
      {data.calendarEvents && data.calendarEvents.length > 0 && (
        <CalendarPreview events={data.calendarEvents} />
      )}
    </div>
  );
}
