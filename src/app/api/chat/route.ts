import {
  isExploreJourneyRouteId,
  isExplorePlaceSlug,
} from "@/data/panorama";
import { resolveGuideContext } from "@/lib/ai-guide/context";
import {
  AI_GENERATED_LABEL,
  defaultAIGuideAdapter,
} from "@/lib/ai-guide/provider-adapter";
import {
  DEFAULT_APP_LANGUAGE,
  isAppLanguage,
} from "@/lib/site-preferences";
import type {
  GuideIntent,
  GuideMode,
  GuideRequest,
  GuideResponse,
  TourBuilderInterest,
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
      invalidJson: "Invalid JSON body.",
      questionRequired: "Question is required.",
      minQuestion: `Question must be at least ${MIN_QUESTION_LENGTH} characters.`,
      maxQuestion: `Question must be at most ${MAX_QUESTION_LENGTH} characters.`,
      invalidMode:
        "Mode must be short, detailed, fun, story, child, academic, tourist, exam, or quiz.",
      invalidIntent:
        "Intent must be answer, caption, quiz, tour_builder, or site_action.",
    };
  }

  return {
    invalidJson: "Invalid JSON body.",
    questionRequired: "Question is required.",
    minQuestion: `Question must be at least ${MIN_QUESTION_LENGTH} characters.`,
    maxQuestion: `Question must be at most ${MAX_QUESTION_LENGTH} characters.`,
    invalidMode:
      "Mode must be short, detailed, fun, story, child, academic, tourist, exam, or quiz.",
    invalidIntent:
      "Intent must be answer, caption, quiz, tour_builder, or site_action.",
  };
}

function isGuideMode(value: unknown): value is GuideMode {
  return (
    value === "short" ||
    value === "detailed" ||
    value === "fun" ||
    value === "story" ||
    value === "child" ||
    value === "academic" ||
    value === "tourist" ||
    value === "exam" ||
    value === "quiz"
  );
}

function isGuideIntent(value: unknown): value is GuideIntent {
  return (
    value === "answer" ||
    value === "caption" ||
    value === "quiz" ||
    value === "tour_builder" ||
    value === "site_action"
  );
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

function normalizeTimeBudget(value: unknown): 5 | 10 | 20 | null {
  const normalized = normalizeNullableNumber(value);

  return normalized === 5 || normalized === 10 || normalized === 20
    ? normalized
    : null;
}

function normalizeInterests(value: unknown): TourBuilderInterest[] {
  const allowed = new Set<TourBuilderInterest>([
    "architecture",
    "history",
    "gardens",
    "photography",
    "overview",
  ]);

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is TourBuilderInterest =>
    typeof item === "string" && allowed.has(item as TourBuilderInterest)
  );
}

async function handleIntent({
  request,
  context,
}: {
  request: GuideRequest;
  context: ReturnType<typeof resolveGuideContext>;
}) {
  switch (request.intent) {
    case "caption":
      return defaultAIGuideAdapter.generateCaption({ request, context });
    case "quiz":
      return defaultAIGuideAdapter.generateQuiz({ request, context });
    case "tour_builder":
      return defaultAIGuideAdapter.buildTour({ request, context });
    case "site_action":
      return defaultAIGuideAdapter.handleSiteAction({ request, context });
    default:
      return defaultAIGuideAdapter.answerGuideQuestion({ request, context });
  }
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
  const requestedPlaceSlug = normalizeSizedNullableString(body.placeSlug);
  const requestedJourneyRouteId = normalizeSizedNullableString(body.journeyRouteId);

  const guideRequest: GuideRequest = {
    sceneId: normalizeSizedNullableString(body.sceneId),
    hotspotId: normalizeSizedNullableString(body.hotspotId) as HeritageZoneId | null,
    tourStepId: normalizeSizedNullableString(body.tourStepId),
    placeSlug: isExplorePlaceSlug(requestedPlaceSlug) ? requestedPlaceSlug : null,
    focusId: normalizeSizedNullableString(body.focusId) as
      | HeritageZoneId
      | "central-axis"
      | null,
    journeyRouteId: isExploreJourneyRouteId(requestedJourneyRouteId)
      ? (requestedJourneyRouteId as ExploreJourneyRouteId)
      : null,
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
    timeBudget: normalizeTimeBudget(body.timeBudget),
    interests: normalizeInterests(body.interests),
  };

  const context = resolveGuideContext(guideRequest);
  const startedAt = performance.now();
  const result = await handleIntent({
    request: guideRequest,
    context,
  });
  const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));

  const response: GuideResponse = {
    answer: result.answer.trim(),
    mode: guideRequest.mode,
    fallback: result.fallback,
    sourceIds: context.sourceIds,
    contextLabel: context.contextLabel,
    intent: guideRequest.intent,
    caption: result.caption,
    quiz: result.quiz,
    customTour: result.customTour,
    siteAction: result.siteAction,
    aiLabel: AI_GENERATED_LABEL,
    meta: {
      provider: result.provider,
      latencyMs,
    },
  };

  return Response.json(response);
}
