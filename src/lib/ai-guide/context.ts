import {
  getHotspotContentById,
  getQuickFactsByIds,
  getResolvedTourStepById,
  getSiteQuickFacts,
  siteOverview,
} from "@/data/heritage";
import { getSelfieFocusById } from "@/data/selfie";
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
  input: Pick<GuideRequest, "sceneId" | "hotspotId" | "tourStepId" | "focusId">
): ResolvedGuideContext {
  const sceneId = input.sceneId === HERITAGE_SCENE_ID ? HERITAGE_SCENE_ID : null;
  const tourStep = getResolvedTourStepById(input.tourStepId);
  const focusOption = getSelfieFocusById(input.focusId);
  const focusHotspot =
    focusOption && focusOption.id !== "central-axis"
      ? getHotspotContentById(focusOption.id)
      : null;
  const directHotspot = input.hotspotId
    ? getHotspotContentById(input.hotspotId)
    : null;
  const derivedHotspot =
    directHotspot ??
    focusHotspot ??
    (tourStep?.focusZoneId ? getHotspotContentById(tourStep.focusZoneId) : null);
  const focusQuickFacts =
    focusOption?.id === "central-axis"
      ? getQuickFactsByIds(["central-axis", "axial-symmetry", "ceremonial-meaning"])
      : [];
  const quickFacts = dedupeQuickFacts([
    ...(tourStep?.quickFacts ?? []),
    ...(derivedHotspot ? getQuickFactsByIds(derivedHotspot.quickFactIds) : []),
    ...focusQuickFacts,
    ...(!tourStep && !derivedHotspot && !focusOption ? getSiteQuickFacts() : []),
  ]);
  const resolvedFocusId = focusOption?.id ?? derivedHotspot?.id ?? null;
  const resolvedFocusLabel = focusOption?.label ?? derivedHotspot?.title ?? null;

  return {
    sceneId,
    hotspotId: derivedHotspot?.id ?? null,
    tourStepId: tourStep?.id ?? null,
    focusId: resolvedFocusId,
    focusLabel: resolvedFocusLabel,
    contextLabel:
      tourStep?.title ?? resolvedFocusLabel ?? derivedHotspot?.title ?? siteOverview.headline,
    sourceIds: dedupeSourceIds([
      "site-overview",
      ...(sceneId ? [sceneId] : []),
      ...(tourStep ? [tourStep.id] : []),
      ...(focusOption ? [focusOption.id] : []),
      ...(derivedHotspot ? [derivedHotspot.id] : []),
      ...quickFacts.map((fact) => fact.id),
    ]),
    hasSpecificContext: Boolean(tourStep || derivedHotspot || focusOption),
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
