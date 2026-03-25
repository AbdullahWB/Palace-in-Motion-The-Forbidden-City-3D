import { getPostcardFrameById } from "@/data/selfie";
import type {
  GuideIntent,
  GuideMode,
  GuideRequest,
  ResolvedGuideContext,
} from "@/types/ai-guide";

function getAnswerModeInstruction(mode: GuideMode) {
  switch (mode) {
    case "short":
      return "Answer in 1 to 2 concise sentences.";
    case "fun":
      return "Answer with a short engaging narration or fun fact, while staying accurate and grounded.";
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
    default:
      return "Write a short playful postcard caption or engaging narration in 1 to 2 sentences.";
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

function buildAnswerPrompts({
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
    getAnswerModeInstruction(mode),
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

function buildCaptionPrompts({
  context,
  request,
}: {
  context: ResolvedGuideContext;
  request: Pick<
    GuideRequest,
    "mode" | "question" | "postcardThemeId" | "title" | "focusId"
  >;
}) {
  const frame = request.postcardThemeId
    ? getPostcardFrameById(request.postcardThemeId)
    : null;
  const systemPrompt = [
    "You are the Palace in Motion AI cultural guide helping with a souvenir postcard.",
    "Behave like a scene-aware museum assistant, not a generic marketer or chatbot.",
    "Use only the grounded local context provided below.",
    "Write only the postcard caption text.",
    "Do not use hashtags, emojis, quotation marks, bullet points, or unsupported claims.",
    "Keep the tone elegant, museum-like, and culturally respectful.",
    getCaptionModeInstruction(request.mode),
  ].join(" ");

  const userPrompt = [
    `Mode: ${request.mode}`,
    `Theme preset: ${frame?.title ?? "None selected"}`,
    `Theme description: ${frame?.description ?? "None."}`,
    `Ribbon label: ${frame?.ribbonLabel ?? "None."}`,
    `Focus label: ${context.focusLabel ?? context.contextLabel}`,
    `Optional postcard title: ${request.title?.trim() || "None."}`,
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
    "intent" | "mode" | "question" | "postcardThemeId" | "title" | "focusId"
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
    question: request.question,
    mode: request.mode,
  });
}
