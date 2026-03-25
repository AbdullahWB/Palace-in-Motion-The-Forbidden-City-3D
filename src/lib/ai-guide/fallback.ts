import type { GuideMode, ResolvedGuideContext } from "@/types/ai-guide";

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

export function buildFallbackAnswer({
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
