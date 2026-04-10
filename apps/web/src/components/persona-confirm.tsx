"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  BatteryLow,
  Target,
  BarChart3,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PersonaConfirmProps {
  persona: {
    summary: string;
    communicationStyle: string;
    boundaryNotes: string;
    confirmed: boolean;
  };
  energyDrivers: Array<{
    label: string;
    description: string;
    driverType: "ENERGIZER" | "DRAINER";
  }>;
  goals: Array<{
    title: string;
    description: string;
    category: "PROFESSIONAL" | "PERSONAL";
  }>;
  priorities: Array<{
    dimension: "WORK" | "REST" | "SOCIAL" | "GROWTH";
    importance: number;
  }>;
  autonomyLevel: "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";
  mode?: "onboarding" | "profile";
}

const AUTONOMY_LABELS: Record<string, string> = {
  OBSERVER: "Observer — Show me insights, I'll decide everything",
  ADVISOR: "Advisor — Suggest actions, I'll approve them",
  COPILOT: "Co-pilot — Prepare actions, I'll confirm them",
  AUTONOMOUS: "Autonomous — Act within my rules, tell me what you did",
};

export function PersonaConfirm({
  persona,
  energyDrivers,
  goals,
  priorities,
  autonomyLevel,
  mode = "onboarding",
}: PersonaConfirmProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    const response = await fetch("/api/onboarding/confirm-persona", {
      method: "POST",
    });
    if (response.ok) {
      router.push("/dashboard");
    } else {
      setConfirming(false);
    }
  }

  function handleRevise() {
    router.push("/onboarding");
  }

  const energizers = energyDrivers.filter((d) => d.driverType === "ENERGIZER");
  const drainers = energyDrivers.filter((d) => d.driverType === "DRAINER");
  const isProfileView = mode === "profile";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Sparkles className="size-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">
          {isProfileView ? "My Profile" : "Your Persona Card"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isProfileView
            ? "Review the persona Alter is using to interpret your energy, goals, and boundaries."
            : "Review what Alter learned about you. Confirm to start using your dashboard, or revise by continuing the conversation."}
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Who you are</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">
          {persona.summary}
        </CardContent>
      </Card>

      {/* Energy Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Energy Map</CardTitle>
          <CardDescription>What gives and takes your energy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {energizers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="size-4 text-green-600" />
                Energisers
              </div>
              {energizers.map((d) => (
                <div key={d.label} className="ml-6 space-y-0.5">
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.description}
                  </p>
                </div>
              ))}
            </div>
          )}
          {drainers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BatteryLow className="size-4 text-red-500" />
                Drainers
              </div>
              {drainers.map((d) => (
                <div key={d.label} className="ml-6 space-y-0.5">
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.map((g) => (
            <div key={g.title} className="flex items-start gap-3">
              <Target className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{g.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {g.category === "PROFESSIONAL" ? "Work" : "Personal"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {g.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Life Priorities</CardTitle>
          <CardDescription>How you want to balance your time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {priorities.map((p) => (
              <div
                key={p.dimension}
                className="flex flex-col items-center gap-1 rounded-lg border p-3"
              >
                <BarChart3 className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  {p.dimension}
                </span>
                <span className="text-2xl font-bold">{p.importance}</span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication & Boundaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication & Boundaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Communication style</p>
            <p className="text-muted-foreground">
              {persona.communicationStyle}
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Boundaries</p>
            <p className="text-muted-foreground">{persona.boundaryNotes}</p>
          </div>
        </CardContent>
      </Card>

      {/* Autonomy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Autonomy Level</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-sm">
            {AUTONOMY_LABELS[autonomyLevel]}
          </Badge>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        {isProfileView ? (
          <>
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              className="flex-1"
            >
              <Check className="size-4" />
              Back to dashboard
            </Button>
            <Button
              onClick={handleRevise}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <RotateCcw className="size-4" />
              Retake onboarding
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleConfirm}
              disabled={confirming}
              size="lg"
              className="flex-1"
            >
              {confirming ? (
                "Confirming..."
              ) : (
                <>
                  <Check className="size-4" />
                  Looks good — let&apos;s go
                </>
              )}
            </Button>
            <Button
              onClick={handleRevise}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <RotateCcw className="size-4" />
              Revise
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
