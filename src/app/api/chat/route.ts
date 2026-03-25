import { buildFallbackAnswer } from "@/lib/ai-guide/fallback";
import { resolveGuideContext } from "@/lib/ai-guide/context";
import { buildGuideMessages } from "@/lib/ai-guide/prompt";
import { requestDeepSeekAnswer } from "@/lib/ai-guide/deepseek";
import type { GuideMode, GuideRequest, GuideResponse } from "@/types/ai-guide";
import type { HeritageZoneId } from "@/types/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isGuideMode(value: unknown): value is GuideMode {
  return value === "short" || value === "detailed" || value === "fun";
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

  if (!question) {
    return Response.json({ error: "Question is required." }, { status: 400 });
  }

  if (!isGuideMode(mode)) {
    return Response.json({ error: "Mode must be short, detailed, or fun." }, { status: 400 });
  }

  const guideRequest: GuideRequest = {
    sceneId: normalizeNullableString(body.sceneId),
    hotspotId: normalizeNullableString(body.hotspotId) as HeritageZoneId | null,
    tourStepId: normalizeNullableString(body.tourStepId),
    question,
    mode,
  };

  const context = resolveGuideContext(guideRequest);
  const messages = buildGuideMessages({
    context,
    question: guideRequest.question,
    mode: guideRequest.mode,
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
    answer = buildFallbackAnswer({
      context,
      question: guideRequest.question,
      mode: guideRequest.mode,
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
