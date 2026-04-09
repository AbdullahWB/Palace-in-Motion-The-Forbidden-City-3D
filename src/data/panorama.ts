import exploreExperienceJson from "@/data/explore-experience.json";
import type { ExploreExperienceData, ExplorePlace, ExplorePlaceSlug, ExploreSearchState } from "@/types/content";

export const exploreExperience = exploreExperienceJson as ExploreExperienceData;

const placeSlugSet = new Set<ExplorePlaceSlug>(
  exploreExperience.places.map((place) => place.slug)
);

export function isExplorePlaceSlug(value: string | null | undefined): value is ExplorePlaceSlug {
  return value ? placeSlugSet.has(value as ExplorePlaceSlug) : false;
}

export function getExplorePlaceBySlug(placeSlug: ExplorePlaceSlug | null | undefined) {
  return exploreExperience.places.find((place) => place.slug === placeSlug) ?? null;
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

  if (requestedView === "map") {
    return {
      view: "map",
      placeSlug: null,
      photoId: null,
    };
  }

  if (requestedView === "place" && isExplorePlaceSlug(requestedPlace)) {
    const place = getExplorePlaceBySlug(requestedPlace);
    const activePhoto = getExplorePhotoById(place, requestedPhoto);

    return {
      view: "place",
      placeSlug: place?.slug ?? null,
      photoId: activePhoto?.id ?? null,
    };
  }

  return {
    view: "welcome",
    placeSlug: null,
    photoId: null,
  };
}
