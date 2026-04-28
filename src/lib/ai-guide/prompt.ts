import { getPostcardFrameById } from "@/data/selfie";
import type {
  GuideIntent,
  GuideRequest,
  GuideMode,
  ResolvedGuideContext,
} from "@/types/ai-guide";
import type { AppLanguage } from "@/types/preferences";

function getAnswerModeInstruction(mode: GuideMode) {
  switch (mode) {
    case "short":
      return "Answer in 1 to 2 concise sentences.";
    case "child":
      return "Explain in simple child-friendly language without talking down to the visitor.";
    case "tourist":
      return "Answer like a practical museum audio guide for a first-time tourist.";
    case "academic":
      return "Answer in a concise academic museum-label style, with cautious claims and clear source limits.";
    case "exam":
      return "Answer as concise study notes: define the key idea, list 2 to 3 exam-relevant points, and keep claims grounded.";
    case "quiz":
      return "Keep the answer quiz-like: ask one clear check-your-understanding question if useful.";
    case "fun":
      return "Answer with a short engaging narration or fun fact, while staying accurate and grounded.";
    case "story":
      return "Answer as a grounded historical route story: connect the place to movement, sequence, and atmosphere without inventing facts.";
    default:
      return "Answer with one compact explanatory paragraph.";
  }
}

function getCaptionModeInstruction(mode: GuideMode) {
  switch (mode) {
    case "short":
      return "Write one concise postcard caption sentence.";
    case "detailed":
      return "Write 2 compact postcard sentences with a little more texture, but keep them readable and elegant.";
    case "child":
      return "Write one warm, simple caption that a younger visitor could understand.";
    case "tourist":
      return "Write one practical souvenir caption for a first-time visitor.";
    case "academic":
      return "Write one formal museum-style caption grounded in the approved guide content.";
    case "exam":
      return "Write one study-note style caption that names the key visual detail and its meaning.";
    case "quiz":
      return "Write one caption that points to one noticeable detail.";
    case "story":
      return "Write one story-like caption that connects the scene to the palace journey.";
    default:
      return "Write a short playful postcard caption or engaging narration in 1 to 2 sentences.";
  }
}

function getLanguageInstruction(language: AppLanguage, intent: GuideIntent) {
  if (language === "zh") {
    return intent === "caption"
      ? "Write in Simplified Chinese only."
      : "Answer in Simplified Chinese only.";
  }

  return intent === "caption"
    ? "Write in English only."
    : "Answer in English only.";
}

function formatQuickFacts(context: ResolvedGuideContext) {
  if (!context.quickFacts.length) {
    return "None.";
  }

  return context.quickFacts
    .map((fact) => `- ${fact.title}: ${fact.body}`)
    .join("\n");
}

function formatPlaceKnowledge(context: ResolvedGuideContext, language: AppLanguage) {
  const knowledge = context.placeKnowledge;

  if (!knowledge) {
    return "No approved place knowledge is attached. If the user asks for place-specific historical facts, say that this is not available in the local Palace Guide Source yet.";
  }

  return [
    `Place slug: ${knowledge.placeSlug}`,
    `Source title: ${pickLanguage(knowledge.sourceTitle, language)}`,
    `Source status: ${knowledge.sourceStatus}`,
    `Source confidence: ${knowledge.sourceConfidence}`,
    `Short description: ${pickLanguage(knowledge.shortDescription, language)}`,
    `History note: ${pickLanguage(knowledge.historyNote, language)}`,
    `Preservation note: ${pickLanguage(knowledge.preservationNote, language)}`,
    `Accessibility summary: ${pickLanguage(knowledge.accessibilitySummary, language)}`,
    `Learning tags: ${knowledge.learningTags
      .map((item) => pickLanguage(item, language))
      .join("; ")}`,
    `Things to notice: ${knowledge.thingsToNotice
      .map((item) => pickLanguage(item, language))
      .join("; ")}`,
    `Source note: ${pickLanguage(knowledge.sourceNote, language)}`,
  ].join("\n");
}

function pickLanguage(copy: { zh: string; en: string }, language: AppLanguage) {
  const primary = language === "zh" ? copy.zh : copy.en;
  const fallback = language === "zh" ? copy.en : copy.zh;

  return primary.trim() || fallback.trim();
}

function buildAnswerPrompts({
  context,
  request,
}: {
  context: ResolvedGuideContext;
  request: Pick<
    GuideRequest,
    | "mode"
    | "question"
    | "title"
    | "contextHint"
    | "language"
    | "journeyTitle"
    | "journeyDescription"
    | "journeyStopIndex"
    | "journeyStopTotal"
    | "frameCaption"
  >;
}) {
  const systemPrompt = [
    "You are the Palace in Motion AI cultural guide.",
    "Behave like a scene-aware museum assistant, not a generic chatbot.",
    "Use only the grounded local context provided below.",
    "If the answer is not supported by the local context, say so conservatively and avoid speculation.",
    "This is single-turn assistance. Do not reference previous turns or hidden context.",
    getLanguageInstruction(request.language ?? "en", "answer"),
    "Keep answers concise and concrete.",
    "Keep the tone calm, informed, and culturally respectful.",
    getAnswerModeInstruction(request.mode),
  ].join(" ");

  const userPrompt = [
    `Mode: ${request.mode}`,
    `Context label: ${context.contextLabel}`,
    `Has specific hotspot or tour context: ${context.hasSpecificContext ? "yes" : "no"}`,
    `Assistant lens: ${request.contextHint?.trim() || "Default cultural guide"}`,
    `Visitor page context: ${request.title?.trim() || "None."}`,
    `Journey title: ${request.journeyTitle?.trim() || "None."}`,
    `Journey description: ${request.journeyDescription?.trim() || "None."}`,
    `Journey stop: ${
      request.journeyStopIndex && request.journeyStopTotal
        ? `${request.journeyStopIndex}/${request.journeyStopTotal}`
        : "None."
    }`,
    `Frame caption: ${request.frameCaption?.trim() || "None."}`,
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
    "Approved place knowledge:",
    formatPlaceKnowledge(context, request.language ?? "en"),
    "",
    "Quick facts:",
    formatQuickFacts(context),
    "",
    `User question: ${request.question}`,
  ].join("\n");

  return [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];
}

function buildCaptionPrompts({
  context,
  request,
}: {
  context: ResolvedGuideContext;
  request: Pick<
    GuideRequest,
    | "mode"
    | "question"
    | "postcardThemeId"
    | "title"
    | "focusId"
    | "contextHint"
    | "language"
    | "journeyTitle"
    | "journeyDescription"
  >;
}) {
  const frame = request.postcardThemeId
    ? getPostcardFrameById(request.postcardThemeId)
    : null;
  const systemPrompt = [
    "You are the Palace in Motion AI cultural guide helping with a souvenir postcard.",
    "Behave like a scene-aware museum assistant, not a generic marketer or chatbot.",
    "Use only the grounded local context provided below.",
    "This is single-turn assistance. Do not reference previous turns or hidden context.",
    getLanguageInstruction(request.language ?? "en", "caption"),
    "Write only the postcard caption text.",
    "Do not use hashtags, emojis, quotation marks, bullet points, or unsupported claims.",
    "Keep the caption concise, elegant, museum-like, and culturally respectful.",
    getCaptionModeInstruction(request.mode),
  ].join(" ");

  const userPrompt = [
    `Mode: ${request.mode}`,
    `Assistant lens: ${request.contextHint?.trim() || "Default cultural guide"}`,
    `Theme preset: ${frame?.title ?? "None selected"}`,
    `Theme description: ${frame?.description ?? "None."}`,
    `Ribbon label: ${frame?.ribbonLabel ?? "None."}`,
    `Focus label: ${context.focusLabel ?? context.contextLabel}`,
    `Optional postcard title: ${request.title?.trim() || "None."}`,
    `Journey title: ${request.journeyTitle?.trim() || "None."}`,
    `Journey description: ${request.journeyDescription?.trim() || "None."}`,
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
    "Approved place knowledge:",
    formatPlaceKnowledge(context, request.language ?? "en"),
    "",
    "Quick facts:",
    formatQuickFacts(context),
    "",
    `Caption request: ${request.question}`,
  ].join("\n");

  return [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];
}

export function buildGuideMessages({
  context,
  request,
}: {
  context: ResolvedGuideContext;
  request: Pick<
    GuideRequest,
    | "intent"
    | "mode"
    | "question"
    | "postcardThemeId"
    | "title"
    | "focusId"
    | "contextHint"
    | "language"
    | "journeyTitle"
    | "journeyDescription"
    | "journeyStopIndex"
    | "journeyStopTotal"
    | "frameCaption"
  >;
}) {
  const intent: GuideIntent = request.intent ?? "answer";

  if (intent === "caption") {
    return buildCaptionPrompts({
      context,
      request,
    });
  }

  return buildAnswerPrompts({
    context,
    request,
  });
}
