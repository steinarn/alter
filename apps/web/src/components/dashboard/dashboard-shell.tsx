"use client";

import { useEffect, useState, useCallback } from "react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { EnergyForecast } from "./energy-forecast";
import { BalanceScores } from "./balance-scores";
import { ConflictAlerts } from "./conflict-alerts";
import { SuggestionCards } from "./suggestion-cards";
import { CalendarPreview } from "./calendar-preview";
import { ModeToggle } from "./mode-toggle";
import { AutonomyDial } from "@/components/autonomy/autonomy-dial";
import { AutonomousConfirm } from "@/components/autonomy/autonomous-confirm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AutonomyLevel = "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";

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
  persistedSuggestions: Array<{
    id: string;
    title: string;
    description: string;
    reason: string;
    mode: string;
    status: string;
    autonomyLevelRequired: string;
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
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>("OBSERVER");
  const [pendingAutonomous, setPendingAutonomous] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchDashboard = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${userId}/dashboard`, { signal });
        if (!res.ok) {
          setError("Failed to load dashboard data");
          return;
        }
        const json = await res.json();
        setData(json);
        if (json.autonomy) {
          setAutonomyLevel(json.autonomy.level as AutonomyLevel);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal);
    return () => controller.abort();
  }, [fetchDashboard]);

  const handleAutonomyChange = useCallback(
    async (level: AutonomyLevel) => {
      if (level === "AUTONOMOUS") {
        setPendingAutonomous(true);
        return;
      }
      setAutonomyLevel(level);
      setSaving(true);
      try {
        await fetch(`/api/users/${userId}/autonomy`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level }),
        });
        await fetchDashboard();
      } finally {
        setSaving(false);
      }
    },
    [userId, fetchDashboard]
  );

  const confirmAutonomous = useCallback(async () => {
    setPendingAutonomous(false);
    setAutonomyLevel("AUTONOMOUS");
    setSaving(true);
    try {
      await fetch(`/api/users/${userId}/autonomy`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: "AUTONOMOUS" }),
      });
      await fetchDashboard();
    } finally {
      setSaving(false);
    }
  }, [userId, fetchDashboard]);

  const handleSuggestionAction = useCallback(
    async (suggestionId: string, status: "ACCEPTED" | "DECLINED") => {
      const res = await fetch(`/api/suggestions/${suggestionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        // Remove from local state so it disappears from the list
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            persistedSuggestions: prev.persistedSuggestions.filter(
              (s) => s.id !== suggestionId
            ),
          };
        });
      }
    },
    []
  );

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

  // Merge domain-computed suggestions with persisted ones (which have IDs for actions).
  // Persisted suggestions take priority — match by title to avoid duplicates.
  const persistedTitles = new Set(
    data.persistedSuggestions.map((s) => s.title)
  );

  const persistedAsSuggestions = data.persistedSuggestions.map((s) => {
    // Find matching domain suggestion for presentation info
    const domainMatch = data.suggestions.find(
      (ds) => ds.title === s.title
    );
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      reason: s.reason,
      mode: s.mode as "PERSONAL" | "PROFESSIONAL",
      autonomyLevelRequired: s.autonomyLevelRequired,
      priority: domainMatch?.priority ?? 5,
      presentation: domainMatch?.presentation ?? ("action" as const),
      showAcceptDecline: domainMatch?.showAcceptDecline ?? true,
    };
  });

  const domainOnly = data.suggestions.filter(
    (s) => !persistedTitles.has(s.title)
  );

  const mergedSuggestions = [...persistedAsSuggestions, ...domainOnly];

  return (
    <div className="space-y-6">
      {/* Conflict alerts — top priority */}
      <ConflictAlerts conflicts={data.conflicts} />

      {/* Top row: energy forecast + balance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EnergyForecast forecast={data.forecast} />
        <BalanceScores balance={data.balance} />
      </div>

      {/* Autonomy dial */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Autonomy Level</CardTitle>
          <CardDescription>
            How much control Alter has over your suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutonomyDial
            value={autonomyLevel}
            onChange={handleAutonomyChange}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {pendingAutonomous && (
        <AutonomousConfirm
          onConfirm={confirmAutonomous}
          onCancel={() => setPendingAutonomous(false)}
        />
      )}

      {/* Suggestions with mode toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suggestions</h2>
          <ModeToggle />
        </div>
        <SuggestionCards
          suggestions={mergedSuggestions}
          mode={mode}
          onAccept={(id) => handleSuggestionAction(id, "ACCEPTED")}
          onDecline={(id) => handleSuggestionAction(id, "DECLINED")}
        />
      </div>

      {/* Calendar preview */}
      {data.calendarEvents && data.calendarEvents.length > 0 && (
        <CalendarPreview events={data.calendarEvents} />
      )}
    </div>
  );
}
