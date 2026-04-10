"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Eye, MessageSquare, FileEdit, Zap } from "lucide-react";

type AutonomyLevel = "OBSERVER" | "ADVISOR" | "COPILOT" | "AUTONOMOUS";

const LEVELS: {
  value: AutonomyLevel;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  ringColor: string;
  dotColor: string;
}[] = [
  {
    value: "OBSERVER",
    label: "Observer",
    tagline: "Alter reflects, no actions",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    ringColor: "ring-blue-500",
    dotColor: "bg-blue-500",
  },
  {
    value: "ADVISOR",
    label: "Advisor",
    tagline: "Alter suggests, you decide",
    icon: MessageSquare,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    ringColor: "ring-amber-500",
    dotColor: "bg-amber-500",
  },
  {
    value: "COPILOT",
    label: "Co-pilot",
    tagline: "Alter prepares, you confirm",
    icon: FileEdit,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    ringColor: "ring-orange-500",
    dotColor: "bg-orange-500",
  },
  {
    value: "AUTONOMOUS",
    label: "Autonomous",
    tagline: "Alter acts within your rules",
    icon: Zap,
    color: "text-red-600",
    bgColor: "bg-red-50",
    ringColor: "ring-red-500",
    dotColor: "bg-red-500",
  },
];

const LEVEL_INDEX: Record<AutonomyLevel, number> = {
  OBSERVER: 0,
  ADVISOR: 1,
  COPILOT: 2,
  AUTONOMOUS: 3,
};

interface AutonomyDialProps {
  value: AutonomyLevel;
  onChange: (level: AutonomyLevel) => void;
  disabled?: boolean;
}

export function AutonomyDial({ value, onChange, disabled }: AutonomyDialProps) {
  const currentIndex = LEVEL_INDEX[value];
  const current = LEVELS[currentIndex];
  const CurrentIcon = current.icon;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleClick = useCallback(
    (level: AutonomyLevel) => {
      if (!disabled) onChange(level);
    },
    [disabled, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Track */}
      <div className="relative flex items-center justify-between px-2">
        {/* Background rail */}
        <div className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
        {/* Filled rail */}
        <div
          className={cn(
            "absolute left-2 top-1/2 h-1 -translate-y-1/2 rounded-full transition-all duration-300",
            current.dotColor
          )}
          style={{
            width: `${(currentIndex / (LEVELS.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        {LEVELS.map((level, i) => {
          const Icon = level.icon;
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const isHovered = hoveredIndex === i;

          return (
            <button
              key={level.value}
              type="button"
              disabled={disabled}
              className={cn(
                "relative z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isCurrent && [
                  level.bgColor,
                  level.color,
                  "border-current",
                  "scale-110",
                  `focus-visible:${level.ringColor}`,
                ],
                isActive &&
                  !isCurrent && [
                    "border-current",
                    level.color,
                    "bg-background",
                  ],
                !isActive && [
                  "border-muted-foreground/30",
                  "text-muted-foreground/50",
                  "bg-background",
                ],
                !disabled && "cursor-pointer hover:scale-110",
                disabled && "cursor-not-allowed opacity-50"
              )}
              onClick={() => handleClick(level.value)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              aria-label={`Set autonomy to ${level.label}`}
            >
              <Icon className="size-4" />
              {/* Tooltip on hover */}
              {isHovered && !isCurrent && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md">
                  {level.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Current level label */}
      <div
        className={cn(
          "rounded-lg px-4 py-3 text-center transition-all duration-300",
          current.bgColor
        )}
      >
        <p className={cn("text-sm font-semibold", current.color)}>
          <CurrentIcon className="mr-1.5 inline-block size-4" />
          {current.label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {current.tagline}
        </p>
      </div>
    </div>
  );
}
