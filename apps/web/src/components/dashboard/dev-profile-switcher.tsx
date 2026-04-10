"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronRight, Users } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);

  function updateProfile(profileId: string | null) {
    startTransition(async () => {
      await fetch("/api/dev/mock-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-end gap-2">
        {activeProfile ? (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {activeProfile.label}
          </Badge>
        ) : (
          <Badge variant="outline" className="hidden sm:inline-flex">
            Live User
          </Badge>
        )}
        <SheetTrigger asChild>
          <Button size="sm" variant="outline" className="h-9 gap-2">
            <Users className="size-4" />
            Switch User
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <SheetTitle>Switch Demo Persona</SheetTitle>
            {activeProfile && <Badge variant="secondary">Mock Data</Badge>}
          </div>
          <SheetDescription>
            Swap the dashboard between mock lifestyles and autonomy levels.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <button
            type="button"
            className={cn(
              "flex w-full items-start justify-between rounded-xl border p-4 text-left transition-colors",
              !activeProfileId
                ? "border-foreground bg-muted/40"
                : "hover:bg-muted/40"
            )}
            disabled={isPending}
            onClick={() => updateProfile(null)}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">Live User</p>
              <p className="text-xs text-muted-foreground">
                Use the seeded user from the database.
              </p>
            </div>
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </button>

          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className={cn(
                "flex w-full items-start justify-between rounded-xl border p-4 text-left transition-colors",
                activeProfileId === profile.id
                  ? "border-foreground bg-muted/40"
                  : "hover:bg-muted/40"
              )}
              disabled={isPending}
              onClick={() => updateProfile(profile.id)}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{profile.label}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {profile.autonomyLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.description}
                </p>
              </div>
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
