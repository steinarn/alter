import {
  computeBalanceScores,
  computeEnergyForecast,
  detectConflicts,
  filterSuggestionsByAutonomy,
  generateSuggestionCriteria,
  type AutonomyLevel,
  type AutonomySetting,
  type BalanceDimension,
  type CalendarEvent,
  type EnergyDriver,
  type Goal,
  type GoalCategory,
  type PersonaCard,
  type Priority,
  type Suggestion,
  type SuggestionAction,
  type SuggestionMode,
  type SuggestionStatus,
  type User,
} from "@alter/domain";

export const MOCK_PROFILE_COOKIE = "alter-mock-profile";

export type MockProfileId =
  | "busy-professional"
  | "student"
  | "parent"
  | "retiree";

export interface MockProfileSummary {
  id: MockProfileId;
  label: string;
  description: string;
  autonomyLevel: AutonomyLevel;
  userId: string;
}

export interface MockSuggestionRecord extends Suggestion {
  actions: SuggestionAction[];
}

interface MockSuggestionTemplate {
  mode: SuggestionMode;
  title: string;
  description: string;
  reason: string;
  autonomyLevelRequired: AutonomyLevel;
  actionType: string;
  actionPayload: Record<string, unknown>;
}

interface MockProfile {
  id: MockProfileId;
  label: string;
  description: string;
  user: User;
  personaCard: PersonaCard;
  energyDrivers: EnergyDriver[];
  goals: Goal[];
  priorities: Priority[];
  autonomySetting: AutonomySetting;
  calendarEvents: CalendarEvent[];
  suggestionHistory: MockSuggestionRecord[];
  generationTemplates: MockSuggestionTemplate[];
}

export function isMockProfilesEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_MOCK_PROFILES === "true"
  );
}

export function isMockUserId(userId: string) {
  return userId.startsWith("mock-");
}

export function isMockSuggestionId(suggestionId: string) {
  return suggestionId.startsWith("mock-");
}

export function getMockProfileSummaries(): MockProfileSummary[] {
  return buildMockProfiles().map((profile) => ({
    id: profile.id,
    label: profile.label,
    description: profile.description,
    autonomyLevel: profile.autonomySetting.level,
    userId: profile.user.id,
  }));
}

export function getMockProfile(id?: string | null): MockProfile | null {
  if (!id) return null;
  return buildMockProfiles().find((profile) => profile.id === id) ?? null;
}

export function getMockProfileByUserId(userId: string): MockProfile | null {
  return (
    buildMockProfiles().find((profile) => profile.user.id === userId) ?? null
  );
}

export function findMockSuggestionById(
  suggestionId: string
): MockSuggestionRecord | null {
  for (const profile of buildMockProfiles()) {
    const match = profile.suggestionHistory.find((item) => item.id === suggestionId);
    if (match) return match;
  }

  return null;
}

export function getMockSuggestions(profile: MockProfile) {
  return [...profile.suggestionHistory].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function buildMockDashboardData(profile: MockProfile) {
  const now = new Date();
  const start = startOfDay(now);
  const end = addDays(start, 7);

  const calendarEvents = profile.calendarEvents
    .filter((event) => event.startTime >= start && event.startTime < end)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(start, index).toISOString().slice(0, 10)
  );

  const forecast = computeEnergyForecast(
    calendarEvents,
    profile.energyDrivers,
    days
  );
  const balance = computeBalanceScores(calendarEvents, profile.priorities);
  const conflicts = detectConflicts(calendarEvents);
  const criteria = generateSuggestionCriteria(
    forecast,
    balance,
    conflicts,
    profile.goals
  );
  const suggestions = filterSuggestionsByAutonomy(
    criteria,
    profile.autonomySetting.level
  );

  return {
    forecast,
    balance,
    conflicts,
    suggestions,
    persistedSuggestions: getMockSuggestions(profile).filter(
      (suggestion) => suggestion.status === "PENDING"
    ),
    calendarEvents,
    autonomy: profile.autonomySetting,
  };
}

export function generateMockSuggestions(
  profile: MockProfile,
  mode: SuggestionMode
) {
  const now = new Date();

  return profile.generationTemplates
    .filter((template) => template.mode === mode)
    .map((template, index) => {
      const suggestionId = `mock-${profile.id}-generated-${mode.toLowerCase()}-${index + 1}-${globalThis.crypto.randomUUID()}`;
      return {
        id: suggestionId,
        userId: profile.user.id,
        mode: template.mode,
        title: template.title,
        description: template.description,
        reason: template.reason,
        status: "PENDING" as const,
        autonomyLevelRequired: template.autonomyLevelRequired,
        createdAt: now,
        actions: [
          {
            id: `${suggestionId}-action`,
            suggestionId,
            actionType: template.actionType,
            payload: template.actionPayload,
            executedAt: null,
          },
        ],
      };
    });
}

function buildMockProfiles(): MockProfile[] {
  return [
    buildBusyProfessionalProfile(),
    buildStudentProfile(),
    buildParentProfile(),
    buildRetireeProfile(),
  ];
}

function buildBusyProfessionalProfile(): MockProfile {
  const profileId = "busy-professional";
  const userId = `mock-${profileId}`;

  return {
    id: profileId,
    label: "Busy Professional",
    description:
      "Back-to-back meetings, high work ambition, and just enough recovery time to show overload risk.",
    user: createUser(userId, "Maya Chen", "maya.demo@alter.dev"),
    personaCard: createPersonaCard(
      userId,
      "Senior product lead balancing leadership visibility with deep work and family time.",
      "Direct, calm, and action-oriented.",
      "Protect evenings after 18:30 and avoid stacking more than three draining meetings."
    ),
    energyDrivers: [
      createDriver(
        userId,
        "Lunch walk",
        "A short midday reset lifts her energy.",
        "ENERGIZER"
      ),
      createDriver(
        userId,
        "Stakeholder planning",
        "Cross-functional planning drains focus quickly.",
        "DRAINER"
      ),
      createDriver(
        userId,
        "Interview loop",
        "Concentrated interview blocks are mentally expensive.",
        "DRAINER"
      ),
    ],
    goals: [
      createGoal(
        userId,
        "Ship Q2 planning memo",
        "Turn leadership notes into a clear plan for the next release cycle.",
        "PROFESSIONAL"
      ),
      createGoal(
        userId,
        "Protect weekday dinner",
        "Keep at least three evenings free for family dinner this week.",
        "PERSONAL"
      ),
    ],
    priorities: [
      createPriority(userId, "WORK", 8),
      createPriority(userId, "REST", 7),
      createPriority(userId, "SOCIAL", 5),
      createPriority(userId, "GROWTH", 4),
    ],
    autonomySetting: createAutonomySetting(userId, "COPILOT", "ADVISOR", "COPILOT"),
    calendarEvents: [
      createEvent(userId, "leadership-standup", "Leadership standup", 0, 9, 10, {
        isDrainer: true,
      }),
      createEvent(
        userId,
        "architecture-review",
        "Architecture review",
        0,
        10,
        11,
        { isDrainer: true, minuteStart: 15, minuteEnd: 15 }
      ),
      createEvent(
        userId,
        "stakeholder-planning",
        "Stakeholder planning",
        0,
        11,
        12,
        { isDrainer: true, minuteStart: 30, minuteEnd: 45 }
      ),
      createEvent(userId, "lunch-walk", "Lunch walk", 0, 13, 14, {
        isBooster: true,
        minuteStart: 0,
        minuteEnd: 0,
      }),
      createEvent(userId, "deep-work", "Deep work block", 0, 15, 17),
      createEvent(userId, "interview-loop", "Interview loop", 1, 9, 12, {
        isDrainer: true,
      }),
      createEvent(userId, "coffee-mentor", "Coffee with mentor", 1, 13, 14, {
        isBooster: true,
      }),
      createEvent(userId, "sprint-planning", "Sprint planning", 1, 14, 16, {
        isDrainer: true,
        minuteStart: 30,
      }),
      createEvent(userId, "strategy-workshop", "Strategy workshop", 2, 9, 11, {
        isDrainer: true,
      }),
      createEvent(userId, "budget-review", "Budget review", 2, 11, 12, {
        isDrainer: true,
        minuteStart: 15,
        minuteEnd: 15,
      }),
      createEvent(userId, "one-on-one", "1:1 coaching", 2, 13, 14, {
        isBooster: true,
      }),
      createEvent(userId, "customer-demo", "Customer demo", 2, 14, 15, {
        isDrainer: true,
        minuteStart: 15,
      }),
      createEvent(userId, "focus-build", "Feature focus block", 3, 9, 12),
      createEvent(userId, "gym-training", "Gym training", 3, 17, 18, {
        isBooster: true,
      }),
      createEvent(userId, "friend-dinner", "Dinner with friends", 4, 19, 21, {
        isBooster: true,
      }),
    ],
    suggestionHistory: [
      createSuggestion(userId, "move-standup", {
        mode: "PROFESSIONAL",
        status: "PENDING",
        title: "Move leadership standup 30 minutes later",
        description:
          "Push the morning standup to create a buffer before architecture review.",
        reason: "Three draining meetings are stacked with almost no recovery time.",
        autonomyLevelRequired: "ADVISOR",
        createdAt: hoursAgo(5),
        actionType: "calendar.reschedule",
      }),
      createSuggestion(userId, "block-memo-time", {
        mode: "PROFESSIONAL",
        status: "PENDING",
        title: "Draft your Q2 planning memo",
        description:
          "Reserve a 90-minute focus block before Thursday afternoon context switching ramps up.",
        reason: "Your main professional goal still has no dedicated work session.",
        autonomyLevelRequired: "COPILOT",
        createdAt: hoursAgo(14),
        actionType: "calendar.create",
      }),
      createSuggestion(userId, "family-dinner", {
        mode: "PERSONAL",
        status: "ACCEPTED",
        title: "Keep Wednesday dinner offline",
        description: "Decline optional evening events to protect family time.",
        reason: "Your boundary notes explicitly protect weekday evenings.",
        autonomyLevelRequired: "ADVISOR",
        createdAt: hoursAgo(26),
        actionType: "calendar.decline",
      }),
      createSuggestion(userId, "mentor-recap", {
        mode: "PROFESSIONAL",
        status: "ACTED",
        title: "Send mentor follow-up",
        description: "Alter drafted and sent a recap after your coffee catch-up.",
        reason: "Low-friction follow-up that keeps momentum without another task switch.",
        autonomyLevelRequired: "AUTONOMOUS",
        createdAt: hoursAgo(42),
        actionType: "email.send",
        executedAt: hoursAgo(41),
      }),
    ],
    generationTemplates: [
      {
        mode: "PROFESSIONAL",
        title: "Convert Friday catch-up into async notes",
        description:
          "Replace one status meeting with a written update to free a recovery block.",
        reason: "Your week already has enough live coordination overhead.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "calendar.replace_with_note",
        actionPayload: { target: "Friday catch-up" },
      },
      {
        mode: "PROFESSIONAL",
        title: "Pre-draft stakeholder summary",
        description:
          "Create a concise recap template before the next planning round starts.",
        reason: "You repeat the same context several times across leadership meetings.",
        autonomyLevelRequired: "COPILOT",
        actionType: "doc.create",
        actionPayload: { docType: "summary" },
      },
      {
        mode: "PERSONAL",
        title: "Schedule a solo reset block",
        description:
          "Reserve 30 minutes after your interview loop to avoid carrying that load into the evening.",
        reason: "High-cognitive days are followed by more obligations than recovery.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "calendar.create",
        actionPayload: { durationMinutes: 30 },
      },
      {
        mode: "PERSONAL",
        title: "Plan a low-friction family dinner",
        description:
          "Add a simple dinner reminder and grocery note for your quietest evening.",
        reason: "It supports a stated personal goal without adding planning overhead.",
        autonomyLevelRequired: "COPILOT",
        actionType: "task.create",
        actionPayload: { list: "home" },
      },
    ],
  };
}

function buildStudentProfile(): MockProfile {
  const profileId = "student";
  const userId = `mock-${profileId}`;

  return {
    id: profileId,
    label: "Student",
    description:
      "Classes, study sessions, and social activity with low autonomy to show reflection-only guidance.",
    user: createUser(userId, "Jonas Berg", "jonas.demo@alter.dev"),
    personaCard: createPersonaCard(
      userId,
      "University student juggling coursework, part-time tutoring, and a busy social calendar.",
      "Supportive, motivating, and concise.",
      "Do not schedule over late mornings after intense study nights."
    ),
    energyDrivers: [
      createDriver(
        userId,
        "Basketball practice",
        "Movement clears stress and resets attention.",
        "ENERGIZER"
      ),
      createDriver(
        userId,
        "Lab session",
        "Long technical labs are mentally heavy.",
        "DRAINER"
      ),
    ],
    goals: [
      createGoal(
        userId,
        "Finish machine learning project",
        "Ship the final training notebook and presentation slides.",
        "PROFESSIONAL"
      ),
      createGoal(
        userId,
        "Keep weekends social",
        "Avoid letting coursework eat the whole weekend.",
        "PERSONAL"
      ),
    ],
    priorities: [
      createPriority(userId, "WORK", 6),
      createPriority(userId, "REST", 6),
      createPriority(userId, "SOCIAL", 7),
      createPriority(userId, "GROWTH", 8),
    ],
    autonomySetting: createAutonomySetting(
      userId,
      "OBSERVER",
      "OBSERVER",
      "OBSERVER"
    ),
    calendarEvents: [
      createEvent(userId, "algorithms-lecture", "Algorithms lecture", 0, 10, 12),
      createEvent(userId, "lab-session", "Lab session", 0, 13, 16, {
        isDrainer: true,
      }),
      createEvent(userId, "basketball", "Basketball practice", 0, 18, 20, {
        isBooster: true,
      }),
      createEvent(userId, "study-group", "Study group", 1, 11, 13),
      createEvent(userId, "campus-job", "Campus tutoring shift", 1, 14, 17),
      createEvent(userId, "coffee-friends", "Coffee with friends", 1, 18, 19, {
        isBooster: true,
      }),
      createEvent(userId, "project-work", "ML project work", 2, 9, 12),
      createEvent(userId, "seminar", "Research seminar", 2, 13, 15),
      createEvent(userId, "gym", "Gym workout", 3, 16, 17, {
        isBooster: true,
      }),
      createEvent(userId, "library", "Library deep study", 4, 10, 14, {
        isDrainer: true,
      }),
      createEvent(userId, "movie-night", "Movie night", 5, 20, 22, {
        isBooster: true,
      }),
    ],
    suggestionHistory: [
      createSuggestion(userId, "protect-weekend", {
        mode: "PERSONAL",
        status: "PENDING",
        title: "Keep Saturday evening free",
        description:
          "Avoid adding more study blocks after your long Friday library session.",
        reason: "Your social priority is high, but recent plans are skewing academic.",
        autonomyLevelRequired: "ADVISOR",
        createdAt: hoursAgo(8),
        actionType: "calendar.block",
      }),
      createSuggestion(userId, "presentation-outline", {
        mode: "PROFESSIONAL",
        status: "DECLINED",
        title: "Outline your project presentation",
        description:
          "Create slide sections before you finish the whole notebook.",
        reason: "You work better when the deliverable is broken into visible chunks.",
        autonomyLevelRequired: "COPILOT",
        createdAt: hoursAgo(28),
        actionType: "doc.create",
      }),
      createSuggestion(userId, "post-lab-recovery", {
        mode: "PERSONAL",
        status: "ACCEPTED",
        title: "Add a recovery hour after lab",
        description: "Use the hour after lab for food and no-screen decompression.",
        reason: "Long lab sessions are one of your strongest drainers.",
        autonomyLevelRequired: "ADVISOR",
        createdAt: hoursAgo(40),
        actionType: "calendar.create",
      }),
    ],
    generationTemplates: [
      {
        mode: "PROFESSIONAL",
        title: "Split ML project into two milestones",
        description:
          "Separate model tuning from slide prep so progress is visible earlier.",
        reason: "You are balancing classes and part-time work, so chunking matters.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "task.create",
        actionPayload: { project: "ml-project" },
      },
      {
        mode: "PROFESSIONAL",
        title: "Convert one study block into office-hours prep",
        description:
          "Prepare focused questions before the next seminar instead of re-reading everything.",
        reason: "You get more value from targeted clarification than another long passive review.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "task.create",
        actionPayload: { type: "prep" },
      },
      {
        mode: "PERSONAL",
        title: "Protect your Saturday social window",
        description:
          "Block a no-study evening so coursework does not expand into the weekend.",
        reason: "Your stated goal is to keep weekends restorative and social.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "calendar.block",
        actionPayload: { target: "Saturday evening" },
      },
      {
        mode: "PERSONAL",
        title: "Add a short walk after library study",
        description:
          "Schedule a decompression break after your longest study session.",
        reason: "Long focus blocks drain you more than the calendar currently acknowledges.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "calendar.create",
        actionPayload: { durationMinutes: 20 },
      },
    ],
  };
}

function buildParentProfile(): MockProfile {
  const profileId = "parent";
  const userId = `mock-${profileId}`;

  return {
    id: profileId,
    label: "Parent",
    description:
      "A fragmented week with family logistics, school routines, and moderate autonomy for practical interventions.",
    user: createUser(userId, "Sara Ahmed", "sara.demo@alter.dev"),
    personaCard: createPersonaCard(
      userId,
      "Working parent coordinating school pickups, household logistics, and an individual contributor schedule.",
      "Warm, practical, and respectful of context switching.",
      "Avoid surprise changes within the school pickup window."
    ),
    energyDrivers: [
      createDriver(
        userId,
        "School pickup",
        "Transition-heavy and hard to move once the day starts.",
        "DRAINER"
      ),
      createDriver(
        userId,
        "Morning walk",
        "A short walk before work improves patience and focus.",
        "ENERGIZER"
      ),
    ],
    goals: [
      createGoal(
        userId,
        "Prepare quarterly review",
        "Draft talking points and examples before next week.",
        "PROFESSIONAL"
      ),
      createGoal(
        userId,
        "Keep one evening open",
        "Maintain at least one low-obligation family night this week.",
        "PERSONAL"
      ),
    ],
    priorities: [
      createPriority(userId, "WORK", 7),
      createPriority(userId, "REST", 7),
      createPriority(userId, "SOCIAL", 6),
      createPriority(userId, "GROWTH", 4),
    ],
    autonomySetting: createAutonomySetting(userId, "ADVISOR", "ADVISOR", "ADVISOR"),
    calendarEvents: [
      createEvent(userId, "morning-walk", "Morning walk", 0, 7, 8, {
        isBooster: true,
      }),
      createEvent(userId, "team-standup", "Team standup", 0, 9, 10, {
        isDrainer: true,
      }),
      createEvent(userId, "design-review", "Design review", 0, 10, 11, {
        isDrainer: true,
        minuteStart: 15,
        minuteEnd: 15,
      }),
      createEvent(userId, "ops-sync", "Ops sync", 0, 11, 12, {
        isDrainer: true,
        minuteStart: 30,
      }),
      createEvent(userId, "school-pickup", "School pickup", 0, 15, 16, {
        isDrainer: true,
      }),
      createEvent(userId, "piano-practice", "Piano practice", 1, 17, 18),
      createEvent(userId, "deep-work", "Quarterly review writing", 2, 9, 11),
      createEvent(userId, "doctor-appointment", "Family doctor appointment", 2, 14, 15, {
        isDrainer: true,
      }),
      createEvent(userId, "playground", "Playground time", 3, 17, 18, {
        isBooster: true,
      }),
      createEvent(userId, "date-night", "Date night", 4, 19, 21, {
        isBooster: true,
      }),
    ],
    suggestionHistory: [
      createSuggestion(userId, "pickup-buffer", {
        mode: "PROFESSIONAL",
        status: "PENDING",
        title: "Add a 20-minute pickup buffer",
        description:
          "Stop scheduling meetings too close to the school pickup transition.",
        reason: "Your calendar creates stress by assuming zero travel or reset time.",
        autonomyLevelRequired: "ADVISOR",
        createdAt: hoursAgo(6),
        actionType: "calendar.block",
      }),
      createSuggestion(userId, "review-notes", {
        mode: "PROFESSIONAL",
        status: "ACCEPTED",
        title: "Capture quarterly review wins",
        description:
          "Collect examples while they are still fresh instead of waiting for next week.",
        reason: "You already have a clean deep-work block available on Wednesday morning.",
        autonomyLevelRequired: "ADVISOR",
        createdAt: hoursAgo(22),
        actionType: "doc.create",
      }),
      createSuggestion(userId, "quiet-evening", {
        mode: "PERSONAL",
        status: "ACTED",
        title: "Protect one quiet evening",
        description: "Alter blocked Thursday night from optional plans.",
        reason: "Your week had no low-obligation evening left.",
        autonomyLevelRequired: "AUTONOMOUS",
        createdAt: hoursAgo(34),
        actionType: "calendar.block",
        executedAt: hoursAgo(33),
      }),
    ],
    generationTemplates: [
      {
        mode: "PROFESSIONAL",
        title: "Draft your quarterly review bullets",
        description:
          "Use the Wednesday writing block to capture examples before context shifts again.",
        reason: "Your professional goal has a clear opening in the week.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "doc.create",
        actionPayload: { docType: "review" },
      },
      {
        mode: "PROFESSIONAL",
        title: "Decline one low-priority sync",
        description:
          "Trade one recurring sync for async notes to reduce transition load.",
        reason: "Your Monday is already packed with draining context changes.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "calendar.decline",
        actionPayload: { pattern: "sync" },
      },
      {
        mode: "PERSONAL",
        title: "Prep a simple weeknight dinner plan",
        description:
          "Add a low-effort dinner reminder before your busiest pickup day.",
        reason: "It supports a calmer evening without asking for more energy later.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "task.create",
        actionPayload: { list: "family" },
      },
      {
        mode: "PERSONAL",
        title: "Block a 15-minute reset after pickup",
        description:
          "Create a short decompression buffer before the next family task begins.",
        reason: "Your day has multiple transitions but almost no intentional recovery time.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "calendar.create",
        actionPayload: { durationMinutes: 15 },
      },
    ],
  };
}

function buildRetireeProfile(): MockProfile {
  const profileId = "retiree";
  const userId = `mock-${profileId}`;

  return {
    id: profileId,
    label: "Retiree",
    description:
      "Low-pressure routines, volunteering, and high autonomy to show auto-acted suggestions and calmer balance.",
    user: createUser(userId, "Erik Holm", "erik.demo@alter.dev"),
    personaCard: createPersonaCard(
      userId,
      "Recently retired, values health, volunteering, and steady connection with family.",
      "Gentle, clear, and not overly formal.",
      "Prefer daytime plans and keep evenings light."
    ),
    energyDrivers: [
      createDriver(
        userId,
        "Morning swim",
        "A reliable energy booster that sets the tone for the day.",
        "ENERGIZER"
      ),
      createDriver(
        userId,
        "Volunteer board meeting",
        "Long committee sessions are draining.",
        "DRAINER"
      ),
    ],
    goals: [
      createGoal(
        userId,
        "Organise travel paperwork",
        "Prepare documents for a summer train trip.",
        "PERSONAL"
      ),
      createGoal(
        userId,
        "Support local library fundraiser",
        "Stay consistent with volunteer coordination.",
        "PROFESSIONAL"
      ),
    ],
    priorities: [
      createPriority(userId, "WORK", 3),
      createPriority(userId, "REST", 8),
      createPriority(userId, "SOCIAL", 7),
      createPriority(userId, "GROWTH", 6),
    ],
    autonomySetting: createAutonomySetting(
      userId,
      "AUTONOMOUS",
      "AUTONOMOUS",
      "AUTONOMOUS"
    ),
    calendarEvents: [
      createEvent(userId, "morning-swim", "Morning swim", 0, 8, 9, {
        isBooster: true,
      }),
      createEvent(userId, "volunteer-board", "Volunteer board meeting", 1, 10, 12, {
        isDrainer: true,
      }),
      createEvent(userId, "grandkids-lunch", "Lunch with grandkids", 2, 12, 14, {
        isBooster: true,
      }),
      createEvent(userId, "garden-club", "Garden club", 3, 11, 12),
      createEvent(userId, "train-ticket", "Train ticket planning", 4, 10, 11),
      createEvent(userId, "walking-group", "Walking group", 5, 9, 10, {
        isBooster: true,
      }),
    ],
    suggestionHistory: [
      createSuggestion(userId, "fundraiser-email", {
        mode: "PROFESSIONAL",
        status: "ACTED",
        title: "Send fundraiser volunteer reminder",
        description: "Alter sent the follow-up email to volunteers yesterday afternoon.",
        reason: "It was low-risk and aligned with your autonomous setting.",
        autonomyLevelRequired: "AUTONOMOUS",
        createdAt: hoursAgo(12),
        actionType: "email.send",
        executedAt: hoursAgo(11),
      }),
      createSuggestion(userId, "travel-folder", {
        mode: "PERSONAL",
        status: "PENDING",
        title: "Collect travel documents in one folder",
        description:
          "Create a single checklist before train booking details start to scatter.",
        reason: "Your summer travel goal has several small administrative steps.",
        autonomyLevelRequired: "ADVISOR",
        createdAt: hoursAgo(20),
        actionType: "task.create",
      }),
      createSuggestion(userId, "rest-evening", {
        mode: "PERSONAL",
        status: "ACCEPTED",
        title: "Keep tonight obligation-free",
        description:
          "Maintain a light evening after the volunteer board meeting.",
        reason: "Long committee sessions drain more energy than the rest of your week.",
        autonomyLevelRequired: "ADVISOR",
        createdAt: hoursAgo(36),
        actionType: "calendar.block",
      }),
    ],
    generationTemplates: [
      {
        mode: "PROFESSIONAL",
        title: "Auto-draft the next fundraiser update",
        description:
          "Prepare a reusable template before the next volunteer check-in.",
        reason: "Your autonomous setting makes repeatable admin a good candidate for automation.",
        autonomyLevelRequired: "AUTONOMOUS",
        actionType: "doc.create",
        actionPayload: { template: "fundraiser-update" },
      },
      {
        mode: "PROFESSIONAL",
        title: "Confirm board agenda ahead of time",
        description:
          "Reduce meeting drift by asking for an agenda before the next committee session.",
        reason: "That is the main energy drain in an otherwise steady week.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "email.draft",
        actionPayload: { audience: "board" },
      },
      {
        mode: "PERSONAL",
        title: "Create a travel paperwork checklist",
        description:
          "Turn several small travel tasks into one calm checklist.",
        reason: "It supports your personal goal without adding urgency.",
        autonomyLevelRequired: "ADVISOR",
        actionType: "task.create",
        actionPayload: { list: "travel" },
      },
      {
        mode: "PERSONAL",
        title: "Reserve a recovery afternoon after volunteering",
        description:
          "Keep the afternoon after the board meeting intentionally light.",
        reason: "Your calendar shows one clear drainer and plenty of room to buffer around it.",
        autonomyLevelRequired: "AUTONOMOUS",
        actionType: "calendar.block",
        actionPayload: { target: "afternoon" },
      },
    ],
  };
}

function createUser(id: string, name: string, email: string): User {
  return {
    id,
    name,
    email,
    createdAt: daysAgo(120),
    updatedAt: hoursAgo(2),
  };
}

function createPersonaCard(
  userId: string,
  summary: string,
  communicationStyle: string,
  boundaryNotes: string
): PersonaCard {
  return {
    id: `${userId}-persona`,
    userId,
    summary,
    communicationStyle,
    boundaryNotes,
    confirmedAt: daysAgo(45),
    createdAt: daysAgo(45),
  };
}

function createDriver(
  userId: string,
  label: string,
  description: string,
  driverType: EnergyDriver["driverType"]
): EnergyDriver {
  return {
    id: `${userId}-driver-${slugify(label)}`,
    userId,
    label,
    description,
    driverType,
    createdAt: daysAgo(30),
  };
}

function createGoal(
  userId: string,
  title: string,
  description: string,
  category: GoalCategory
): Goal {
  return {
    id: `${userId}-goal-${slugify(title)}`,
    userId,
    title,
    description,
    category,
    createdAt: daysAgo(20),
  };
}

function createPriority(
  userId: string,
  dimension: BalanceDimension,
  importance: number
): Priority {
  return {
    id: `${userId}-priority-${dimension.toLowerCase()}`,
    userId,
    dimension,
    importance,
    notes: null,
    createdAt: daysAgo(20),
  };
}

function createAutonomySetting(
  userId: string,
  level: AutonomyLevel,
  personalMode: AutonomyLevel,
  professionalMode: AutonomyLevel
): AutonomySetting {
  return {
    id: `${userId}-autonomy`,
    userId,
    level,
    personalMode,
    professionalMode,
    updatedAt: hoursAgo(4),
  };
}

function createEvent(
  userId: string,
  slug: string,
  title: string,
  dayOffset: number,
  startHour: number,
  endHour: number,
  options?: {
    minuteStart?: number;
    minuteEnd?: number;
    isDrainer?: boolean;
    isBooster?: boolean;
  }
): CalendarEvent {
  const minuteStart = options?.minuteStart ?? 0;
  const minuteEnd = options?.minuteEnd ?? 0;

  return {
    id: `${userId}-event-${slug}`,
    userId,
    title,
    startTime: atTime(dayOffset, startHour, minuteStart),
    endTime: atTime(dayOffset, endHour, minuteEnd),
    isDrainer: options?.isDrainer ?? false,
    isBooster: options?.isBooster ?? false,
    source: "mock",
    createdAt: daysAgo(10),
  };
}

function createSuggestion(
  userId: string,
  slug: string,
  input: {
    mode: SuggestionMode;
    status: SuggestionStatus;
    title: string;
    description: string;
    reason: string;
    autonomyLevelRequired: AutonomyLevel;
    createdAt: Date;
    actionType: string;
    executedAt?: Date;
  }
): MockSuggestionRecord {
  const suggestionId = `${userId}-suggestion-${slug}`;

  return {
    id: suggestionId,
    userId,
    mode: input.mode,
    title: input.title,
    description: input.description,
    reason: input.reason,
    status: input.status,
    autonomyLevelRequired: input.autonomyLevelRequired,
    createdAt: input.createdAt,
    actions: [
      {
        id: `${suggestionId}-action`,
        suggestionId,
        actionType: input.actionType,
        payload: {},
        executedAt: input.executedAt ?? null,
      },
    ],
  };
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function atTime(dayOffset: number, hour: number, minute = 0) {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
