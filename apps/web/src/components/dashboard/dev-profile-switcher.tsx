"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileOption {
  id: string;
  label: string;
  description: string;
  autonomyLevel: string;
}

export function DevProfileSwitcher({
  profiles,
  activeProfileId,
}: {
  profiles: ProfileOption[];
  activeProfileId?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);

  function updateProfile(profileId: string | null) {
    startTransition(async () => {
      await fetch("/api/dev/mock-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      router.refresh();
    });
  }

  return (
    <Card className="border-dashed bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Demo Persona</CardTitle>
            <CardDescription>
              Swap the dashboard between mock lifestyles and autonomy levels.
            </CardDescription>
          </div>
          {activeProfile && <Badge variant="secondary">Mock Data</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeProfileId ? "outline" : "default"}
            className="h-8"
            disabled={isPending}
            onClick={() => updateProfile(null)}
          >
            Live User
          </Button>
          {profiles.map((profile) => (
            <Button
              key={profile.id}
              size="sm"
              variant={activeProfileId === profile.id ? "default" : "outline"}
              className="h-8"
              disabled={isPending}
              onClick={() => updateProfile(profile.id)}
            >
              {profile.label}
            </Button>
          ))}
        </div>

        <div
          className={cn(
            "rounded-lg border bg-background px-3 py-2 text-xs",
            !activeProfile && "text-muted-foreground"
          )}
        >
          {activeProfile ? (
            <>
              <p className="font-medium">{activeProfile.label}</p>
              <p className="mt-1 text-muted-foreground">
                {activeProfile.description}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                Autonomy {activeProfile.autonomyLevel.toLowerCase()}
              </p>
            </>
          ) : (
            <p>Using the seeded user from the database.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
