"use client";

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
  Eye,
  MessageSquare,
  FileEdit,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Presentation = "reflection" | "action" | "draft" | "notification";

interface FilteredSuggestion {
  id?: string;
  title: string;
  description: string;
  reason: string;
  mode: "PERSONAL" | "PROFESSIONAL";
  autonomyLevelRequired: string;
  priority: number;
  presentation: Presentation;
  showAcceptDecline: boolean;
  helperText?: string;
  badgeLabel?: string;
  highlighted?: boolean;
  footerText?: string;
}

const PRESENTATION_META: Record<
  Presentation,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    cardClass: string;
    bodyClass: string;
    helper: string;
  }
> = {
  reflection: {
    label: "Reflection",
    icon: Eye,
    color: "text-blue-600",
    cardClass: "border-blue-200 bg-blue-50/50",
    bodyClass: "bg-blue-100/70 text-blue-900",
    helper: "Observer mode: Alter is surfacing a pattern for you to consider.",
  },
  action: {
    label: "Needs Approval",
    icon: MessageSquare,
    color: "text-amber-600",
    cardClass: "border-amber-200 bg-amber-50/60",
    bodyClass: "bg-amber-100/70 text-amber-900",
    helper: "Advisor mode: Alter suggests the move, but you stay in control.",
  },
  draft: {
    label: "Ready To Confirm",
    icon: FileEdit,
    color: "text-orange-600",
    cardClass: "border-orange-200 bg-orange-50/60",
    bodyClass: "bg-orange-100/70 text-orange-900",
    helper: "Co-pilot mode: Alter has prepared the action for your confirmation.",
  },
  notification: {
    label: "Already Acted",
    icon: Zap,
    color: "text-emerald-600",
    cardClass: "border-emerald-200 bg-emerald-50/60",
    bodyClass: "bg-emerald-100/70 text-emerald-900",
    helper: "Autonomous mode: Alter already handled this within your rules.",
  },
};

function SuggestionCard({
  suggestion,
  onAccept,
  onDecline,
}: {
  suggestion: FilteredSuggestion;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}) {
  const meta = PRESENTATION_META[suggestion.presentation];
  const Icon = meta.icon;
  const isPreviewAction =
    !suggestion.id &&
    (suggestion.presentation === "action" || suggestion.presentation === "draft");
  const helperText = isPreviewAction
    ? "Preview only: this suggestion has not been persisted yet, so there is nothing to accept or decline."
    : suggestion.helperText ?? meta.helper;
  const badgeLabel = isPreviewAction
    ? "Preview"
    : suggestion.badgeLabel ?? meta.label;

  return (
    <Card
      className={cn(
        meta.cardClass,
        suggestion.highlighted &&
          "animate-pulse border-emerald-300 shadow-sm"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("size-4 shrink-0", meta.color)} />
            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {badgeLabel}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {suggestion.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={cn(
            "rounded-md px-2.5 py-2 text-xs font-medium",
            meta.bodyClass
          )}
        >
          {helperText}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Why:</span> {suggestion.reason}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[10px]">
            {suggestion.mode}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Needs {suggestion.autonomyLevelRequired.toLowerCase()}
          </Badge>
        </div>

        {suggestion.presentation === "action" &&
          suggestion.showAcceptDecline &&
          suggestion.id && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => suggestion.id && onAccept?.(suggestion.id)}
            >
              <CheckCircle2 className="size-3" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => suggestion.id && onDecline?.(suggestion.id)}
            >
              <XCircle className="size-3" />
              Decline
            </Button>
          </div>
        )}

        {suggestion.presentation === "draft" &&
          suggestion.showAcceptDecline &&
          suggestion.id && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => suggestion.id && onAccept?.(suggestion.id)}
            >
              <CheckCircle2 className="size-3" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => suggestion.id && onDecline?.(suggestion.id)}
            >
              <XCircle className="size-3" />
              Decline
            </Button>
          </div>
        )}

        {suggestion.presentation === "notification" && suggestion.footerText && (
          <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Zap className="size-3" />
            {suggestion.footerText}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SuggestionCards({
  suggestions,
  mode,
  onAccept,
  onDecline,
}: {
  suggestions: FilteredSuggestion[];
  mode: "PERSONAL" | "PROFESSIONAL";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}) {
  const filtered = suggestions.filter((s) => s.mode === mode);

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No {mode.toLowerCase()} suggestions right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {filtered.map((s, i) => (
        <SuggestionCard
          key={s.id ?? i}
          suggestion={s}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ))}
    </div>
  );
}
