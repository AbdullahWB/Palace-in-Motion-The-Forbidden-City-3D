import { buildFallbackGuideResult } from "@/lib/ai-guide/fallback";
import { resolveGuideContext } from "@/lib/ai-guide/context";
import { buildGuideMessages } from "@/lib/ai-guide/prompt";
import { requestDeepSeekAnswer } from "@/lib/ai-guide/deepseek";
import type {
  GuideIntent,
  GuideMode,
  GuideRequest,
  GuideResponse,
} from "@/types/ai-guide";
import type { HeritageZoneId } from "@/types/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isGuideMode(value: unknown): value is GuideMode {
  return value === "short" || value === "detailed" || value === "fun";
}

function isGuideIntent(value: unknown): value is GuideIntent {
  return value === "answer" || value === "caption";
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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

  if (!isGuideMode(mode)) {
    return Response.json({ error: "Mode must be short, detailed, or fun." }, { status: 400 });
  }

  if (intent !== undefined && !isGuideIntent(intent)) {
    return Response.json({ error: "Intent must be answer or caption." }, { status: 400 });
  }

  const guideRequest: GuideRequest = {
    sceneId: normalizeNullableString(body.sceneId),
    hotspotId: normalizeNullableString(body.hotspotId) as HeritageZoneId | null,
    tourStepId: normalizeNullableString(body.tourStepId),
    focusId: normalizeNullableString(body.focusId) as
      | HeritageZoneId
      | "central-axis"
      | null,
    postcardThemeId: normalizeNullableString(body.postcardThemeId),
    title: normalizeNullableString(body.title),
    question,
    mode,
    intent,
  };

  const context = resolveGuideContext(guideRequest);
  const messages = buildGuideMessages({
    context,
    request: guideRequest,
  });

  let answer: string | null = null;
  let fallback = false;

  try {
    answer = await requestDeepSeekAnswer({
      messages,
      mode: guideRequest.mode,
    });
  } catch {
    answer = null;
  }

  if (!answer) {
    fallback = true;
    answer = buildFallbackGuideResult({
      context,
      request: guideRequest,
    });
  }

  const response: GuideResponse = {
    answer,
    mode: guideRequest.mode,
    fallback,
    sourceIds: context.sourceIds,
    contextLabel: context.contextLabel,
  };

  return Response.json(response);
}
