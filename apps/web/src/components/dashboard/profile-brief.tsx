import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BatteryLow,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const AUTONOMY_LABELS: Record<string, string> = {
  OBSERVER: "Observer",
  ADVISOR: "Advisor",
  COPILOT: "Co-pilot",
  AUTONOMOUS: "Autonomous",
};

export function ProfileBrief({
  name,
  summary,
  communicationStyle,
  boundaryNotes,
  autonomyLevel,
  archetype,
  energizer,
  drainer,
  goals,
}: {
  name: string;
  summary: string;
  communicationStyle: string;
  boundaryNotes: string;
  autonomyLevel: string;
  archetype?: string | null;
  energizer?: string | null;
  drainer?: string | null;
  goals: string[];
}) {
  return (
    <Card className="overflow-hidden border-primary/15 bg-linear-to-br from-primary/5 via-background to-background">
      <CardHeader className="gap-4 pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-lg">{name}</CardTitle>
              {archetype && <Badge variant="secondary">{archetype}</Badge>}
              <Badge variant="outline">
                {AUTONOMY_LABELS[autonomyLevel] ?? autonomyLevel}
              </Badge>
            </div>
            <CardDescription className="max-w-3xl text-sm text-foreground/80">
              {summary}
            </CardDescription>
          </div>
          <div className="rounded-xl border bg-background/80 px-3 py-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              Why Alter is suggesting this
            </p>
            <p className="mt-1 max-w-64">
              The dashboard is tuned to your boundaries, energy patterns, goals,
              and autonomy preferences.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-background/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Protect
          </div>
          <p className="text-sm">{boundaryNotes}</p>
        </div>

        <div className="rounded-xl border bg-background/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Zap className="size-3.5 text-emerald-600" />
            Energy Cues
          </div>
          <div className="space-y-2 text-sm">
            {energizer && (
              <p>
                <span className="font-medium text-emerald-700">Boosts:</span>{" "}
                {energizer}
              </p>
            )}
            {drainer && (
              <p>
                <span className="font-medium text-rose-700">Drains:</span>{" "}
                {drainer}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-background/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Target className="size-3.5" />
            Active Goals
          </div>
          <div className="flex flex-wrap gap-1.5">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <Badge key={goal} variant="outline" className="font-normal">
                  {goal}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No goals set yet
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-background/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <BatteryLow className="size-3.5" />
            Communication
          </div>
          <p className="text-sm">{communicationStyle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
