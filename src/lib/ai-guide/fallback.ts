import { getPostcardFrameById } from "@/data/selfie";
import type { GuideMode, GuideRequest, ResolvedGuideContext } from "@/types/ai-guide";

function pickRelevantFact(context: ResolvedGuideContext, question: string) {
  const lowerQuestion = question.toLowerCase();

  return (
    context.quickFacts.find((fact) => {
      const title = fact.title.toLowerCase();
      const body = fact.body.toLowerCase();
      return lowerQuestion.includes(title) || lowerQuestion.split(" ").some((word) => body.includes(word));
    }) ?? context.quickFacts[0] ?? null
  );
}

function buildFallbackCaption({
  context,
  mode,
  postcardThemeId,
  title,
  question,
}: Pick<
  GuideRequest,
  "mode" | "postcardThemeId" | "title" | "question"
> & {
  context: ResolvedGuideContext;
}) {
  const frame = postcardThemeId ? getPostcardFrameById(postcardThemeId) : null;
  const focusLabel = context.focusLabel ?? context.contextLabel;
  const focusSummary =
    context.hotspot?.hotspotDescription ??
    context.tourStep?.explanation ??
    context.site.summary;
  const relevantFact = pickRelevantFact(context, question);
  const anchor = relevantFact?.body ?? focusSummary;
  const prefix = title?.trim() ? `${title.trim()} - ` : "";

  switch (mode) {
    case "short":
      return `${prefix}${focusLabel} framed by symmetry, threshold, and ceremonial order.`;
    case "detailed":
      return [
        `${prefix}${focusLabel} holds the eye along the Forbidden City's ceremonial route.`,
        anchor,
      ].join(" ");
    default:
      return [
        `${prefix}${frame?.title ?? "Palace in Motion"} catches ${focusLabel} in a moment shaped by imperial sequence.`,
        anchor,
      ].join(" ");
  }
}

function buildFallbackAnswer({
  context,
  question,
  mode,
}: {
  context: ResolvedGuideContext;
  question: string;
  mode: GuideMode;
}) {
  const focusSummary =
    context.tourStep?.explanation ??
    context.hotspot?.tourExplanation ??
    context.hotspot?.hotspotDescription ??
    context.site.summary;
  const relevantFact = pickRelevantFact(context, question);

  if (!context.hasSpecificContext) {
    return [
      "I can answer cautiously from the current local scene material.",
      context.site.summary,
      relevantFact ? `A useful anchor here is: ${relevantFact.body}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  switch (mode) {
    case "short":
      return [
        `${context.contextLabel}: ${focusSummary}`,
        relevantFact ? `Quick anchor: ${relevantFact.body}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "fun":
      return relevantFact
        ? `A scene-aware detail about ${context.contextLabel}: ${relevantFact.body}`
        : `A scene-aware detail about ${context.contextLabel}: ${focusSummary}`;
    default:
      return [
        `Within the current context of ${context.contextLabel}, ${focusSummary}`,
        relevantFact ? `One supporting detail is that ${relevantFact.body}` : "",
        "I am keeping this answer conservative because I am only using the local heritage content available in the app.",
      ]
        .filter(Boolean)
        .join(" ");
  }
}

export function buildFallbackGuideResult({
  context,
  request,
}: {
  context: ResolvedGuideContext;
  request: GuideRequest;
}) {
  if (request.intent === "caption") {
    return buildFallbackCaption({
      context,
      mode: request.mode,
      postcardThemeId: request.postcardThemeId,
      title: request.title,
      question: request.question,
    });
  }

  return buildFallbackAnswer({
    context,
    question: request.question,
    mode: request.mode,
  });
}
