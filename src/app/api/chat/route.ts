import { buildFallbackGuideResult } from "@/lib/ai-guide/fallback";
import { resolveGuideContext } from "@/lib/ai-guide/context";
import { buildGuideMessages } from "@/lib/ai-guide/prompt";
import { requestDeepSeekAnswer } from "@/lib/ai-guide/deepseek";
import type {
  GuideCaptionPayload,
  GuideIntent,
  GuideMode,
  GuideRequest,
  GuideResponse,
} from "@/types/ai-guide";
import type { HeritageZoneId } from "@/types/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_QUESTION_LENGTH = 4;
const MAX_QUESTION_LENGTH = 380;
const MAX_FIELD_LENGTH = 120;

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

  const question = normalizeNullableString(body.question);
  const mode = body.mode;
  const intent = body.intent;

  if (!question) {
    return Response.json({ error: "Question is required." }, { status: 400 });
  }

  if (question.length < MIN_QUESTION_LENGTH) {
    return Response.json(
      { error: `Question must be at least ${MIN_QUESTION_LENGTH} characters.` },
      { status: 400 }
    );
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return Response.json(
      { error: `Question must be at most ${MAX_QUESTION_LENGTH} characters.` },
      { status: 400 }
    );
  }

  if (!isGuideMode(mode)) {
    return Response.json({ error: "Mode must be short, detailed, or fun." }, { status: 400 });
  }

  if (intent !== undefined && !isGuideIntent(intent)) {
    return Response.json({ error: "Intent must be answer or caption." }, { status: 400 });
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
    postcardThemeId: normalizeSizedNullableString(body.postcardThemeId),
    title: normalizeSizedNullableString(body.title, 80),
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
