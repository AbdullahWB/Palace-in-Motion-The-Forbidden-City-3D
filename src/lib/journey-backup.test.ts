import { describe, expect, it } from "vitest";
import {
  createJourneyBackup,
  JOURNEY_BACKUP_VERSION,
  JourneyBackupError,
  parseJourneyBackup,
  type JourneyBackupInput,
} from "@/lib/journey-backup";

const baseInput: JourneyBackupInput = {
  visitedExplorePlaceSlugs: ["taihe-dian"],
  passportMissions: [
    {
      placeSlug: "taihe-dian",
      quizAnswered: true,
      correctCount: 1,
      stampUnlocked: true,
      updatedAt: 1,
    },
  ],
  customTours: [
    {
      id: "tour-1",
      title: "Teacher route",
      timeBudget: 10,
      interests: ["overview"],
      orderedPlaceSlugs: ["taihe-dian", "baohe-dian"],
      explanation: "Local route",
      currentStopIndex: 0,
      createdAt: 1,
    },
  ],
  activeCustomTourId: "tour-1",
  activeExploreRouteId: "ceremonial-axis",
  achievementMissions: [],
  classroomAssignments: [],
  classroomReports: [],
  accessibilityPreferences: {
    textScale: "large",
    contrast: "high",
    reduceMotion: true,
    simplified: false,
    readableLabels: true,
    keyboardFocus: false,
  },
};

describe("journey backup", () => {
  it("creates versioned local-first backups", () => {
    const backup = createJourneyBackup(baseInput);

    expect(backup.version).toBe(JOURNEY_BACKUP_VERSION);
    expect(backup.visitedExplorePlaceSlugs).toEqual(["taihe-dian"]);
    expect(backup.accessibilityPreferences.contrast).toBe("high");
  });

  it("parses and sanitizes backup content", () => {
    const parsed = parseJourneyBackup({
      ...createJourneyBackup(baseInput),
      visitedExplorePlaceSlugs: ["taihe-dian", "not-a-place"],
      activeCustomTourId: "missing-tour",
      activeExploreRouteId: "not-a-route",
    });

    expect(parsed.visitedExplorePlaceSlugs).toEqual(["taihe-dian"]);
    expect(parsed.activeCustomTourId).toBeNull();
    expect(parsed.activeExploreRouteId).toBeNull();
  });

  it("rejects unsupported backup versions", () => {
    expect(() => parseJourneyBackup({ version: 999 })).toThrow(
      JourneyBackupError
    );
  });
});
