import {
  getHotspotContentById,
  getQuickFactsByIds,
  getResolvedTourStepById,
  getSiteQuickFacts,
  siteOverview,
} from "@/data/heritage";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import type { GuideRequest, ResolvedGuideContext } from "@/types/ai-guide";
import type { QuickFact } from "@/types/content";

function dedupeQuickFacts(facts: QuickFact[]) {
  const seen = new Set<string>();

  return facts.filter((fact) => {
    if (seen.has(fact.id)) {
      return false;
    }

    seen.add(fact.id);
    return true;
  });
}

function dedupeSourceIds(ids: string[]) {
  return [...new Set(ids)];
}

export function resolveGuideContext(
  input: Pick<GuideRequest, "sceneId" | "hotspotId" | "tourStepId">
): ResolvedGuideContext {
  const sceneId = input.sceneId === HERITAGE_SCENE_ID ? HERITAGE_SCENE_ID : null;
  const tourStep = getResolvedTourStepById(input.tourStepId);
  const directHotspot = input.hotspotId
    ? getHotspotContentById(input.hotspotId)
    : null;
  const derivedHotspot =
    directHotspot ??
    (tourStep?.focusZoneId ? getHotspotContentById(tourStep.focusZoneId) : null);
  const quickFacts = dedupeQuickFacts([
    ...(tourStep?.quickFacts ?? []),
    ...(derivedHotspot ? getQuickFactsByIds(derivedHotspot.quickFactIds) : []),
    ...(!tourStep && !derivedHotspot ? getSiteQuickFacts() : []),
  ]);

  return {
    sceneId,
    hotspotId: derivedHotspot?.id ?? null,
    tourStepId: tourStep?.id ?? null,
    contextLabel: tourStep?.title ?? derivedHotspot?.title ?? siteOverview.headline,
    sourceIds: dedupeSourceIds([
      "site-overview",
      ...(sceneId ? [sceneId] : []),
      ...(tourStep ? [tourStep.id] : []),
      ...(derivedHotspot ? [derivedHotspot.id] : []),
      ...quickFacts.map((fact) => fact.id),
    ]),
    hasSpecificContext: Boolean(tourStep || derivedHotspot),
    site: {
      headline: siteOverview.headline,
      summary: siteOverview.summary,
      aiGuideIntro: siteOverview.aiGuideIntro,
    },
    hotspot: derivedHotspot,
    tourStep: tourStep
      ? {
          id: tourStep.id,
          title: tourStep.title,
          explanation: tourStep.explanation,
          kind: tourStep.kind,
        }
      : null,
    quickFacts: quickFacts.length ? quickFacts : getSiteQuickFacts(),
  };
}
