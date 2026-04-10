"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Briefcase, User } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";

export function ModeToggle() {
  const { mode, setMode } = useDashboardStore();

  return (
    <div className="flex rounded-lg border bg-muted p-0.5">
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 gap-1.5 rounded-md px-3 text-xs font-medium",
          mode === "PERSONAL" &&
            "bg-background text-foreground shadow-sm hover:bg-background"
        )}
        onClick={() => setMode("PERSONAL")}
      >
        <User className="size-3.5" />
        Personal
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 gap-1.5 rounded-md px-3 text-xs font-medium",
          mode === "PROFESSIONAL" &&
            "bg-background text-foreground shadow-sm hover:bg-background"
        )}
        onClick={() => setMode("PROFESSIONAL")}
      >
        <Briefcase className="size-3.5" />
        Professional
      </Button>
    </div>
  );
}
