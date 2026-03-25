import type { GuideMode, ResolvedGuideContext } from "@/types/ai-guide";

function getModeInstruction(mode: GuideMode) {
  switch (mode) {
    case "short":
      return "Answer in 1 to 2 concise sentences.";
    case "fun":
      return "Answer with a short engaging narration or fun fact, while staying accurate and grounded.";
    default:
      return "Answer with one compact explanatory paragraph.";
  }
}

function formatQuickFacts(context: ResolvedGuideContext) {
  if (!context.quickFacts.length) {
    return "None.";
  }

  return context.quickFacts
    .map((fact) => `- ${fact.title}: ${fact.body}`)
    .join("\n");
}

export function buildGuideMessages({
  context,
  question,
  mode,
}: {
  context: ResolvedGuideContext;
  question: string;
  mode: GuideMode;
}) {
  const systemPrompt = [
    "You are the Palace in Motion AI cultural guide.",
    "Behave like a scene-aware museum assistant, not a generic chatbot.",
    "Use only the grounded local context provided below.",
    "If the answer is not supported by the local context, say so conservatively and avoid speculation.",
    "Keep the tone calm, informed, and culturally respectful.",
    getModeInstruction(mode),
  ].join(" ");

  const userPrompt = [
    `Mode: ${mode}`,
    `Context label: ${context.contextLabel}`,
    `Has specific hotspot or tour context: ${context.hasSpecificContext ? "yes" : "no"}`,
    "",
    "Site overview:",
    `${context.site.headline} ${context.site.summary}`,
    "",
    "Hotspot context:",
    context.hotspot
      ? `${context.hotspot.title} (${context.hotspot.shortLabel}) - ${context.hotspot.hotspotDescription}`
      : "None.",
    "",
    "Tour step context:",
    context.tourStep
      ? `${context.tourStep.title} - ${context.tourStep.explanation}`
      : "None.",
    "",
    "Quick facts:",
    formatQuickFacts(context),
    "",
    `User question: ${question}`,
  ].join("\n");

  return [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];
}
