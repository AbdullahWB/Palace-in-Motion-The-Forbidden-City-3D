import {
  buildCustomTourRecommendation,
  getPalaceKnowledgeByPlaceSlug,
  getQuizQuestionForPlace,
} from "@/data/palace-knowledge";
import { exploreExperience, getExplorePlaceBySlug } from "@/data/panorama";
import { pickLocalizedText } from "@/lib/i18n";
import { requestDeepSeekAnswer } from "@/lib/ai-guide/deepseek";
import { buildFallbackGuideResult } from "@/lib/ai-guide/fallback";
import { buildGuideMessages } from "@/lib/ai-guide/prompt";
import type {
  CustomTourState,
  GuideCaptionPayload,
  GuideMode,
  GuideQuizPayload,
  GuideRequest,
  GuideResponse,
  GuideSiteActionPayload,
  ResolvedGuideContext,
  TourBuilderInterest,
} from "@/types/ai-guide";
import type { ExplorePlaceSlug } from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

type AdapterResult = Pick<
  GuideResponse,
  "answer" | "fallback" | "caption" | "quiz" | "customTour" | "siteAction"
> & {
  provider: "deepseek" | "fallback";
};

export type GroundedGuideInput = {
  context: ResolvedGuideContext;
  request: GuideRequest;
};

export type AIGuideProviderAdapter = {
  answerGuideQuestion: (input: GroundedGuideInput) => Promise<AdapterResult>;
  generateCaption: (input: GroundedGuideInput) => Promise<AdapterResult>;
  generateQuiz: (input: GroundedGuideInput) => Promise<AdapterResult>;
  buildTour: (input: GroundedGuideInput) => Promise<AdapterResult>;
  handleSiteAction: (input: GroundedGuideInput) => Promise<AdapterResult>;
};

export const AI_GENERATED_LABEL =
  "AI-generated explanation based on palace guide content.";

function normalizeCaptionText(input: string) {
  const noQuotes = input.replace(/^["'`]+|["'`]+$/g, "");
  const singleLine = noQuotes.replace(/\s*\n+\s*/g, " ").replace(/\s{2,}/g, " ");
  return singleLine.trim();
}

async function requestProviderText({ context, request }: GroundedGuideInput) {
  const messages = buildGuideMessages({
    context,
    request,
  });

  try {
    const result = await requestDeepSeekAnswer({
      messages,
      mode: request.mode,
    });

    if (result?.trim()) {
      return {
        answer: result.trim(),
        provider: "deepseek" as const,
        fallback: false,
      };
    }
  } catch {
    // The adapter must never block navigation or local guide features.
  }

  return {
    answer: buildFallbackGuideResult({ context, request }).trim(),
    provider: "fallback" as const,
    fallback: true,
  };
}

function getLanguage(request: GuideRequest): AppLanguage {
  return request.language ?? "en";
}

function localizeQuiz(
  placeSlug: ExplorePlaceSlug,
  language: AppLanguage
): GuideQuizPayload | null {
  const question = getQuizQuestionForPlace(placeSlug);
  const knowledge = getPalaceKnowledgeByPlaceSlug(placeSlug);

  if (!question || !knowledge) {
    return null;
  }

  return {
    placeSlug,
    questionId: question.id,
    question: pickLocalizedText(question.question, language),
    options: question.options.map((option) => ({
      id: option.id,
      text: pickLocalizedText(option.text, language),
    })),
    correctOptionId: question.correctOptionId,
    explanation: pickLocalizedText(question.explanation, language),
    stampLabel: pickLocalizedText(question.stampLabel, language),
    sourceNote: pickLocalizedText(knowledge.sourceNote, language),
  };
}

function resolveQuizPlaceSlug({
  request,
  context,
}: GroundedGuideInput): ExplorePlaceSlug | null {
  if (request.placeSlug) {
    return request.placeSlug;
  }

  if (context.placeKnowledge) {
    return context.placeKnowledge.placeSlug;
  }

  const route = exploreExperience.journeys.find(
    (journey) => journey.id === request.journeyRouteId
  );

  return route?.placeOrder[0] ?? exploreExperience.places[0]?.slug ?? null;
}

function normalizeTimeBudget(value: GuideRequest["timeBudget"]): 5 | 10 | 20 {
  return value === 5 || value === 10 || value === 20 ? value : 10;
}

function normalizeInterests(interests: GuideRequest["interests"]): TourBuilderInterest[] {
  const allowed = new Set<TourBuilderInterest>([
    "architecture",
    "history",
    "gardens",
    "photography",
    "overview",
  ]);

  return (interests ?? []).filter((interest): interest is TourBuilderInterest =>
    allowed.has(interest)
  );
}

function formatCustomTourAnswer(tour: CustomTourState, language: AppLanguage) {
  const stops = tour.orderedPlaceSlugs
    .map((placeSlug, index) => {
      const place = getExplorePlaceBySlug(placeSlug);
      return `${index + 1}. ${pickLocalizedText(place?.title, language)}`;
    })
    .join("\n");

  return `${tour.explanation}\n\n${stops}`;
}

function detectRequestedLanguage(question: string): AppLanguage | null {
  const isLanguageCommand =
    /\b(switch|change|set|use)\b.*\b(language|english|chinese|en|zh)\b/.test(
      question
    ) ||
    /\b(switch|change|set|use)\s+to\s+(english|chinese)\b/.test(question) ||
    /切换|换成|改成|语言/.test(question);

  if (!isLanguageCommand) {
    return null;
  }

  if (/\b(english|en)\b|英文|英语/.test(question)) {
    return "en";
  }

  if (/\b(chinese|zh)\b|中文|汉语|普通话/.test(question)) {
    return "zh";
  }

  return null;
}

function detectRequestedGuideMode(question: string): GuideMode | null {
  const isModeCommand =
    /\b(switch|change|set|use)\b.*\b(mode|style)\b/.test(question) ||
    /切换|换成|改成|模式|风格/.test(question);

  if (!isModeCommand) {
    return null;
  }

  if (/\bacademic\b|学术/.test(question)) {
    return "academic";
  }

  if (/\bchild|child-friendly\b|儿童|孩子/.test(question)) {
    return "child";
  }

  if (/\btourist\b|游客|导游/.test(question)) {
    return "tourist";
  }

  if (/\bfun\b|趣味|有趣/.test(question)) {
    return "fun";
  }

  if (/\bdetailed|detail\b|详细/.test(question)) {
    return "detailed";
  }

  if (/\bquiz|test\b|测验|考/.test(question)) {
    return "quiz";
  }

  if (/\bshort|brief\b|简短|简答/.test(question)) {
    return "short";
  }

  return null;
}

function detectSiteAction({
  request,
}: GroundedGuideInput): GuideSiteActionPayload | null {
  const normalizedQuestion = request.question.toLowerCase();
  const requestedLanguage = detectRequestedLanguage(normalizedQuestion);

  if (requestedLanguage) {
    return {
      command: "switch_language",
      label:
        requestedLanguage === "zh"
          ? "Switch language to Chinese"
          : "Switch language to English",
      language: requestedLanguage,
    };
  }

  const requestedMode = detectRequestedGuideMode(normalizedQuestion);

  if (requestedMode) {
    return {
      command: "switch_guide_mode",
      label: `Switch guide mode to ${requestedMode}`,
      mode: requestedMode,
    };
  }

  if (normalizedQuestion.includes("passport")) {
    return {
      command: "open_passport",
      label: "Open Passport",
    };
  }

  if (normalizedQuestion.includes("map")) {
    return {
      command: "open_map",
      label: "Open palace map",
      routeId: request.journeyRouteId ?? null,
    };
  }

  if (
    normalizedQuestion.includes("next stop") ||
    normalizedQuestion.includes("next place") ||
    normalizedQuestion.includes("下一站") ||
    normalizedQuestion.includes("下一处")
  ) {
    return {
      command: "next_stop",
      label: "Move to next stop",
      routeId: request.journeyRouteId ?? null,
    };
  }

  if (normalizedQuestion.includes("continue")) {
    return {
      command: "continue_route",
      label: "Continue route",
      routeId: request.journeyRouteId ?? null,
    };
  }

  if (
    normalizedQuestion.includes("start route") ||
    normalizedQuestion.includes("start tour")
  ) {
    return {
      command: "start_route",
      label: "Start route",
      routeId: request.journeyRouteId ?? null,
    };
  }

  if (request.placeSlug && normalizedQuestion.includes("open")) {
    return {
      command: "open_place",
      label: "Open current place",
      placeSlug: request.placeSlug,
      routeId: request.journeyRouteId ?? null,
    };
  }

  return null;
}

export const defaultAIGuideAdapter: AIGuideProviderAdapter = {
  async answerGuideQuestion(input) {
    return requestProviderText(input);
  },

  async generateCaption(input) {
    const result = await requestProviderText(input);
    const caption: GuideCaptionPayload = {
      text: normalizeCaptionText(result.answer),
      focusLabel: input.context.focusLabel ?? input.context.contextLabel,
      themeId: input.request.postcardThemeId ?? null,
    };

    return {
      ...result,
      caption,
      answer: caption.text,
    };
  },

  async generateQuiz(input) {
    const language = getLanguage(input.request);
    const placeSlug = resolveQuizPlaceSlug(input);
    const quiz = placeSlug ? localizeQuiz(placeSlug, language) : null;

    if (!quiz) {
      return {
        answer:
          language === "zh"
            ? "Guide quiz content is not available for this place yet."
            : "Guide quiz content is not available for this place yet.",
        fallback: true,
        provider: "fallback",
      };
    }

    const answer = [
      quiz.question,
      ...quiz.options.map((option) => `${option.id.toUpperCase()}. ${option.text}`),
    ].join("\n");

    return {
      answer,
      fallback: true,
      provider: "fallback",
      quiz,
    };
  },

  async buildTour(input) {
    const language = getLanguage(input.request);
    const customTour = buildCustomTourRecommendation({
      timeBudget: normalizeTimeBudget(input.request.timeBudget),
      interests: normalizeInterests(input.request.interests),
      language,
    });

    return {
      answer: formatCustomTourAnswer(customTour, language),
      fallback: true,
      provider: "fallback",
      customTour,
    };
  },

  async handleSiteAction(input) {
    const action = detectSiteAction(input);

    if (!action) {
      return {
        answer:
          "I can open the map, open the Passport, start a route, continue a route, move to the next stop, open the current place, switch language, or change guide mode.",
        fallback: true,
        provider: "fallback",
      };
    }

    return {
      answer: action.label,
      fallback: true,
      provider: "fallback",
      siteAction: action,
    };
  },
};
