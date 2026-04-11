"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface AutonomousRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_RULES: AutonomousRule[] = [
  {
    id: "schedule-recovery",
    label: "Schedule recovery time",
    description: "Can schedule recovery time after draining meetings",
    enabled: true,
  },
  {
    id: "decline-during-focus",
    label: "Decline during focus blocks",
    description: "Can decline meetings during focus blocks",
    enabled: false,
  },
  {
    id: "suggest-social",
    label: "Suggest social plans",
    description: "Can suggest social plans on weekends",
    enabled: true,
  },
];

interface AutonomousConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function AutonomousConfirm({
  onConfirm,
  onCancel,
}: AutonomousConfirmProps) {
  const [rules, setRules] = useState<AutonomousRule[]>(DEFAULT_RULES);

  function toggleRule(id: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }

  const anyEnabled = rules.some((r) => r.enabled);

  return (
    <Card className="border-red-200 bg-red-50/50 dark:border-red-900/60 dark:bg-slate-900/95">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-red-500 dark:text-red-300" />
          <CardTitle className="text-base">Enable Autonomous Mode</CardTitle>
        </div>
        <CardDescription className="dark:text-slate-300/85">
          Alter will act on your behalf within these rules. Review and confirm.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {rules.map((rule) => (
            <label
              key={rule.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50 dark:border-blue-900/60 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={() => toggleRule(rule.id)}
                className="mt-0.5 size-4 rounded border-muted-foreground/30 accent-red-500"
              />
              <div>
                <p className="text-sm font-medium">{rule.label}</p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">
                  {rule.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            disabled={!anyEnabled}
            onClick={onConfirm}
          >
            Confirm Autonomous Mode
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
