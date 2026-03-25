import type { HeritageZoneId, QuickFact } from "@/types/content";

const allZoneIds: HeritageZoneId[] = [
  "meridian-gate",
  "taihe-gate",
  "hall-of-supreme-harmony",
  "inner-court-threshold",
];

export const quickFacts: QuickFact[] = [
  {
    id: "central-axis",
    title: "Central axis",
    body: "The palace is organized around a north-south axis that orders movement, sightlines, and imperial procession.",
  },
  {
    id: "axial-symmetry",
    title: "Axial symmetry",
    body: "Major masses mirror across the axis so architecture reads as balance, discipline, and control rather than picturesque variety.",
  },
  {
    id: "outer-court",
    title: "Outer Court",
    body: "The outer court is the great ceremonial precinct where imperial ritual and state display take architectural form.",
    zoneIds: ["meridian-gate", "taihe-gate", "hall-of-supreme-harmony"],
  },
  {
    id: "hall-of-supreme-harmony",
    title: "Hall of Supreme Harmony",
    body: "As the largest and highest ceremonial hall, Taihe Dian anchors the outer court through scale, terrace height, and frontal emphasis.",
    zoneIds: ["hall-of-supreme-harmony"],
  },
  {
    id: "inner-court",
    title: "Inner Court transition",
    body: "Beyond the great terraces, the route shifts toward a more inward register associated with residence, governance, and court life.",
    zoneIds: ["inner-court-threshold"],
  },
  {
    id: "ceremonial-meaning",
    title: "Ceremonial meaning",
    body: "Thresholds, terraces, and sequence do more than organize circulation; they stage hierarchy and prepare the viewer for imperial ritual.",
    zoneIds: allZoneIds,
  },
];

const quickFactMap = new Map(quickFacts.map((fact) => [fact.id, fact]));

export function getQuickFactsByIds(ids: QuickFact["id"][]) {
  return ids
    .map((id) => quickFactMap.get(id))
    .filter((fact): fact is QuickFact => Boolean(fact));
}

export function getSiteQuickFacts() {
  return quickFacts.filter((fact) => !fact.zoneIds?.length);
}

export function getQuickFactsForZoneId(zoneId: HeritageZoneId) {
  return quickFacts.filter((fact) => fact.zoneIds?.includes(zoneId));
}

export function getQuickFactIdsForZone(zoneId: HeritageZoneId) {
  return getQuickFactsForZoneId(zoneId).map((fact) => fact.id);
}
