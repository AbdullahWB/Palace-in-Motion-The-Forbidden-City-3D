import exploreExperienceJson from "@/data/explore-experience.json";
import type {
  ExploreExperienceData,
  ExploreJourneyRoute,
  ExploreJourneyRouteId,
  ExplorePassportSeal,
  ExplorePlace,
  ExplorePlaceSlug,
  ExploreSearchState,
} from "@/types/content";

export const exploreExperience = exploreExperienceJson as ExploreExperienceData;

const placeSlugSet = new Set<ExplorePlaceSlug>(
  exploreExperience.places.map((place) => place.slug)
);
const journeyRouteIdSet = new Set<ExploreJourneyRouteId>(
  exploreExperience.journeys.map((journey) => journey.id)
);

export function isExplorePlaceSlug(
  value: string | null | undefined
): value is ExplorePlaceSlug {
  return value ? placeSlugSet.has(value as ExplorePlaceSlug) : false;
}

export function isExploreJourneyRouteId(
  value: string | null | undefined
): value is ExploreJourneyRouteId {
  return value ? journeyRouteIdSet.has(value as ExploreJourneyRouteId) : false;
}

export function getExplorePlaceBySlug(
  placeSlug: ExplorePlaceSlug | null | undefined
) {
  return exploreExperience.places.find((place) => place.slug === placeSlug) ?? null;
}

export function getExploreJourneyById(
  routeId: ExploreJourneyRouteId | null | undefined
) {
  return exploreExperience.journeys.find((journey) => journey.id === routeId) ?? null;
}

export function getExplorePassportSealByRouteId(
  routeId: ExploreJourneyRouteId | null | undefined
) {
  return (
    exploreExperience.passport.routeSeals.find((seal) => seal.routeId === routeId) ??
    null
  );
}

export function getExploreJourneyPlaces(
  route: ExploreJourneyRoute | ExploreJourneyRouteId | null | undefined
) {
  const resolvedRoute =
    typeof route === "string" ? getExploreJourneyById(route) : route ?? null;

  if (!resolvedRoute) {
    return [];
  }

  return resolvedRoute.placeOrder
    .map((placeSlug) => getExplorePlaceBySlug(placeSlug))
    .filter((place): place is ExplorePlace => Boolean(place));
}

export function getExploreJourneyStopIndex(
  route: ExploreJourneyRoute | ExploreJourneyRouteId | null | undefined,
  placeSlug: ExplorePlaceSlug | null | undefined
) {
  if (!placeSlug) {
    return -1;
  }

  const resolvedRoute =
    typeof route === "string" ? getExploreJourneyById(route) : route ?? null;

  return resolvedRoute?.placeOrder.findIndex((slug) => slug === placeSlug) ?? -1;
}

export function getExploreJourneyVisitedCount(
  route: ExploreJourneyRoute | ExploreJourneyRouteId | null | undefined,
  visitedPlaceSlugs: ExplorePlaceSlug[]
) {
  const resolvedRoute =
    typeof route === "string" ? getExploreJourneyById(route) : route ?? null;

  if (!resolvedRoute) {
    return 0;
  }

  const visitedSet = new Set(visitedPlaceSlugs);

  return resolvedRoute.placeOrder.filter((placeSlug) => visitedSet.has(placeSlug))
    .length;
}

function firstString(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export function getExplorePhotoById(
  place: ExplorePlace | null | undefined,
  photoId: string | null | undefined
) {
  if (!place) {
    return null;
  }

  return (
    place.gallery.find((photo) => photo.id === photoId) ??
    place.gallery.find((photo) => photo.id === place.defaultPhotoId) ??
    place.gallery[0] ??
    null
  );
}

export function normalizeExploreSearchState(
  searchParams: Record<string, string | string[] | undefined>
): ExploreSearchState {
  const requestedView = firstString(searchParams.view);
  const requestedPlace = firstString(searchParams.place);
  const requestedPhoto = firstString(searchParams.photo);
  const requestedRoute = firstString(searchParams.route);
  const routeId = isExploreJourneyRouteId(requestedRoute) ? requestedRoute : null;

  if (requestedView === "map") {
    return {
      view: "map",
      placeSlug: null,
      photoId: null,
      routeId,
    };
  }

  if (requestedView === "place" && isExplorePlaceSlug(requestedPlace)) {
    const place = getExplorePlaceBySlug(requestedPlace);
    const activePhoto = getExplorePhotoById(place, requestedPhoto);

    return {
      view: "place",
      placeSlug: place?.slug ?? null,
      photoId: activePhoto?.id ?? null,
      routeId,
    };
  }

  return {
    view: "welcome",
    placeSlug: null,
    photoId: null,
    routeId,
  };
}

export function getCompletedJourneyRouteIds(
  visitedPlaceSlugs: ExplorePlaceSlug[]
): ExploreJourneyRouteId[] {
  const visitedSet = new Set(visitedPlaceSlugs);

  return exploreExperience.journeys
    .filter((journey) => journey.placeOrder.every((placeSlug) => visitedSet.has(placeSlug)))
    .map((journey) => journey.id);
}

export function getUnlockedPassportSealIds(
  completedRouteIds: ExploreJourneyRouteId[]
): ExplorePassportSeal["id"][] {
  const completedSet = new Set(completedRouteIds);

  return exploreExperience.passport.routeSeals
    .filter((seal) => completedSet.has(seal.routeId))
    .map((seal) => seal.id);
}
