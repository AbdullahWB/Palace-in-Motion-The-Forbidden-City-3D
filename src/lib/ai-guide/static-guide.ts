import { resolveGuideContext } from "@/lib/ai-guide/context";
import {
  AI_GENERATED_LABEL,
  defaultAIGuideAdapter,
} from "@/lib/ai-guide/provider-adapter";
import { pickLocalizedText } from "@/lib/i18n";
import { DEFAULT_APP_LANGUAGE } from "@/lib/site-preferences";
import type {
  GuideRequest,
  GuideResponse,
  GuideSourceCard,
  GuideVerification,
  ResolvedGuideContext,
} from "@/types/ai-guide";

function buildVerificationPayload({
  context,
  language,
}: {
  context: ResolvedGuideContext;
  language: "zh" | "en";
}): {
  sourceCards: GuideSourceCard[];
  verification: GuideVerification;
} {
  if (context.placeKnowledge) {
    const knowledge = context.placeKnowledge;

    return {
      sourceCards: [
        {
          id: knowledge.placeSlug,
          title: pickLocalizedText(knowledge.sourceTitle, language),
          body: pickLocalizedText(knowledge.historyNote, language),
          sourceNote: pickLocalizedText(knowledge.sourceNote, language),
          sourceStatus: knowledge.sourceStatus,
          sourceConfidence: knowledge.sourceConfidence,
        },
        {
          id: `${knowledge.placeSlug}-preservation`,
          title: "Preservation and accessibility note",
          body: [
            pickLocalizedText(knowledge.preservationNote, language),
            pickLocalizedText(knowledge.accessibilitySummary, language),
          ].join(" "),
          sourceNote: pickLocalizedText(knowledge.sourceNote, language),
          sourceStatus: knowledge.sourceStatus,
          sourceConfidence: knowledge.sourceConfidence,
        },
      ],
      verification: {
        label: "Based on Palace Guide Source",
        status: "grounded",
        message: pickLocalizedText(knowledge.sourceNote, language),
      },
    };
  }

  if (context.hasSpecificContext) {
    return {
      sourceCards: [
        {
          id: context.sourceIds[0] ?? "scene-context",
          title: "Local scene context",
          body:
            context.tourStep?.explanation ??
            context.hotspot?.hotspotDescription ??
            context.site.summary,
          sourceNote:
            "This answer uses local scene material; a more specific palace source card is not attached yet.",
          sourceStatus: "scene-context",
          sourceConfidence: "limited",
        },
      ],
      verification: {
        label: "Based on local scene context",
        status: "limited",
        message:
          "This answer is conservative because the current question is not bound to a specific Palace Guide Source entry.",
      },
    };
  }

  return {
    sourceCards: [],
    verification: {
      label: "Local source limited",
      status: "missing",
      message:
        "The local guide content does not yet provide enough specific source material; treat the answer as conservative orientation only.",
    },
  };
}

async function handleIntent({
  request,
  context,
}: {
  request: GuideRequest;
  context: ResolvedGuideContext;
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

export async function requestStaticGuideResponse(
  request: GuideRequest
): Promise<GuideResponse> {
  const guideRequest: GuideRequest = {
    ...request,
    language: request.language ?? DEFAULT_APP_LANGUAGE,
    intent: request.intent ?? "answer",
  };
  const context = resolveGuideContext(guideRequest);
  const startedAt = performance.now();
  const result = await handleIntent({
    request: guideRequest,
    context,
  });
  const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));
  const verificationPayload = buildVerificationPayload({
    context,
    language: guideRequest.language ?? DEFAULT_APP_LANGUAGE,
  });

  return {
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
    sourceCards: verificationPayload.sourceCards,
    verification: verificationPayload.verification,
    aiLabel: AI_GENERATED_LABEL,
    meta: {
      provider: result.provider,
      latencyMs,
    },
  };
}
