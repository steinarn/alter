"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { Loader2, Zap } from "lucide-react";

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
    createdAt: string;
    actions?: Array<{
      actionType: string;
      payload: Record<string, unknown>;
      executedAt?: string | null;
    }>;
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
  const [highlightedSuggestionIds, setHighlightedSuggestionIds] = useState<string[]>(
    []
  );
  const [autonomousProcessing, setAutonomousProcessing] = useState(false);
  const persistedSuggestionsRef = useRef<DashboardData["persistedSuggestions"]>([]);

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

  useEffect(() => {
    persistedSuggestionsRef.current = data?.persistedSuggestions ?? [];
  }, [data?.persistedSuggestions]);

  useEffect(() => {
    if (!data) return;

    const modeAutonomy = getModeAutonomyLevel(data.autonomy, mode);
    const hasPending = data.persistedSuggestions.some(
      (suggestion) =>
        suggestion.mode === mode && suggestion.status === "PENDING"
    );

    if (modeAutonomy !== "AUTONOMOUS" || !hasPending) {
      setAutonomousProcessing(false);
      return;
    }

    let cancelled = false;

    async function enqueueAndPoll() {
      setAutonomousProcessing(true);
      await fetch(`/api/users/${userId}/suggestions/autonomous-pass`, {
        method: "POST",
      });

      const interval = window.setInterval(async () => {
        const res = await fetch(`/api/users/${userId}/suggestions?mode=${mode}`);
        if (!res.ok || cancelled) return;

        const json = await res.json();
        const nextSuggestions = (json.suggestions as Array<Record<string, unknown>>).map(
          (suggestion) => ({
            id: suggestion.id as string,
            title: suggestion.title as string,
            description: suggestion.description as string,
            reason: suggestion.reason as string,
            mode: suggestion.mode as string,
            status: suggestion.status as string,
            autonomyLevelRequired: suggestion.autonomyLevelRequired as string,
            createdAt:
              (suggestion.createdAt as string) ?? new Date().toISOString(),
            actions: ((suggestion.actions as Array<Record<string, unknown>>) ?? []).map(
              (action) => ({
                actionType: action.actionType as string,
                payload: (action.payload as Record<string, unknown>) ?? {},
                executedAt: (action.executedAt as string) ?? null,
              })
            ),
          })
        );

        const changedIds = nextSuggestions
          .filter((suggestion) => {
            const previous = persistedSuggestionsRef.current.find(
              (item) => item.id === suggestion.id
            );
            return previous && previous.status !== suggestion.status;
          })
          .map((suggestion) => suggestion.id);

        if (changedIds.length > 0) {
          setHighlightedSuggestionIds((prev) => [
            ...new Set([...prev, ...changedIds]),
          ]);
          window.setTimeout(() => {
            setHighlightedSuggestionIds((prev) =>
              prev.filter((id) => !changedIds.includes(id))
            );
          }, 2200);
        }

        setData((prev) => {
          if (!prev) return prev;
          const byId = new Map(
            prev.persistedSuggestions.map((suggestion) => [suggestion.id, suggestion])
          );
          for (const suggestion of nextSuggestions) {
            byId.set(suggestion.id, suggestion);
          }

          return {
            ...prev,
            persistedSuggestions: Array.from(byId.values()).sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            ),
          };
        });

        const stillPending = nextSuggestions.some(
          (suggestion) => suggestion.status === "PENDING"
        );

        if (!stillPending) {
          setAutonomousProcessing(false);
          window.clearInterval(interval);
        }
      }, 1200);

      return interval;
    }

    let intervalPromise: Promise<number | void> | null = enqueueAndPoll();

    return () => {
      cancelled = true;
      setAutonomousProcessing(false);
      void intervalPromise?.then((interval) => {
        if (typeof interval === "number") {
          window.clearInterval(interval);
        }
      });
    };
  }, [data, mode, userId]);

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
    const modeAutonomy = getModeAutonomyLevel(
      data.autonomy,
      s.mode as "PERSONAL" | "PROFESSIONAL"
    );

    const persistedPresentation = getPersistedSuggestionPresentation(
      s,
      modeAutonomy
    );

    return {
      id: s.id,
      title: s.title,
      description: s.description,
      reason: s.reason,
      mode: s.mode as "PERSONAL" | "PROFESSIONAL",
      autonomyLevelRequired: s.autonomyLevelRequired,
      priority: domainMatch?.priority ?? 5,
      presentation:
        persistedPresentation?.presentation ??
        domainMatch?.presentation ??
        ("action" as const),
      showAcceptDecline:
        persistedPresentation?.showAcceptDecline ??
        domainMatch?.showAcceptDecline ??
        true,
      helperText:
        persistedPresentation?.helperText ??
        undefined,
      badgeLabel:
        persistedPresentation?.badgeLabel ??
        undefined,
      footerText:
        persistedPresentation?.footerText ??
        undefined,
      highlighted: highlightedSuggestionIds.includes(s.id),
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
        {autonomousProcessing && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-700">
            <Loader2 className="size-4 animate-spin" />
            Alter is processing suggestions one by one in the background.
          </div>
        )}
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

function getModeAutonomyLevel(
  autonomy: DashboardData["autonomy"],
  mode: "PERSONAL" | "PROFESSIONAL"
): AutonomyLevel {
  if (!autonomy) return "OBSERVER";

  if (mode === "PERSONAL") {
    return (autonomy.personalMode as AutonomyLevel) ?? "OBSERVER";
  }

  return (autonomy.professionalMode as AutonomyLevel) ?? "OBSERVER";
}

function getPersistedSuggestionPresentation(
  suggestion: {
  status: string;
  reason: string;
  actions?: Array<{ payload: Record<string, unknown> }>;
  },
  modeAutonomy: AutonomyLevel
): {
  presentation: "notification";
  showAcceptDecline: false;
  helperText: string;
  badgeLabel: string;
  footerText?: string;
} | null {
  const decisionComment = suggestion.actions
    ?.map((action) => action.payload?.decisionComment)
    .find((value): value is string => typeof value === "string");

  if (suggestion.status === "ACTED") {
    return {
      presentation: "notification",
      showAcceptDecline: false,
      helperText:
        decisionComment ?? `Accepted because ${suggestion.reason}`,
      badgeLabel: "Accepted",
      footerText: "Alter accepted this for you",
    };
  }

  if (suggestion.status === "ACCEPTED") {
    return {
      presentation: "notification",
      showAcceptDecline: false,
      helperText:
        decisionComment ?? `Accepted because ${suggestion.reason}`,
      badgeLabel: "Accepted",
      footerText: "You accepted this suggestion",
    };
  }

  if (suggestion.status === "DECLINED") {
    return {
      presentation: "notification",
      showAcceptDecline: false,
      helperText:
        decisionComment ??
        "Declined because Alter did not have enough safe detail to act on this automatically.",
      badgeLabel: "Declined",
      footerText: "Alter declined this for you",
    };
  }

  if (modeAutonomy !== "AUTONOMOUS") {
    return null;
  }

  return {
    presentation: "notification",
    showAcceptDecline: false,
    helperText: "Autonomous mode: Alter is processing this suggestion now.",
    badgeLabel: "Working",
  };
}
