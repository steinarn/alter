"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  Lightbulb,
  Loader2,
} from "lucide-react";

interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  reason: string;
  mode: "PERSONAL" | "PROFESSIONAL";
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "ACTED";
  autonomyLevelRequired: string;
  createdAt: string;
  actions: Array<{
    actionType: string;
    executedAt: string | null;
  }>;
}

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PENDING: { label: "Pending", color: "text-amber-600", icon: Clock },
  ACCEPTED: { label: "Accepted", color: "text-emerald-600", icon: CheckCircle2 },
  DECLINED: { label: "Declined", color: "text-muted-foreground", icon: XCircle },
  ACTED: { label: "Acted", color: "text-blue-600", icon: Zap },
};

function SuggestionRow({
  suggestion,
  onStatusChange,
  highlighted = false,
}: {
  suggestion: SuggestionItem;
  onStatusChange: (id: string, status: "ACCEPTED" | "DECLINED") => void;
  highlighted?: boolean;
}) {
  const meta = STATUS_META[suggestion.status];
  const StatusIcon = meta.icon;

  return (
    <Card
      className={cn(
        highlighted &&
          "animate-pulse border-emerald-300 bg-emerald-50/50 shadow-sm"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm">{suggestion.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {suggestion.mode}
            </Badge>
            <Badge
              variant="outline"
              className={cn("gap-1 text-[10px]", meta.color)}
            >
              <StatusIcon className="size-3" />
              {meta.label}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {suggestion.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Why:</span> {suggestion.reason}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {new Date(suggestion.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          {suggestion.status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => onStatusChange(suggestion.id, "ACCEPTED")}
              >
                <CheckCircle2 className="size-3" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={() => onStatusChange(suggestion.id, "DECLINED")}
              >
                <XCircle className="size-3" />
                Decline
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SuggestionsList({
  suggestions: initialSuggestions,
  userId,
}: {
  suggestions: SuggestionItem[];
  userId: string;
}) {
  const [suggestions, setSuggestions] =
    useState<SuggestionItem[]>(initialSuggestions);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "DECLINED" | "ACTED">("ALL");
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState<string[]>([]);
  const [automationState, setAutomationState] = useState<null | {
    mode: "PERSONAL" | "PROFESSIONAL";
    startedAt: string;
    jobId: string;
    autonomyLevel: string;
    phase: "queued" | "working" | "complete" | "stalled" | "failed";
    failedReason?: string | null;
  }>(null);
  const automationAttemptsRef = useRef(0);
  const automationCycleKey = automationState
    ? `${automationState.mode}-${automationState.startedAt}-${automationState.autonomyLevel}`
    : null;
  const storageKey = `alter-suggestion-generation:${userId}`;

  useEffect(() => {
    setSuggestions(initialSuggestions);
  }, [initialSuggestions]);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        mode: "PERSONAL" | "PROFESSIONAL";
        startedAt: string;
        jobId: string;
        autonomyLevel: string;
        phase: "queued" | "working" | "complete" | "stalled" | "failed";
        failedReason?: string | null;
      };

      const ageMs = Date.now() - new Date(parsed.startedAt).getTime();
      if (ageMs < 10 * 60 * 1000) {
        setAutomationState(parsed);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!automationState) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(automationState));
  }, [automationState, storageKey]);

  useEffect(() => {
    if (!automationState) return;

    let cancelled = false;
    const currentAutomationState = automationState;
    let intervalId: number | null = null;
    let completionTimeoutId: number | null = null;

    async function poll() {
      const jobRes = await fetch(
        `/api/users/${userId}/suggestions/jobs/${currentAutomationState.jobId}`
      );
      if (!jobRes.ok || cancelled) return;

      const job = (await jobRes.json()) as {
        state: string;
        failedReason?: string | null;
      };

      let fresh: SuggestionItem[] = [];

      const shouldFetchSuggestions =
        currentAutomationState.autonomyLevel === "AUTONOMOUS" ||
        job.state === "completed" ||
        job.state === "failed";

      if (shouldFetchSuggestions) {
        const params = new URLSearchParams({ mode: currentAutomationState.mode });
        const res = await fetch(`/api/users/${userId}/suggestions?${params}`);
        if (!res.ok || cancelled) return;

        const data = await res.json();
        const nextSuggestions: SuggestionItem[] = (
          data.suggestions as Array<Record<string, unknown>>
        ).map(mapSuggestionItem);

        if (cancelled) return;

        setSuggestions((prev) => {
          const byId = new Map(prev.map((item) => [item.id, item]));
          for (const item of nextSuggestions) {
            byId.set(item.id, item);
          }
          return Array.from(byId.values()).sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        const startedAtMs =
          new Date(currentAutomationState.startedAt).getTime() - 1000;
        fresh = nextSuggestions.filter(
          (suggestion) => new Date(suggestion.createdAt).getTime() >= startedAtMs
        );
      }

      if (fresh.length === 0) {
        if (job.state === "failed") {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
          }
          setAutomationState((prev) =>
            prev
              ? {
                  ...prev,
                  phase: "failed",
                  failedReason:
                    job.failedReason ??
                    "Suggestion generation failed in the worker.",
                }
              : prev
          );
          return;
        }

        if (
          job.state === "completed" &&
          currentAutomationState.autonomyLevel !== "AUTONOMOUS"
        ) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
          }
          setAutomationState((prev) =>
            prev
              ? {
                  ...prev,
                  phase: "failed",
                  failedReason:
                    "The job completed, but no new suggestions were persisted.",
                }
              : prev
          );
          return;
        }

        automationAttemptsRef.current += 1;
        if (automationAttemptsRef.current >= 20) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
          }
          setAutomationState((prev) => (prev ? { ...prev, phase: "stalled" } : prev));
        }
        return;
      }

      if (currentAutomationState.autonomyLevel !== "AUTONOMOUS") {
        if (intervalId !== null) {
          window.clearInterval(intervalId);
        }

        const freshIds = fresh.map((suggestion) => suggestion.id);
        if (freshIds.length > 0) {
          setRecentlyUpdatedIds(freshIds);
          setAutomationState((prev) =>
            prev ? { ...prev, phase: "complete" } : prev
          );

          completionTimeoutId = window.setTimeout(() => {
            setRecentlyUpdatedIds((prev) =>
              prev.filter((id) => !freshIds.includes(id))
            );
            setAutomationState((prev) =>
              prev?.phase === "complete" ? null : prev
            );
          }, 3500);
          return;
        }

        if (intervalId !== null) {
          window.clearInterval(intervalId);
        }
        setAutomationState(null);
        return;
      }

      const pending = fresh.some((suggestion) => suggestion.status === "PENDING");
      const completedIds = fresh
        .filter((suggestion) =>
          suggestion.status === "ACTED" || suggestion.status === "DECLINED"
        )
        .map((suggestion) => suggestion.id);

      if (pending && automationAttemptsRef.current < 19) {
        automationAttemptsRef.current += 1;
        setAutomationState((prev) =>
          prev && prev.phase !== "working"
            ? {
                ...prev,
                phase: "working",
              }
            : prev
        );
        return;
      }

      if (completedIds.length > 0) {
        if (intervalId !== null) {
          window.clearInterval(intervalId);
        }
        setRecentlyUpdatedIds(completedIds);
        setAutomationState((prev) =>
          prev ? { ...prev, phase: "complete" } : prev
        );

        completionTimeoutId = window.setTimeout(() => {
          setRecentlyUpdatedIds((prev) =>
            prev.filter((id) => !completedIds.includes(id))
          );
          setAutomationState((prev) =>
            prev?.phase === "complete" ? null : prev
          );
        }, 3500);
        return;
      }

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      setAutomationState(null);
    }

    void poll();

    intervalId = window.setInterval(() => {
      void poll();
    }, 1500);

    return () => {
      cancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      if (completionTimeoutId !== null) {
        window.clearTimeout(completionTimeoutId);
      }
    };
  }, [automationCycleKey, userId]);

  async function handleStatusChange(
    id: string,
    status: "ACCEPTED" | "DECLINED"
  ) {
    const res = await fetch(`/api/suggestions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    }
  }

  async function handleGenerate(mode: "PERSONAL" | "PROFESSIONAL") {
    setGenerating(true);
    try {
      const res = await fetch(`/api/users/${userId}/generate-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.suggestions)) {
          const newSuggestions: SuggestionItem[] = data.suggestions.map(
            mapSuggestionItem
          );
          setSuggestions((prev) => [...newSuggestions, ...prev]);
          return;
        }

        if (data.queued) {
          automationAttemptsRef.current = 0;
          setAutomationState({
            mode,
            startedAt: (data.startedAt as string) ?? new Date().toISOString(),
            jobId: (data.jobId as string) ?? "",
            autonomyLevel: (data.autonomyLevel as string) ?? "OBSERVER",
            phase:
              data.autonomyLevel === "AUTONOMOUS" ? "working" : "queued",
            failedReason: null,
          });
        }
      }
    } finally {
      setGenerating(false);
    }
  }

  const filtered =
    filter === "ALL"
      ? suggestions
      : suggestions.filter((s) => s.status === filter);

  if (suggestions.length === 0 && !generating) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Lightbulb className="size-10 text-muted-foreground/40" />
            <div className="text-center">
              <p className="text-sm font-medium">No suggestions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Generate AI-powered suggestions based on your persona and
                calendar.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleGenerate("PROFESSIONAL")}
                disabled={generating}
              >
                {generating && <Loader2 className="size-3 animate-spin" />}
                Generate Professional
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerate("PERSONAL")}
                disabled={generating}
              >
                {generating && <Loader2 className="size-3 animate-spin" />}
                Generate Personal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {automationState && (
        <Card
          className={cn(
            "border-dashed transition-colors",
            automationState.phase === "complete" &&
              "border-emerald-300 bg-emerald-50/60",
            automationState.phase === "failed" &&
              "border-destructive/30 bg-destructive/5",
            automationState.phase === "stalled" &&
              "border-amber-300 bg-amber-50/60"
          )}
        >
          <CardContent className="flex items-start gap-3 py-4">
            {automationState.phase === "complete" ? (
              <Zap className="mt-0.5 size-4 text-emerald-600" />
            ) : automationState.phase === "failed" ? (
              <XCircle className="mt-0.5 size-4 text-destructive" />
            ) : automationState.phase === "stalled" ? (
              <Clock className="mt-0.5 size-4 text-amber-600" />
            ) : (
              <Loader2 className="mt-0.5 size-4 animate-spin text-primary" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {automationState.phase === "complete"
                  ? automationState.autonomyLevel === "AUTONOMOUS"
                    ? "Alter finished the autonomous pass."
                    : "Alter finished generating new suggestions."
                  : automationState.phase === "failed"
                    ? "Suggestion generation failed."
                  : automationState.phase === "stalled"
                    ? "Suggestions are queued, but the worker has not finished yet."
                    : automationState.autonomyLevel === "AUTONOMOUS"
                      ? "Alter is reviewing and acting on suggestions in the background."
                      : "Generating suggestions in the background."}
              </p>
              <p className="text-xs text-muted-foreground">
                {automationState.phase === "complete"
                  ? "Updated suggestions are highlighted below."
                  : automationState.phase === "failed"
                    ? automationState.failedReason ??
                      "The worker did not persist any new suggestions."
                  : automationState.phase === "stalled"
                    ? "Keep the worker running to see suggestions move out of pending."
                    : `Mode: ${automationState.mode.toLowerCase()}.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {(["ALL", "PENDING", "ACCEPTED", "DECLINED", "ACTED"] as const).map(
            (status) => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? "default" : "ghost"}
                className="h-7 text-xs"
                onClick={() => setFilter(status)}
              >
                {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                {status !== "ALL" && (
                  <span className="ml-1 text-[10px] opacity-60">
                    {suggestions.filter((s) => s.status === status).length}
                  </span>
                )}
              </Button>
            )
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleGenerate("PROFESSIONAL")}
            disabled={generating}
          >
            {generating && <Loader2 className="size-3 animate-spin" />}
            Generate Professional
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => handleGenerate("PERSONAL")}
            disabled={generating}
          >
            {generating && <Loader2 className="size-3 animate-spin" />}
            Generate Personal
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No {filter.toLowerCase()} suggestions.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((s) => (
            <SuggestionRow
              key={s.id}
              suggestion={s}
              onStatusChange={handleStatusChange}
              highlighted={recentlyUpdatedIds.includes(s.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function mapSuggestionItem(s: Record<string, unknown>): SuggestionItem {
  return {
    id: s.id as string,
    title: s.title as string,
    description: s.description as string,
    reason: s.reason as string,
    mode: s.mode as "PERSONAL" | "PROFESSIONAL",
    status: s.status as "PENDING" | "ACCEPTED" | "DECLINED" | "ACTED",
    autonomyLevelRequired: s.autonomyLevelRequired as string,
    createdAt: (s.createdAt as string) ?? new Date().toISOString(),
    actions: ((s.actions as Array<Record<string, unknown>>) ?? []).map((a) => ({
      actionType: a.actionType as string,
      executedAt: (a.executedAt as string) ?? null,
    })),
  };
}
