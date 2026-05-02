import type {
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
} from "@/types/content";

type PlaceRouteOptions = {
  routeId?: ExploreJourneyRouteId | null;
  photoId?: string | null;
};

export const appRoutes = {
  home: "/",
  map: (routeId?: ExploreJourneyRouteId | null) => {
    const params = new URLSearchParams({ view: "map" });

    if (routeId) {
      params.set("route", routeId);
    }

    return `/?${params.toString()}`;
  },
  companion: "/companion",
  classroom: "/classroom",
  threeD: "/3d-view",
  explore: "/explore",
  selfie: "/selfie",
  tour: "/tour",
  apiChat: "/api/chat",
  place: (
    placeSlug: ExplorePlaceSlug,
    { routeId, photoId }: PlaceRouteOptions = {}
  ) => {
    const params = new URLSearchParams({
      view: "place",
      place: placeSlug,
    });

    if (routeId) {
      params.set("route", routeId);
    }

    if (photoId) {
      params.set("photo", photoId);
    }

    return `/?${params.toString()}`;
  },
} as const;
