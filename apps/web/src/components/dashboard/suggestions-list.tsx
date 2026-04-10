"use client";

import { useState } from "react";
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
}: {
  suggestion: SuggestionItem;
  onStatusChange: (id: string, status: "ACCEPTED" | "DECLINED") => void;
}) {
  const meta = STATUS_META[suggestion.status];
  const StatusIcon = meta.icon;

  return (
    <Card>
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
        const newSuggestions: SuggestionItem[] = data.suggestions.map(
          (s: Record<string, unknown>) => ({
            id: s.id as string,
            title: s.title as string,
            description: s.description as string,
            reason: s.reason as string,
            mode: s.mode as "PERSONAL" | "PROFESSIONAL",
            status: s.status as "PENDING",
            autonomyLevelRequired: s.autonomyLevelRequired as string,
            createdAt: (s.createdAt as string) ?? new Date().toISOString(),
            actions: ((s.actions as Array<Record<string, unknown>>) ?? []).map(
              (a) => ({
                actionType: a.actionType as string,
                executedAt: (a.executedAt as string) ?? null,
              })
            ),
          })
        );
        setSuggestions((prev) => [...newSuggestions, ...prev]);
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
            />
          ))
        )}
      </div>
    </div>
  );
}
