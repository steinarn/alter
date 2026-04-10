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
}

const PRESENTATION_META: Record<
  Presentation,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  reflection: { label: "Reflection", icon: Eye, color: "text-blue-500" },
  action: { label: "Suggestion", icon: MessageSquare, color: "text-amber-500" },
  draft: { label: "Draft", icon: FileEdit, color: "text-orange-500" },
  notification: { label: "Acted", icon: Zap, color: "text-emerald-500" },
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("size-4 shrink-0", meta.color)} />
            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {meta.label}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {suggestion.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Why:</span> {suggestion.reason}
        </p>

        {suggestion.presentation === "action" && suggestion.showAcceptDecline && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => suggestion.id && onAccept?.(suggestion.id)}
              disabled={!suggestion.id}
            >
              <CheckCircle2 className="size-3" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => suggestion.id && onDecline?.(suggestion.id)}
              disabled={!suggestion.id}
            >
              <XCircle className="size-3" />
              Decline
            </Button>
          </div>
        )}

        {suggestion.presentation === "draft" && suggestion.showAcceptDecline && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => suggestion.id && onAccept?.(suggestion.id)}
              disabled={!suggestion.id}
            >
              <CheckCircle2 className="size-3" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => suggestion.id && onDecline?.(suggestion.id)}
              disabled={!suggestion.id}
            >
              <XCircle className="size-3" />
              Decline
            </Button>
          </div>
        )}

        {suggestion.presentation === "notification" && (
          <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Zap className="size-3" />
            Alter acted on this for you
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
