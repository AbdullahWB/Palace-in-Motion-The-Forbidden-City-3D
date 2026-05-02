import { pickLocalizedText } from "@/lib/i18n";
import type {
  GuideSourceCard,
  GuideVerification,
  PalaceKnowledgeEntry,
  ResolvedGuideContext,
} from "@/types/ai-guide";
import type { AppLanguage } from "@/types/preferences";

type VerificationPayload = {
  sourceCards: GuideSourceCard[];
  verification: GuideVerification;
};

export function buildGuideVerification({
  hasKnowledge,
  hasSourceCards,
  language,
  sourceNote,
}: {
  hasKnowledge: boolean;
  hasSourceCards: boolean;
  language: AppLanguage;
  sourceNote?: string | null;
}): GuideVerification {
  if (hasKnowledge && hasSourceCards) {
    return {
      status: "grounded",
      label:
        language === "zh"
          ? "基于 Palace Guide Source"
          : "Based on Palace Guide Source",
      message:
        sourceNote ||
        (language === "zh"
          ? "此回答使用本地宫殿导览内容。"
          : "This answer uses local Palace Guide content."),
    };
  }

  if (hasKnowledge) {
    return {
      status: "limited",
      label: language === "zh" ? "本地导览支持有限" : "Limited local guide support",
      message:
        sourceNote ||
        (language === "zh"
          ? "此回答使用部分本地导览内容。"
          : "This answer uses partial local guide context."),
    };
  }

  return {
    status: "missing",
    label:
      language === "zh"
        ? "导览内容暂未提供"
        : "Not available in guide content yet",
    message:
      language === "zh"
        ? "本地 Palace Guide 尚未包含足够资料；回答应保持为保守方向性说明。"
        : "The local Palace Guide does not contain enough source material for this answer.",
  };
}

function buildKnowledgeSourceCards({
  knowledge,
  language,
}: {
  knowledge: PalaceKnowledgeEntry;
  language: AppLanguage;
}): GuideSourceCard[] {
  const sourceNote = pickLocalizedText(knowledge.sourceNote, language);

  return [
    {
      id: knowledge.placeSlug,
      title: pickLocalizedText(knowledge.sourceTitle, language),
      body: pickLocalizedText(knowledge.historyNote, language),
      sourceNote,
      sourceStatus: knowledge.sourceStatus,
      sourceConfidence: knowledge.sourceConfidence,
    },
    {
      id: `${knowledge.placeSlug}-preservation`,
      title:
        language === "zh"
          ? "保护与包容说明"
          : "Preservation and accessibility note",
      body: [
        pickLocalizedText(knowledge.preservationNote, language),
        pickLocalizedText(knowledge.accessibilitySummary, language),
      ]
        .filter(Boolean)
        .join(" "),
      sourceNote,
      sourceStatus: knowledge.sourceStatus,
      sourceConfidence: knowledge.sourceConfidence,
    },
  ];
}

export function buildGuideVerificationPayload({
  context,
  language,
}: {
  context: ResolvedGuideContext;
  language: AppLanguage;
}): VerificationPayload {
  if (context.placeKnowledge) {
    const sourceCards = buildKnowledgeSourceCards({
      knowledge: context.placeKnowledge,
      language,
    });

    return {
      sourceCards,
      verification: buildGuideVerification({
        hasKnowledge: true,
        hasSourceCards: sourceCards.length > 0,
        language,
        sourceNote: pickLocalizedText(context.placeKnowledge.sourceNote, language),
      }),
    };
  }

  if (context.hasSpecificContext) {
    const sourceCards: GuideSourceCard[] = [
      {
        id: context.sourceIds[0] ?? "scene-context",
        title:
          language === "zh"
            ? "本地场景上下文"
            : "Local scene context",
        body:
          context.tourStep?.explanation ??
          context.hotspot?.hotspotDescription ??
          context.site.summary,
        sourceNote:
          language === "zh"
            ? "此回答使用应用内本地场景资料；更具体的宫殿来源卡尚未绑定。"
            : "This answer uses local scene material; a more specific palace source card is not attached yet.",
        sourceStatus: "scene-context",
        sourceConfidence: "limited",
      },
    ];

    return {
      sourceCards,
      verification: {
        status: "limited",
        label:
          language === "zh"
            ? "基于本地场景资料"
            : "Based on local scene context",
        message:
          language === "zh"
            ? "此回答保持保守，因为当前问题没有绑定具体 Palace Guide Source 条目。"
            : "This answer is conservative because the current question is not bound to a specific Palace Guide Source entry.",
      },
    };
  }

  return {
    sourceCards: [],
    verification: buildGuideVerification({
      hasKnowledge: false,
      hasSourceCards: false,
      language,
    }),
  };
}
