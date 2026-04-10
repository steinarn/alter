import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface Conflict {
  type: "consecutive_drainers" | "no_recovery";
  severity: "warning" | "critical";
  message: string;
  events: Array<{ id: string; title: string }>;
  date: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function ConflictAlerts({ conflicts }: { conflicts: Conflict[] }) {
  if (conflicts.length === 0) return null;

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, i) => {
        const isCritical = conflict.severity === "critical";

        return (
          <Card
            key={i}
            className={cn(
              "border-l-4",
              isCritical ? "border-l-red-500" : "border-l-amber-500"
            )}
          >
            <CardContent className="flex gap-3 py-3">
              <div className="mt-0.5 shrink-0">
                {isCritical ? (
                  <ShieldAlert className="size-5 text-red-500" />
                ) : (
                  <AlertTriangle className="size-5 text-amber-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{conflict.message}</p>
                  <Badge
                    variant={isCritical ? "destructive" : "secondary"}
                    className="shrink-0 text-[10px]"
                  >
                    {conflict.severity}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(conflict.date)} —{" "}
                  {conflict.events.map((e) => e.title).join(", ")}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
