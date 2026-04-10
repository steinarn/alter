import { describe, it, expect } from "vitest";
import { computeBalanceScores } from "./compute-balance-scores";
import type { CalendarEvent, Priority } from "./types";

function makeEvent(
  title: string,
  startTime: Date,
  endTime: Date
): CalendarEvent {
  return {
    id: `evt-${title}`,
    userId: "user-1",
    title,
    startTime,
    endTime,
    isDrainer: false,
    isBooster: false,
    source: "test",
    createdAt: new Date(),
  };
}

function makePriority(
  dimension: "WORK" | "REST" | "SOCIAL" | "GROWTH",
  importance: number
): Priority {
  return {
    id: `pri-${dimension}`,
    userId: "user-1",
    dimension,
    importance,
    notes: null,
    createdAt: new Date(),
  };
}

describe("computeBalanceScores", () => {
  it("returns zero scores when there are no events", () => {
    const priorities = [
      makePriority("WORK", 8),
      makePriority("REST", 6),
      makePriority("SOCIAL", 5),
      makePriority("GROWTH", 7),
    ];

    const result = computeBalanceScores([], priorities);
    expect(result).toHaveLength(4);
    for (const r of result) {
      expect(r.score).toBe(0);
    }
  });

  it("allocates work events to WORK dimension", () => {
    const events = [
      makeEvent("Sprint planning", new Date("2026-04-13T09:00"), new Date("2026-04-13T10:00")),
      makeEvent("Architecture review", new Date("2026-04-13T10:00"), new Date("2026-04-13T11:00")),
    ];
    const priorities = [makePriority("WORK", 8)];

    const result = computeBalanceScores(events, priorities);
    const work = result.find((r) => r.dimension === "WORK")!;
    expect(work.score).toBe(10); // all events are work
  });

  it("allocates growth events correctly", () => {
    const events = [
      makeEvent("Rust learning session", new Date("2026-04-13T09:00"), new Date("2026-04-13T11:00")),
      makeEvent("Morning run", new Date("2026-04-13T07:00"), new Date("2026-04-13T08:00")),
    ];
    const priorities = [makePriority("GROWTH", 7)];

    const result = computeBalanceScores(events, priorities);
    const growth = result.find((r) => r.dimension === "GROWTH")!;
    expect(growth.score).toBe(10); // all events → growth
  });

  it("computes delta between score and target", () => {
    const events = [
      makeEvent("Sprint planning", new Date("2026-04-13T09:00"), new Date("2026-04-13T12:00")),
      makeEvent("Lunch with friends", new Date("2026-04-13T12:00"), new Date("2026-04-13T13:00")),
    ];
    const priorities = [
      makePriority("WORK", 5),
      makePriority("SOCIAL", 8),
    ];

    const result = computeBalanceScores(events, priorities);
    const work = result.find((r) => r.dimension === "WORK")!;
    const social = result.find((r) => r.dimension === "SOCIAL")!;

    // 3h work out of 4h total = 7.5 score, target 5 → delta +2.5
    expect(work.score).toBe(7.5);
    expect(work.delta).toBe(2.5);

    // 1h social out of 4h total = 2.5 score, target 8 → delta -5.5
    expect(social.score).toBe(2.5);
    expect(social.delta).toBe(-5.5);
  });

  it("defaults target to 5 if no priority is set", () => {
    const events = [
      makeEvent("Break time", new Date("2026-04-13T12:00"), new Date("2026-04-13T13:00")),
    ];

    const result = computeBalanceScores(events, []);
    const rest = result.find((r) => r.dimension === "REST")!;
    expect(rest.target).toBe(5);
  });
});
