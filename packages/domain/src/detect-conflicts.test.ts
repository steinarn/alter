import { describe, it, expect } from "vitest";
import { detectConflicts } from "./detect-conflicts";
import type { CalendarEvent } from "./types";

function makeEvent(
  id: string,
  title: string,
  start: string,
  end: string,
  opts: { isDrainer?: boolean; isBooster?: boolean } = {}
): CalendarEvent {
  return {
    id,
    userId: "user-1",
    title,
    startTime: new Date(start),
    endTime: new Date(end),
    isDrainer: opts.isDrainer ?? false,
    isBooster: opts.isBooster ?? false,
    source: "test",
    createdAt: new Date(),
  };
}

describe("detectConflicts", () => {
  it("returns no conflicts for an empty schedule", () => {
    expect(detectConflicts([])).toEqual([]);
  });

  it("returns no conflicts when drainers are not consecutive", () => {
    const events = [
      makeEvent("1", "Meeting A", "2026-04-13T09:00", "2026-04-13T10:00", {
        isDrainer: true,
      }),
      makeEvent("2", "Morning run", "2026-04-13T10:00", "2026-04-13T10:45", {
        isBooster: true,
      }),
      makeEvent("3", "Meeting B", "2026-04-13T11:00", "2026-04-13T12:00", {
        isDrainer: true,
      }),
    ];

    expect(detectConflicts(events)).toEqual([]);
  });

  it("flags ≥3 consecutive drainer events", () => {
    const events = [
      makeEvent("1", "Sprint planning", "2026-04-13T09:00", "2026-04-13T10:00", {
        isDrainer: true,
      }),
      makeEvent("2", "Architecture review", "2026-04-13T10:00", "2026-04-13T11:00", {
        isDrainer: true,
      }),
      makeEvent("3", "Design sync", "2026-04-13T11:00", "2026-04-13T11:30", {
        isDrainer: true,
      }),
    ];

    const conflicts = detectConflicts(events);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe("consecutive_drainers");
    expect(conflicts[0].events).toHaveLength(3);
    expect(conflicts[0].severity).toBe("warning");
  });

  it("flags critical severity for 5+ consecutive drainers", () => {
    const events = [
      makeEvent("1", "M1", "2026-04-13T09:00", "2026-04-13T09:30", { isDrainer: true }),
      makeEvent("2", "M2", "2026-04-13T09:30", "2026-04-13T10:00", { isDrainer: true }),
      makeEvent("3", "M3", "2026-04-13T10:00", "2026-04-13T10:30", { isDrainer: true }),
      makeEvent("4", "M4", "2026-04-13T10:30", "2026-04-13T11:00", { isDrainer: true }),
      makeEvent("5", "M5", "2026-04-13T11:00", "2026-04-13T11:30", { isDrainer: true }),
    ];

    const conflicts = detectConflicts(events);
    expect(conflicts[0].severity).toBe("critical");
  });

  it("allows 15 min gaps between consecutive drainers", () => {
    const events = [
      makeEvent("1", "M1", "2026-04-13T09:00", "2026-04-13T10:00", { isDrainer: true }),
      makeEvent("2", "M2", "2026-04-13T10:15", "2026-04-13T11:00", { isDrainer: true }),
      makeEvent("3", "M3", "2026-04-13T11:10", "2026-04-13T12:00", { isDrainer: true }),
    ];

    const conflicts = detectConflicts(events);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe("consecutive_drainers");
  });

  it("breaks consecutive run if gap > 15 min", () => {
    const events = [
      makeEvent("1", "M1", "2026-04-13T09:00", "2026-04-13T10:00", { isDrainer: true }),
      makeEvent("2", "M2", "2026-04-13T10:00", "2026-04-13T11:00", { isDrainer: true }),
      // 30 min gap
      makeEvent("3", "M3", "2026-04-13T11:30", "2026-04-13T12:00", { isDrainer: true }),
    ];

    // Two runs: [M1, M2] (length 2, not flagged) and [M3] (length 1, not flagged)
    const conflicts = detectConflicts(events);
    const consecutiveConflicts = conflicts.filter(
      (c) => c.type === "consecutive_drainers"
    );
    expect(consecutiveConflicts).toEqual([]);
  });

  it("flags no-recovery for long drainer sandwiched between events", () => {
    const events = [
      makeEvent("1", "Short meeting", "2026-04-13T08:00", "2026-04-13T08:50", {
        isDrainer: true,
      }),
      makeEvent("2", "Long drainer", "2026-04-13T09:00", "2026-04-13T11:00", {
        isDrainer: true,
      }),
      makeEvent("3", "Another meeting", "2026-04-13T11:10", "2026-04-13T12:00", {
        isDrainer: true,
      }),
    ];

    const conflicts = detectConflicts(events);
    const noRecovery = conflicts.filter((c) => c.type === "no_recovery");
    expect(noRecovery).toHaveLength(1);
    expect(noRecovery[0].events[0].title).toBe("Long drainer");
  });

  it("does not flag no-recovery when there is a 30min gap after", () => {
    const events = [
      makeEvent("1", "Long drainer", "2026-04-13T09:00", "2026-04-13T11:00", {
        isDrainer: true,
      }),
      // 30 min gap before next event
      makeEvent("2", "Next thing", "2026-04-13T11:30", "2026-04-13T12:00", {
        isDrainer: false,
      }),
    ];

    const conflicts = detectConflicts(events);
    const noRecovery = conflicts.filter((c) => c.type === "no_recovery");
    expect(noRecovery).toHaveLength(0);
  });

  it("does not flag no-recovery if a booster event is adjacent", () => {
    const events = [
      makeEvent("1", "Quick run", "2026-04-13T08:00", "2026-04-13T08:45", {
        isBooster: true,
      }),
      makeEvent("2", "Long drainer", "2026-04-13T09:00", "2026-04-13T11:00", {
        isDrainer: true,
      }),
      makeEvent("3", "Another drainer", "2026-04-13T11:05", "2026-04-13T12:00", {
        isDrainer: true,
      }),
    ];

    const conflicts = detectConflicts(events);
    const noRecovery = conflicts.filter((c) => c.type === "no_recovery");
    // Before the long drainer there's a booster → counts as recovery
    expect(noRecovery).toHaveLength(0);
  });
});
