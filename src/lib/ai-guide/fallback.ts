import { getPostcardFrameById } from "@/data/selfie";
import type { GuideMode, GuideRequest, ResolvedGuideContext } from "@/types/ai-guide";
import type { AppLanguage } from "@/types/preferences";

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
  contextHint,
  title,
  question,
  language,
}: Pick<
  GuideRequest,
  "mode" | "postcardThemeId" | "title" | "question" | "contextHint" | "language"
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
  const prefixParts = [title?.trim(), contextHint?.trim()].filter(Boolean);
  const prefix = prefixParts.length ? `${prefixParts.join(" - ")} - ` : "";

  if (language === "zh") {
    switch (mode) {
      case "short":
        return `${prefix}${focusLabel}在对称、门序与礼制节奏中展开。`;
      case "detailed":
        return [
          `${prefix}${focusLabel}顺着故宫礼仪路线收束视线与节奏。`,
          anchor,
        ].join(" ");
      default:
        return [
          `${prefix}${frame?.title ?? "Palace in Motion"}把${focusLabel}定格在一段带有宫廷秩序感的瞬间。`,
          anchor,
        ].join(" ");
    }
  }

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
  contextHint,
  language,
}: {
  context: ResolvedGuideContext;
  question: string;
  mode: GuideMode;
  contextHint?: string | null;
  language: AppLanguage;
}) {
  const focusSummary =
    context.tourStep?.explanation ??
    context.hotspot?.tourExplanation ??
    context.hotspot?.hotspotDescription ??
    context.site.summary;
  const relevantFact = pickRelevantFact(context, question);

  if (!context.hasSpecificContext && language === "zh") {
    return [
      "我会依据当前页面内可用的本地场景资料谨慎回答。",
      contextHint ? `当前视角：${contextHint}。` : "",
      context.site.summary,
      relevantFact ? `可参考的一条信息是：${relevantFact.body}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (!context.hasSpecificContext) {
    return [
      "I can answer cautiously from the current local scene material.",
      contextHint ? `Current lens: ${contextHint}.` : "",
      context.site.summary,
      relevantFact ? `A useful anchor here is: ${relevantFact.body}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (language === "zh") {
    switch (mode) {
      case "short":
        return [
          `${context.contextLabel}：${focusSummary}`,
          contextHint ? `观察视角：${contextHint}。` : "",
          relevantFact ? `可抓住的一点：${relevantFact.body}` : "",
        ]
          .filter(Boolean)
          .join(" ");
      case "fun":
        return relevantFact
          ? `关于${context.contextLabel}${contextHint ? `，从${contextHint}角度看` : ""}，有一个值得注意的细节：${relevantFact.body}`
          : `关于${context.contextLabel}${contextHint ? `，从${contextHint}角度看` : ""}，可先把握这个重点：${focusSummary}`;
      default:
        return [
          `在当前${context.contextLabel}的语境下，${focusSummary}`,
          contextHint ? `这次回答按照“${contextHint}”的视角来组织。` : "",
          relevantFact ? `支撑这一点的细节是：${relevantFact.body}` : "",
          "这个回答保持保守，因为我只依据应用内可用的本地文化内容进行说明。",
        ]
          .filter(Boolean)
          .join(" ");
    }
  }

  switch (mode) {
    case "short":
      return [
        `${context.contextLabel}: ${focusSummary}`,
        contextHint ? `Lens: ${contextHint}.` : "",
        relevantFact ? `Quick anchor: ${relevantFact.body}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "fun":
      return relevantFact
        ? `A scene-aware detail about ${context.contextLabel}${contextHint ? ` through the ${contextHint} lens` : ""}: ${relevantFact.body}`
        : `A scene-aware detail about ${context.contextLabel}${contextHint ? ` through the ${contextHint} lens` : ""}: ${focusSummary}`;
    default:
      return [
        `Within the current context of ${context.contextLabel}, ${focusSummary}`,
        contextHint ? `This answer is being framed through the ${contextHint} lens.` : "",
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
      contextHint: request.contextHint,
      title: request.title,
      question: request.question,
      language: request.language ?? "en",
    });
  }

  return buildFallbackAnswer({
    context,
    question: request.question,
    mode: request.mode,
    contextHint: request.contextHint,
    language: request.language ?? "en",
  });
}
