import { getPostcardFrameById } from "@/data/selfie";
import { pickLocalizedText } from "@/lib/i18n";
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

function buildRouteLead({
  journeyTitle,
  journeyDescription,
  journeyStopIndex,
  journeyStopTotal,
  frameCaption,
  language,
}: {
  journeyTitle?: string | null;
  journeyDescription?: string | null;
  journeyStopIndex?: number | null;
  journeyStopTotal?: number | null;
  frameCaption?: string | null;
  language: AppLanguage;
}) {
  const segments: string[] = [];

  if (journeyTitle && journeyDescription) {
    segments.push(
      language === "zh"
        ? `当前路线“${journeyTitle}”强调：${journeyDescription}`
        : `The active journey "${journeyTitle}" emphasizes ${journeyDescription}.`
    );
  }

  if (journeyStopIndex && journeyStopTotal) {
    segments.push(
      language === "zh"
        ? `当前停留为第 ${journeyStopIndex}/${journeyStopTotal} 站。`
        : `This is stop ${journeyStopIndex}/${journeyStopTotal}.`
    );
  }

  if (frameCaption) {
    segments.push(
      language === "zh"
        ? `当前子场景：${frameCaption}。`
        : `Current frame: ${frameCaption}.`
    );
  }

  return segments;
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
      case "academic":
        return [
          `${prefix}${focusLabel}依据已审核的故宫导览内容进行呈现。`,
          anchor,
        ].join(" ");
      case "exam":
        return [
          `${prefix}${focusLabel}可作为学习要点来记忆。`,
          anchor,
        ].join(" ");
      case "story":
        return [
          `${prefix}${focusLabel}在这段故宫旅程中形成一个可以继续向前阅读的场景。`,
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
    case "academic":
      return [
        `${prefix}${focusLabel} is presented through the approved palace guide context.`,
        anchor,
      ].join(" ");
    case "exam":
      return [
        `${prefix}${focusLabel} can be remembered as a study-note point.`,
        anchor,
      ].join(" ");
    case "story":
      return [
        `${prefix}${focusLabel} becomes one scene in the continuing palace journey.`,
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
  journeyTitle,
  journeyDescription,
  journeyStopIndex,
  journeyStopTotal,
  frameCaption,
  language,
}: {
  context: ResolvedGuideContext;
  question: string;
  mode: GuideMode;
  contextHint?: string | null;
  journeyTitle?: string | null;
  journeyDescription?: string | null;
  journeyStopIndex?: number | null;
  journeyStopTotal?: number | null;
  frameCaption?: string | null;
  language: AppLanguage;
}) {
  const knowledgeSummary = context.placeKnowledge
    ? pickLocalizedText(context.placeKnowledge.historyNote, language)
    : null;
  const noticeSummary = context.placeKnowledge?.thingsToNotice.length
    ? context.placeKnowledge.thingsToNotice
        .slice(0, 2)
        .map((item) => pickLocalizedText(item, language))
        .join(" ")
    : null;
  const focusSummary =
    knowledgeSummary ??
    context.tourStep?.explanation ??
    context.hotspot?.tourExplanation ??
    context.hotspot?.hotspotDescription ??
    context.site.summary;
  const relevantFact = pickRelevantFact(context, question);
  const routeLead = buildRouteLead({
    journeyTitle,
    journeyDescription,
    journeyStopIndex,
    journeyStopTotal,
    frameCaption,
    language,
  });

  if (!context.hasSpecificContext && language === "zh") {
    return [
      "我会依据当前页面内可用的本地场景资料谨慎回答。",
      contextHint ? `当前视角：${contextHint}。` : "",
      ...routeLead,
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
      ...routeLead,
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
          ...routeLead,
          relevantFact ? `可抓住的一点：${relevantFact.body}` : "",
        ]
          .filter(Boolean)
          .join(" ");
      case "fun":
        return relevantFact
          ? [
              `关于${context.contextLabel}${contextHint ? `，从${contextHint}角度看` : ""}，有一个值得注意的细节：${relevantFact.body}`,
              ...routeLead,
            ]
              .filter(Boolean)
              .join(" ")
          : [
              `关于${context.contextLabel}${contextHint ? `，从${contextHint}角度看` : ""}，可先把握这个重点：${focusSummary}`,
              ...routeLead,
            ]
              .filter(Boolean)
              .join(" ");
      case "academic":
        return [
          `在${context.contextLabel}的已审核导览语境中，${focusSummary}`,
          noticeSummary ? `可观察要点：${noticeSummary}` : "",
          ...routeLead,
          relevantFact ? `可作为支撑的本地说明：${relevantFact.body}` : "",
          "本回答仅依据应用内结构化故宫导览内容。",
        ]
          .filter(Boolean)
          .join(" ");
      case "exam":
        return [
          `考点：${context.contextLabel}。`,
          `核心理解：${focusSummary}`,
          noticeSummary ? `记忆要点：${noticeSummary}` : "",
          ...routeLead,
          relevantFact ? `可引用细节：${relevantFact.body}` : "",
        ]
          .filter(Boolean)
          .join(" ");
      case "story":
        return [
          `沿着当前路线来到${context.contextLabel}时，故事的重点转向：${focusSummary}`,
          noticeSummary ? `画面中可以继续观察：${noticeSummary}` : "",
          ...routeLead,
          relevantFact ? `这个叙事由一条本地资料支撑：${relevantFact.body}` : "",
        ]
          .filter(Boolean)
          .join(" ");
      default:
        return [
          `在当前${context.contextLabel}的语境下，${focusSummary}`,
          contextHint ? `这次回答按照“${contextHint}”的视角来组织。` : "",
          ...routeLead,
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
        ...routeLead,
        noticeSummary ? `Notice: ${noticeSummary}` : "",
        relevantFact ? `Quick anchor: ${relevantFact.body}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "child":
      return [
        `${context.contextLabel} is one stop in the palace story.`,
        focusSummary,
        noticeSummary ? `Look for this: ${noticeSummary}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "tourist":
      return [
        `For a first visit, use ${context.contextLabel} as a clear orientation point.`,
        focusSummary,
        noticeSummary ? `What to notice: ${noticeSummary}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "academic":
      return [
        `In the approved guide context for ${context.contextLabel}, ${focusSummary}`,
        noticeSummary ? `Key observable details: ${noticeSummary}` : "",
        ...routeLead,
        relevantFact ? `A supporting local note is: ${relevantFact.body}` : "",
        "This answer is limited to the app's structured palace guide content.",
      ]
        .filter(Boolean)
        .join(" ");
    case "exam":
      return [
        `Exam note: ${context.contextLabel}.`,
        `Core idea: ${focusSummary}`,
        noticeSummary ? `Memory points: ${noticeSummary}` : "",
        ...routeLead,
        relevantFact ? `Useful supporting detail: ${relevantFact.body}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "story":
      return [
        `As the journey reaches ${context.contextLabel}, the story turns toward this idea: ${focusSummary}`,
        noticeSummary ? `In the scene, keep following: ${noticeSummary}` : "",
        ...routeLead,
        relevantFact ? `A grounded detail supporting this reading is: ${relevantFact.body}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "quiz":
      return [
        `${context.contextLabel}: ${focusSummary}`,
        noticeSummary ? `Quiz hint: ${noticeSummary}` : "",
        "Try answering one passport quiz question to unlock a stamp.",
      ]
        .filter(Boolean)
        .join(" ");
    case "fun":
      return [
        relevantFact
          ? `A scene-aware detail about ${context.contextLabel}${contextHint ? ` through the ${contextHint} lens` : ""}: ${relevantFact.body}`
          : `A scene-aware detail about ${context.contextLabel}${contextHint ? ` through the ${contextHint} lens` : ""}: ${focusSummary}`,
        ...routeLead,
      ]
        .filter(Boolean)
        .join(" ");
    default:
      return [
        `Within the current context of ${context.contextLabel}, ${focusSummary}`,
        contextHint ? `This answer is being framed through the ${contextHint} lens.` : "",
        ...routeLead,
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
    journeyTitle: request.journeyTitle,
    journeyDescription: request.journeyDescription,
    journeyStopIndex: request.journeyStopIndex,
    journeyStopTotal: request.journeyStopTotal,
    frameCaption: request.frameCaption,
    language: request.language ?? "en",
  });
}
