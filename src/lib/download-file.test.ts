import { describe, expect, it } from "vitest";
import {
  createDatedFilename,
  createDatedFilenameFromParts,
  createFilenameSlug,
} from "@/lib/download-file";

describe("download filename helpers", () => {
  const date = new Date("2026-05-04T12:00:00.000Z");

  it("creates filename-safe slugs", () => {
    expect(createFilenameSlug("Inner Court Life: Teacher Route")).toBe(
      "inner-court-life-teacher-route"
    );
  });

  it("creates dated filenames", () => {
    expect(createDatedFilename("Full Palace worksheet", "txt", date)).toBe(
      "full-palace-worksheet-2026-05-04.txt"
    );
  });

  it("creates dated filenames from non-empty parts", () => {
    expect(
      createDatedFilenameFromParts(
        ["palace-classroom", "Ceremonial Axis", null, "answer key"],
        "json",
        date
      )
    ).toBe("palace-classroom-ceremonial-axis-answer-key-2026-05-04.json");
  });
});
