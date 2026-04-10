import { describe, it, expect } from "vitest";
import { computeEnergyForecast } from "./compute-energy-forecast";
import type { CalendarEvent, EnergyDriver } from "./types";

function makeEvent(
  overrides: Partial<CalendarEvent> & {
    title: string;
    startTime: Date;
    endTime: Date;
  }
): CalendarEvent {
  return {
    id: "evt-1",
    userId: "user-1",
    isDrainer: false,
    isBooster: false,
    source: "test",
    createdAt: new Date(),
    ...overrides,
  };
}

function makeDriver(
  label: string,
  driverType: "ENERGIZER" | "DRAINER"
): EnergyDriver {
  return {
    id: `driver-${label}`,
    userId: "user-1",
    label,
    description: "",
    driverType,
    createdAt: new Date(),
  };
}

describe("computeEnergyForecast", () => {
  it("returns 0 for a day with no events", () => {
    const result = computeEnergyForecast([], [], ["2026-04-13"]);
    expect(result).toHaveLength(1);
    expect(result[0].predictedLevel).toBe(0);
    expect(result[0].reason).toContain("No events");
  });

  it("returns negative score for drainer events", () => {
    const events: CalendarEvent[] = [
      makeEvent({
        title: "Sprint planning",
        startTime: new Date("2026-04-13T09:00:00"),
        endTime: new Date("2026-04-13T10:00:00"),
        isDrainer: true,
      }),
      makeEvent({
        id: "evt-2",
        title: "Architecture review",
        startTime: new Date("2026-04-13T10:00:00"),
        endTime: new Date("2026-04-13T11:00:00"),
        isDrainer: true,
      }),
    ];

    const result = computeEnergyForecast(events, [], ["2026-04-13"]);
    expect(result[0].predictedLevel).toBe(-2);
  });

  it("returns positive score for booster events", () => {
    const events: CalendarEvent[] = [
      makeEvent({
        title: "Morning run",
        startTime: new Date("2026-04-13T07:00:00"),
        endTime: new Date("2026-04-13T07:45:00"),
        isBooster: true,
      }),
      makeEvent({
        id: "evt-2",
        title: "Deep work",
        startTime: new Date("2026-04-13T09:00:00"),
        endTime: new Date("2026-04-13T12:00:00"),
        isBooster: true,
      }),
    ];

    const result = computeEnergyForecast(events, [], ["2026-04-13"]);
    expect(result[0].predictedLevel).toBeGreaterThan(0);
  });

  it("amplifies impact for events matching known drivers", () => {
    const events: CalendarEvent[] = [
      makeEvent({
        title: "Morning run",
        startTime: new Date("2026-04-13T07:00:00"),
        endTime: new Date("2026-04-13T08:00:00"),
        isBooster: true,
      }),
    ];

    const drivers = [makeDriver("Morning run", "ENERGIZER")];

    const withDriver = computeEnergyForecast(events, drivers, ["2026-04-13"]);
    const withoutDriver = computeEnergyForecast(events, [], ["2026-04-13"]);

    expect(withDriver[0].predictedLevel).toBeGreaterThan(
      withoutDriver[0].predictedLevel
    );
    // 1 hour × 1 × 1.5 = 1.5 vs 1 hour × 1 × 1 = 1
    expect(withDriver[0].predictedLevel).toBe(1.5);
    expect(withoutDriver[0].predictedLevel).toBe(1);
  });

  it("clamps to [-10, +10]", () => {
    // 12 hours of draining = -12, clamped to -10
    const events: CalendarEvent[] = [
      makeEvent({
        title: "Endless meeting marathon",
        startTime: new Date("2026-04-13T06:00:00"),
        endTime: new Date("2026-04-13T18:00:00"),
        isDrainer: true,
      }),
    ];

    const result = computeEnergyForecast(events, [], ["2026-04-13"]);
    expect(result[0].predictedLevel).toBe(-10);
  });

  it("handles multiple days", () => {
    const events: CalendarEvent[] = [
      makeEvent({
        title: "Drainer",
        startTime: new Date("2026-04-13T09:00:00"),
        endTime: new Date("2026-04-13T10:00:00"),
        isDrainer: true,
      }),
      makeEvent({
        id: "evt-2",
        title: "Booster",
        startTime: new Date("2026-04-14T09:00:00"),
        endTime: new Date("2026-04-14T10:00:00"),
        isBooster: true,
      }),
    ];

    const result = computeEnergyForecast(events, [], [
      "2026-04-13",
      "2026-04-14",
      "2026-04-15",
    ]);
    expect(result).toHaveLength(3);
    expect(result[0].predictedLevel).toBeLessThan(0);
    expect(result[1].predictedLevel).toBeGreaterThan(0);
    expect(result[2].predictedLevel).toBe(0);
  });

  it("neutral events contribute zero impact", () => {
    const events: CalendarEvent[] = [
      makeEvent({
        title: "Team standup",
        startTime: new Date("2026-04-13T10:00:00"),
        endTime: new Date("2026-04-13T10:15:00"),
        isDrainer: false,
        isBooster: false,
      }),
    ];

    const result = computeEnergyForecast(events, [], ["2026-04-13"]);
    expect(result[0].predictedLevel).toBe(0);
  });
});
