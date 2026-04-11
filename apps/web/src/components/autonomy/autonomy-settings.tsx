"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase } from "lucide-react";
import { AutonomyDial } from "./autonomy-dial";
import { AutonomousConfirm } from "./autonomous-confirm";

type AutonomyLevel = "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";

interface AutonomyData {
  level: AutonomyLevel;
  personalMode: AutonomyLevel;
  professionalMode: AutonomyLevel;
}

interface AutonomySettingsProps {
  userId: string;
  initial: AutonomyData | null;
}

export function AutonomySettings({ userId, initial }: AutonomySettingsProps) {
  const [personalMode, setPersonalMode] = useState<AutonomyLevel>(
    initial?.personalMode ?? "OBSERVER"
  );
  const [professionalMode, setProfessionalMode] = useState<AutonomyLevel>(
    initial?.professionalMode ?? "OBSERVER"
  );
  const [pendingLevel, setPendingLevel] = useState<{
    field: "personalMode" | "professionalMode";
    level: AutonomyLevel;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPersonalMode(initial?.personalMode ?? "OBSERVER");
    setProfessionalMode(initial?.professionalMode ?? "OBSERVER");
  }, [initial]);

  const persist = useCallback(
    async (patch: Partial<AutonomyData>) => {
      setSaving(true);
      try {
        await fetch(`/api/users/${userId}/autonomy`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const handlePersonalChange = useCallback(
    (level: AutonomyLevel) => {
      if (level === "AUTONOMOUS") {
        setPendingLevel({ field: "personalMode", level });
        return;
      }
      setPersonalMode(level);
      persist({ personalMode: level });
    },
    [persist]
  );

  const handleProfessionalChange = useCallback(
    (level: AutonomyLevel) => {
      if (level === "AUTONOMOUS") {
        setPendingLevel({ field: "professionalMode", level });
        return;
      }
      setProfessionalMode(level);
      persist({ professionalMode: level });
    },
    [persist]
  );

  const confirmAutonomous = useCallback(() => {
    if (!pendingLevel) return;
    const { field, level } = pendingLevel;
    if (field === "personalMode") setPersonalMode(level);
    else setProfessionalMode(level);
    persist({ [field]: level });
    setPendingLevel(null);
  }, [pendingLevel, persist]);

  const cancelAutonomous = useCallback(() => {
    setPendingLevel(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Personal</CardTitle>
            </div>
            <CardDescription>
              How Alter acts on personal suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AutonomyDial
              value={personalMode}
              onChange={handlePersonalChange}
              disabled={saving}
            />
          </CardContent>
        </Card>

        {/* Professional */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Professional</CardTitle>
            </div>
            <CardDescription>
              How Alter acts on work suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AutonomyDial
              value={professionalMode}
              onChange={handleProfessionalChange}
              disabled={saving}
            />
          </CardContent>
        </Card>
      </div>

      {/* Autonomous confirmation */}
      {pendingLevel && (
        <AutonomousConfirm
          onConfirm={confirmAutonomous}
          onCancel={cancelAutonomous}
        />
      )}
    </div>
  );
}
