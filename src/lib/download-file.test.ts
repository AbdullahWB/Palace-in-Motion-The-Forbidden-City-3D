import { describe, expect, it } from "vitest";
import {
  createDatedFilename,
  createDatedFilenameFromParts,
  createFilenameSlug,
} from "@/lib/download-file";

describe("download filename helpers", () => {
  const date = new Date("2026-05-04T12:00:00.000Z");

  it("creates filename-safe slugs", () => {
    expect(createFilenameSlug("Inner Court Life: Visitor Route")).toBe(
      "inner-court-life-visitor-route"
    );
  });

  it("creates dated filenames", () => {
    expect(createDatedFilename("Full Palace notes", "txt", date)).toBe(
      "full-palace-notes-2026-05-04.txt"
    );
  });

  it("creates dated filenames from non-empty parts", () => {
    expect(
      createDatedFilenameFromParts(
        ["palace-journey", "Ceremonial Axis", null, "answer key"],
        "json",
        date
      )
    ).toBe("palace-journey-ceremonial-axis-answer-key-2026-05-04.json");
  });
});
