import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Alter database...");

  // ── User ──────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "steinar@alter.dev" },
    update: {},
    create: {
      name: "Steinar Nilsen",
      email: "steinar@alter.dev",
    },
  });

  console.log(`  ✓ User: ${user.name} (${user.id})`);

  // ── Persona Card ──────────────────────────────────────────────────────
  await prisma.personaCard.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      summary:
        "A driven software engineer who thrives in deep focus and structured problem-solving. Values continuous learning and physical activity as counterbalances to intense work. Prefers clear boundaries between work and personal time.",
      communicationStyle:
        "Direct and concise. Prefers async communication over meetings. Values context-rich messages over brief pings. Appreciates when people get to the point.",
      boundaryNotes:
        "Protects morning focus time (before 10am). No meetings on Fridays. Needs recovery time after back-to-back commitments. Weekends are largely off-limits for work.",
      confirmedAt: new Date(),
    },
  });

  console.log("  ✓ Persona card");

  // ── Energy Drivers ────────────────────────────────────────────────────
  const energyDrivers = [
    {
      label: "Deep focus coding",
      description:
        "Extended uninterrupted programming sessions where complex problems get solved. Produces a state of flow.",
      driverType: "ENERGIZER" as const,
    },
    {
      label: "Back-to-back meetings",
      description:
        "Consecutive meetings with no breaks leave no time for context switching or processing. Mentally exhausting.",
      driverType: "DRAINER" as const,
    },
    {
      label: "Morning run",
      description:
        "A 30-45 minute run before work clears the mind and sets energy for the day.",
      driverType: "ENERGIZER" as const,
    },
    {
      label: "Admin tasks",
      description:
        "Expense reports, time tracking, and form-filling. Necessary but tedious and mentally draining.",
      driverType: "DRAINER" as const,
    },
  ];

  for (const driver of energyDrivers) {
    await prisma.energyDriver.upsert({
      where: {
        id: `seed-driver-${driver.label.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `seed-driver-${driver.label.toLowerCase().replace(/\s+/g, "-")}`,
        userId: user.id,
        ...driver,
      },
    });
  }

  console.log(`  ✓ ${energyDrivers.length} energy drivers`);

  // ── Goals ─────────────────────────────────────────────────────────────
  const goals = [
    {
      title: "Learn Rust",
      description:
        "Build proficiency in Rust for systems programming. Complete the Rust Book and build a CLI tool.",
      category: "PROFESSIONAL" as const,
    },
    {
      title: "Run a half marathon",
      description:
        "Train for and complete a half marathon by end of year. Currently running 10km comfortably.",
      category: "PERSONAL" as const,
    },
  ];

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: {
        id: `seed-goal-${goal.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `seed-goal-${goal.title.toLowerCase().replace(/\s+/g, "-")}`,
        userId: user.id,
        ...goal,
      },
    });
  }

  console.log(`  ✓ ${goals.length} goals`);

  // ── Priorities ────────────────────────────────────────────────────────
  const priorities = [
    { dimension: "WORK" as const, importance: 8 },
    { dimension: "REST" as const, importance: 6 },
    { dimension: "SOCIAL" as const, importance: 5 },
    { dimension: "GROWTH" as const, importance: 7 },
  ];

  for (const priority of priorities) {
    await prisma.priority.upsert({
      where: {
        userId_dimension: {
          userId: user.id,
          dimension: priority.dimension,
        },
      },
      update: { importance: priority.importance },
      create: {
        userId: user.id,
        ...priority,
      },
    });
  }

  console.log(`  ✓ ${priorities.length} priorities`);

  // ── Autonomy Setting ──────────────────────────────────────────────────
  await prisma.autonomySetting.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      level: "ADVISOR",
      personalMode: "ADVISOR",
      professionalMode: "COPILOT",
    },
  });

  console.log("  ✓ Autonomy setting (ADVISOR)");

  // ── Calendar Events (sample week: Mon Apr 13 – Fri Apr 17, 2026) ────
  const weekStart = new Date("2026-04-13T00:00:00");

  const calendarEvents = [
    // Monday
    {
      title: "Morning run",
      startTime: new Date("2026-04-13T07:00:00"),
      endTime: new Date("2026-04-13T07:45:00"),
      isDrainer: false,
      isBooster: true,
    },
    {
      title: "Team standup",
      startTime: new Date("2026-04-13T10:00:00"),
      endTime: new Date("2026-04-13T10:15:00"),
      isDrainer: false,
      isBooster: false,
    },
    {
      title: "Focus: Rust learning",
      startTime: new Date("2026-04-13T10:30:00"),
      endTime: new Date("2026-04-13T12:30:00"),
      isDrainer: false,
      isBooster: true,
    },
    {
      title: "1:1 with manager",
      startTime: new Date("2026-04-13T14:00:00"),
      endTime: new Date("2026-04-13T14:30:00"),
      isDrainer: false,
      isBooster: false,
    },
    // Tuesday
    {
      title: "Sprint planning",
      startTime: new Date("2026-04-14T09:00:00"),
      endTime: new Date("2026-04-14T10:00:00"),
      isDrainer: true,
      isBooster: false,
    },
    {
      title: "Architecture review",
      startTime: new Date("2026-04-14T10:00:00"),
      endTime: new Date("2026-04-14T11:00:00"),
      isDrainer: true,
      isBooster: false,
    },
    {
      title: "Design sync",
      startTime: new Date("2026-04-14T11:00:00"),
      endTime: new Date("2026-04-14T11:30:00"),
      isDrainer: true,
      isBooster: false,
    },
    {
      title: "Stakeholder demo",
      startTime: new Date("2026-04-14T13:00:00"),
      endTime: new Date("2026-04-14T14:00:00"),
      isDrainer: true,
      isBooster: false,
    },
    {
      title: "Retro",
      startTime: new Date("2026-04-14T14:00:00"),
      endTime: new Date("2026-04-14T15:00:00"),
      isDrainer: true,
      isBooster: false,
    },
    {
      title: "Admin: expenses & timesheets",
      startTime: new Date("2026-04-14T15:00:00"),
      endTime: new Date("2026-04-14T16:00:00"),
      isDrainer: true,
      isBooster: false,
    },
    // Wednesday
    {
      title: "Morning run",
      startTime: new Date("2026-04-15T07:00:00"),
      endTime: new Date("2026-04-15T07:45:00"),
      isDrainer: false,
      isBooster: true,
    },
    {
      title: "Deep work: feature implementation",
      startTime: new Date("2026-04-15T09:00:00"),
      endTime: new Date("2026-04-15T12:00:00"),
      isDrainer: false,
      isBooster: true,
    },
    {
      title: "Lunch with colleagues",
      startTime: new Date("2026-04-15T12:00:00"),
      endTime: new Date("2026-04-15T13:00:00"),
      isDrainer: false,
      isBooster: true,
    },
    {
      title: "Code review session",
      startTime: new Date("2026-04-15T14:00:00"),
      endTime: new Date("2026-04-15T15:00:00"),
      isDrainer: false,
      isBooster: false,
    },
    // Thursday
    {
      title: "Team standup",
      startTime: new Date("2026-04-16T10:00:00"),
      endTime: new Date("2026-04-16T10:15:00"),
      isDrainer: false,
      isBooster: false,
    },
    {
      title: "Focus: Rust learning",
      startTime: new Date("2026-04-16T10:30:00"),
      endTime: new Date("2026-04-16T12:30:00"),
      isDrainer: false,
      isBooster: true,
    },
    {
      title: "Hiring panel interview",
      startTime: new Date("2026-04-16T14:00:00"),
      endTime: new Date("2026-04-16T15:00:00"),
      isDrainer: true,
      isBooster: false,
    },
    // Friday (no meetings — protected day)
    {
      title: "Morning run",
      startTime: new Date("2026-04-17T07:00:00"),
      endTime: new Date("2026-04-17T07:45:00"),
      isDrainer: false,
      isBooster: true,
    },
    {
      title: "Open deep work block",
      startTime: new Date("2026-04-17T09:00:00"),
      endTime: new Date("2026-04-17T16:00:00"),
      isDrainer: false,
      isBooster: true,
    },
    // Weekend
    {
      title: "Long run (half marathon training)",
      startTime: new Date("2026-04-18T08:00:00"),
      endTime: new Date("2026-04-18T10:00:00"),
      isDrainer: false,
      isBooster: true,
    },
    {
      title: "Dinner with friends",
      startTime: new Date("2026-04-18T18:00:00"),
      endTime: new Date("2026-04-18T21:00:00"),
      isDrainer: false,
      isBooster: true,
    },
  ];

  // Delete existing seed events for this user then recreate
  await prisma.calendarEvent.deleteMany({
    where: {
      userId: user.id,
      startTime: { gte: weekStart },
    },
  });

  for (const event of calendarEvents) {
    await prisma.calendarEvent.create({
      data: {
        userId: user.id,
        ...event,
        source: "seed",
      },
    });
  }

  console.log(`  ✓ ${calendarEvents.length} calendar events`);

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
