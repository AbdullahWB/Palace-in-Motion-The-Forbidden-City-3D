import { getPalaceKnowledgeByPlaceSlug } from "@/data/palace-knowledge";
import { pickLocalizedText } from "@/lib/i18n";
import type {
  GuideSourceCard,
  GuideVerification,
  PalaceKnowledgeEntry,
  ResolvedGuideContext,
} from "@/types/ai-guide";
import type { ExplorePlaceSlug } from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

type VerificationPayload = {
  sourceCards: GuideSourceCard[];
  verification: GuideVerification;
};

export const GUIDE_VERIFICATION_LABELS = {
  grounded: "Based on Palace Guide Source",
  limited: "Limited local guide support",
  missing: "Not available in guide content yet",
} satisfies Record<GuideVerification["status"], string>;

export function getGuideVerificationLabel(
  status: GuideVerification["status"]
) {
  return GUIDE_VERIFICATION_LABELS[status];
}

export function getGuideVerificationStatus(context: ResolvedGuideContext) {
  if (context.placeKnowledge) {
    return "grounded";
  }

  if (context.hasSpecificContext) {
    return "limited";
  }

  return "missing";
}

export function canUseExternalGuideProvider(context: ResolvedGuideContext) {
  return getGuideVerificationStatus(context) === "grounded";
}

export function buildGuideVerification({
  status,
  language,
  sourceNote,
}: {
  status: GuideVerification["status"];
  language: AppLanguage;
  sourceNote?: string | null;
}): GuideVerification {
  if (status === "grounded") {
    return {
      status,
      label: GUIDE_VERIFICATION_LABELS.grounded,
      message:
        sourceNote ||
        (language === "zh"
          ? "此回答使用本地 Palace Guide 内容。"
          : "This answer uses local Palace Guide content."),
    };
  }

  if (status === "limited") {
    return {
      status,
      label: GUIDE_VERIFICATION_LABELS.limited,
      message:
        sourceNote ||
        (language === "zh"
          ? "此回答仅使用部分本地场景资料，不应延伸出未支持的历史细节。"
          : "This answer uses partial local scene context only and should not extend into unsupported historical detail."),
    };
  }

  return {
    status,
    label: GUIDE_VERIFICATION_LABELS.missing,
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
  sourcePlaceSlug,
}: {
  context: ResolvedGuideContext;
  language: AppLanguage;
  sourcePlaceSlug?: ExplorePlaceSlug | null;
}): VerificationPayload {
  const knowledge =
    context.placeKnowledge ?? getPalaceKnowledgeByPlaceSlug(sourcePlaceSlug);

  if (knowledge) {
    const sourceCards = buildKnowledgeSourceCards({
      knowledge,
      language,
    });

    return {
      sourceCards,
      verification: buildGuideVerification({
        status: "grounded",
        language,
        sourceNote: pickLocalizedText(knowledge.sourceNote, language),
      }),
    };
  }

  if (context.hasSpecificContext) {
    const sourceCards: GuideSourceCard[] = [
      {
        id: context.sourceIds[0] ?? "scene-context",
        title:
          language === "zh" ? "本地场景上下文" : "Local scene context",
        body:
          context.tourStep?.explanation ??
          context.hotspot?.hotspotDescription ??
          context.site.summary,
        sourceNote:
          language === "zh"
            ? "此回答使用应用内本地场景资料；更具体的 Palace Guide Source 卡尚未绑定。"
            : "This answer uses local scene material; a more specific Palace Guide Source card is not attached yet.",
        sourceStatus: "scene-context",
        sourceConfidence: "limited",
      },
    ];

    return {
      sourceCards,
      verification: buildGuideVerification({
        status: "limited",
        language,
        sourceNote:
          language === "zh"
            ? "此回答保持保守，因为当前问题没有绑定具体 Palace Guide Source 条目。"
            : "This answer is conservative because the current question is not bound to a specific Palace Guide Source entry.",
      }),
    };
  }

  return {
    sourceCards: [],
    verification: buildGuideVerification({
      status: "missing",
      language,
    }),
  };
}

export function buildMissingGuideContentAnswer(language: AppLanguage) {
  return language === "zh"
    ? "Not available in guide content yet. 本地 Palace Guide 尚未提供足够来源，所以我不会生成具体历史说法。请先打开一个有 Palace Guide Source 的地点，或者只询问导航、地图和学习流程。"
    : "Not available in guide content yet. The local Palace Guide does not provide enough source material, so I will not generate specific historical claims. Open a place with a Palace Guide Source, or ask about navigation, map use, or learning flow.";
}

export function buildLimitedGuideContentPrefix(language: AppLanguage) {
  return language === "zh"
    ? "Limited local guide support: 以下内容仅基于应用内的场景上下文，不扩展未有来源的历史细节。"
    : "Limited local guide support: this uses only local scene context and avoids unsupported historical detail.";
}
