import { chromium } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const baseUrl = process.env.PALACE_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = resolve("presentation-videos");
const rawDir = join(outputDir, "raw");
const viewport = { width: 1280, height: 720 };

const clips = [
  ["01-product-overview", recordProductOverview],
  ["02-passport-progress", recordPassportProgress],
  ["03-ai-companion", recordAiCompanion],
  ["04-smart-tour-builder", recordSmartTourBuilder],
  ["05-postcard-studio", recordPostcardStudio],
  ["06-3d-view", recordThreeDView],
  ["07-final-demo-walkthrough", recordFinalWalkthrough],
];

function ensureCleanDir(path) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
  mkdirSync(path, { recursive: true });
}

async function preparePage(page) {
  page.setDefaultTimeout(10_000);
  await page.addInitScript(() => {
    window.localStorage.setItem("palace-theme", "dark");
    window.localStorage.setItem("palace-language", "en");
    window.localStorage.setItem("palace-music-enabled", "false");
  });
}

async function waitForApp(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1_200);
}

async function safeClick(locator, timeout = 4_000) {
  try {
    await locator.first().click({ timeout });
    return true;
  } catch {
    return false;
  }
}

async function safeFill(locator, value, timeout = 4_000) {
  try {
    await locator.first().fill(value, { timeout });
    return true;
  } catch {
    return false;
  }
}

async function goto(page, path, delay = 1_400) {
  await page.goto(`${baseUrl}${path}`);
  await waitForApp(page);
  await page.waitForTimeout(delay);
}

async function recordProductOverview(page) {
  await goto(page, "/", 2_000);
  await goto(page, "/?view=map", 1_800);
  await goto(page, "/?view=place&place=taihe-dian&route=ceremonial-axis", 2_200);
  await safeClick(page.getByRole("button", { name: /Passport/i }));
  await page.waitForTimeout(1_800);
  await goto(page, "/companion", 2_000);
  await goto(page, "/3d-view", 3_000);
}

async function recordPassportProgress(page) {
  await goto(page, "/?view=place&place=taihe-dian&route=ceremonial-axis", 2_000);
  await safeClick(page.getByRole("button", { name: /Passport/i }));
  await page.waitForTimeout(2_500);
  await safeClick(page.getByRole("button", { name: /^A\./i }), 2_000);
  await page.waitForTimeout(2_500);
}

async function recordAiCompanion(page) {
  await goto(page, "/companion", 2_000);
  await safeClick(page.getByRole("button", { name: /Academic/i }), 2_000);
  await safeFill(
    page.locator("textarea"),
    "Explain Taihe Dian in academic mode and mention why it matters.",
  );
  await safeClick(page.getByRole("button", { name: /Send/i }));
  await page.waitForTimeout(6_000);
}

async function recordSmartTourBuilder(page) {
  await goto(page, "/companion", 1_500);
  await safeClick(page.getByRole("button", { name: /^10 min$/i }), 2_000);
  await safeClick(page.getByRole("button", { name: /Architecture/i }), 2_000);
  await safeClick(page.getByRole("button", { name: /Build tour/i }), 2_000);
  await page.waitForTimeout(4_000);
}

async function recordPostcardStudio(page) {
  await goto(page, "/?view=place&place=qianqing-men&photo=front&route=inner-court-life", 2_000);
  await safeClick(page.getByRole("button", { name: /^Selfie$/i }));
  await page.waitForTimeout(4_500);
}

async function recordThreeDView(page) {
  await goto(page, "/3d-view", 2_500);
  await safeClick(page.getByRole("button", { name: /Ceremonial Axis/i }), 1_500);
  await page.waitForTimeout(1_500);
  await safeClick(page.getByRole("button", { name: /Taihe Dian roof hierarchy/i }), 1_500);
  await page.waitForTimeout(1_500);
  await safeClick(page.getByRole("button", { name: /Sunset/i }), 1_500);
  await page.waitForTimeout(1_500);
  await safeClick(page.getByRole("button", { name: /Night/i }), 1_500);
  await page.waitForTimeout(2_000);
}

async function recordFinalWalkthrough(page) {
  await goto(page, "/", 1_400);
  await goto(page, "/?view=map", 1_300);
  await goto(page, "/?view=place&q=1&place=qianqing-men&route=inner-court-life", 1_500);
  await safeClick(page.getByRole("button", { name: /Passport/i }), 2_000);
  await page.waitForTimeout(1_300);
  await goto(page, "/companion", 1_600);
  await safeFill(page.locator("textarea"), "Build a 10 minute architecture route.");
  await safeClick(page.getByRole("button", { name: /Send/i }));
  await page.waitForTimeout(2_800);
  await goto(page, "/3d-view", 2_400);
}

function convertToMp4(webmPath, mp4Path) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      webmPath,
      "-vf",
      "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      mp4Path,
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${mp4Path}`);
  }
}

async function recordClip(browser, name, run) {
  const clipRawDir = join(rawDir, name);
  ensureCleanDir(clipRawDir);

  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    recordVideo: {
      dir: clipRawDir,
      size: viewport,
    },
  });
  const page = await context.newPage();
  await preparePage(page);

  try {
    await run(page);
  } finally {
    await context.close();
  }

  const webm = readdirSync(clipRawDir).find((file) => file.endsWith(".webm"));
  if (!webm) {
    throw new Error(`No video produced for ${name}`);
  }

  const webmPath = join(clipRawDir, webm);
  const mp4Path = join(outputDir, `${name}.mp4`);
  convertToMp4(webmPath, mp4Path);
  console.log(`Recorded ${mp4Path}`);
}

async function main() {
  mkdirSync(outputDir, { recursive: true });
  ensureCleanDir(rawDir);

  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, run] of clips) {
      await recordClip(browser, name, run);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
