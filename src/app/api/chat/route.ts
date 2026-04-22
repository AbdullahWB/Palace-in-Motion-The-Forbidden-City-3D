import { buildFallbackGuideResult } from "@/lib/ai-guide/fallback";
import { resolveGuideContext } from "@/lib/ai-guide/context";
import { buildGuideMessages } from "@/lib/ai-guide/prompt";
import { requestDeepSeekAnswer } from "@/lib/ai-guide/deepseek";
import {
  DEFAULT_APP_LANGUAGE,
  isAppLanguage,
} from "@/lib/site-preferences";
import type {
  GuideCaptionPayload,
  GuideIntent,
  GuideMode,
  GuideRequest,
  GuideResponse,
} from "@/types/ai-guide";
import type { ExploreJourneyRouteId, HeritageZoneId } from "@/types/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_QUESTION_LENGTH = 2;
const MAX_QUESTION_LENGTH = 380;
const MAX_FIELD_LENGTH = 120;

function getRouteCopy(language: "zh" | "en") {
  if (language === "zh") {
    return {
      invalidJson: "JSON 请求体无效。",
      questionRequired: "请输入问题。",
      minQuestion: `问题至少需要 ${MIN_QUESTION_LENGTH} 个字符。`,
      maxQuestion: `问题最多不能超过 ${MAX_QUESTION_LENGTH} 个字符。`,
      invalidMode: "模式必须是 short、detailed 或 fun。",
      invalidIntent: "意图必须是 answer 或 caption。",
    };
  }

  return {
    invalidJson: "Invalid JSON body.",
    questionRequired: "Question is required.",
    minQuestion: `Question must be at least ${MIN_QUESTION_LENGTH} characters.`,
    maxQuestion: `Question must be at most ${MAX_QUESTION_LENGTH} characters.`,
    invalidMode: "Mode must be short, detailed, or fun.",
    invalidIntent: "Intent must be answer or caption.",
  };
}

function isGuideMode(value: unknown): value is GuideMode {
  return value === "short" || value === "detailed" || value === "fun";
}

function isGuideIntent(value: unknown): value is GuideIntent {
  return value === "answer" || value === "caption";
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeSizedNullableString(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  const normalized = normalizeNullableString(value);

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function normalizeNullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeCaptionText(input: string) {
  const noQuotes = input.replace(/^["'`]+|["'`]+$/g, "");
  const singleLine = noQuotes.replace(/\s*\n+\s*/g, " ").replace(/\s{2,}/g, " ");
  return singleLine.trim();
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const language = isAppLanguage(body.language)
    ? body.language
    : DEFAULT_APP_LANGUAGE;
  const copy = getRouteCopy(language);
  const question = normalizeNullableString(body.question);
  const mode = body.mode;
  const intent = body.intent;

  if (!question) {
    return Response.json({ error: copy.questionRequired }, { status: 400 });
  }

  if (question.length < MIN_QUESTION_LENGTH) {
    return Response.json({ error: copy.minQuestion }, { status: 400 });
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return Response.json({ error: copy.maxQuestion }, { status: 400 });
  }

  if (!isGuideMode(mode)) {
    return Response.json({ error: copy.invalidMode }, { status: 400 });
  }

  if (intent !== undefined && !isGuideIntent(intent)) {
    return Response.json({ error: copy.invalidIntent }, { status: 400 });
  }

  const resolvedIntent: GuideIntent = intent ?? "answer";

  const guideRequest: GuideRequest = {
    sceneId: normalizeSizedNullableString(body.sceneId),
    hotspotId: normalizeSizedNullableString(body.hotspotId) as HeritageZoneId | null,
    tourStepId: normalizeSizedNullableString(body.tourStepId),
    focusId: normalizeSizedNullableString(body.focusId) as
      | HeritageZoneId
      | "central-axis"
      | null,
    journeyRouteId: normalizeSizedNullableString(body.journeyRouteId) as ExploreJourneyRouteId | null,
    journeyTitle: normalizeSizedNullableString(body.journeyTitle, 100),
    journeyDescription: normalizeSizedNullableString(body.journeyDescription, 240),
    journeyStopIndex: normalizeNullableNumber(body.journeyStopIndex),
    journeyStopTotal: normalizeNullableNumber(body.journeyStopTotal),
    frameCaption: normalizeSizedNullableString(body.frameCaption, 120),
    postcardThemeId: normalizeSizedNullableString(body.postcardThemeId),
    contextHint: normalizeSizedNullableString(body.contextHint, 80),
    title: normalizeSizedNullableString(body.title, 80),
    language,
    question,
    mode,
    intent: resolvedIntent,
  };

  const context = resolveGuideContext(guideRequest);
  const messages = buildGuideMessages({
    context,
    request: guideRequest,
  });

  let answer = "";
  let fallback = false;
  const startedAt = performance.now();

  try {
    const result = await requestDeepSeekAnswer({
      messages,
      mode: guideRequest.mode,
    });
    answer = result ?? "";
  } catch {
    answer = "";
  }

  if (!answer.trim()) {
    fallback = true;
    answer = buildFallbackGuideResult({
      context,
      request: guideRequest,
    });
  }

  const cleanedAnswer = answer.trim();
  const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));
  const caption: GuideCaptionPayload | undefined =
    guideRequest.intent === "caption"
      ? {
          text: normalizeCaptionText(cleanedAnswer),
          focusLabel: context.focusLabel ?? context.contextLabel,
          themeId: guideRequest.postcardThemeId ?? null,
        }
      : undefined;

  const response: GuideResponse = {
    answer: cleanedAnswer,
    mode: guideRequest.mode,
    fallback,
    sourceIds: context.sourceIds,
    contextLabel: context.contextLabel,
    intent: guideRequest.intent,
    caption,
    meta: {
      provider: fallback ? "fallback" : "deepseek",
      latencyMs,
    },
  };

  return Response.json(response);
}
