import type {
  ExploreSearchState,
  ExploreView,
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
} from "@/types/content";

type PlaceRouteOptions = {
  routeId?: ExploreJourneyRouteId | string | null;
  photoId?: string | null;
};

type ExploreHrefOptions = Pick<Partial<ExploreSearchState>, "photoId"> & {
  view?: ExploreView | null;
  placeSlug?: ExplorePlaceSlug | string | null;
  routeId?: ExploreJourneyRouteId | string | null;
};

export type AppSearchParams = Record<string, string | string[] | undefined>;

type SearchParamsLike = AppSearchParams | Pick<URLSearchParams, "get">;

export const appRoutePaths = {
  home: "/",
  companion: "/companion",
  classroom: "/classroom",
  threeD: "/3d-view",
  explore: "/explore",
  selfie: "/selfie",
  tour: "/tour",
  threeDScene: "/3d-view/scene",
  apiChat: "/api/chat",
  apiSelfieEnhance: "/api/selfie/enhance",
} as const;

export const exploreSearchParamKeys = {
  view: "view",
  place: "place",
  photo: "photo",
  route: "route",
} as const;

export const exploreViewValues: Record<ExploreView, ExploreView> = {
  welcome: "welcome",
  map: "map",
  place: "place",
};

const explorePlaceSlugLookup = {
  "tianyi-men": true,
  "yangxin-dian": true,
  "fengxian-dian": true,
  "qianqing-men": true,
  "huangji-dian": true,
  "shoukang-gong": true,
  "taihe-dian": true,
  "zhonghe-dian": true,
  "baohe-dian": true,
  "jingren-gong": true,
} satisfies Record<ExplorePlaceSlug, true>;

const exploreJourneyRouteIdLookup = {
  "ceremonial-axis": true,
  "inner-court-life": true,
  "garden-quiet-spaces": true,
} satisfies Record<ExploreJourneyRouteId, true>;

const immersiveShellPathnames = [
  appRoutePaths.home,
  appRoutePaths.explore,
  appRoutePaths.companion,
  appRoutePaths.threeD,
] as const;

const footerlessPathnames = [
  ...immersiveShellPathnames,
  appRoutePaths.selfie,
] as const;

const globalMusicHiddenPathnames = [
  appRoutePaths.home,
  appRoutePaths.explore,
  appRoutePaths.threeD,
] as const;

function readSearchParam(searchParams: SearchParamsLike, key: string) {
  const getter = (searchParams as Pick<URLSearchParams, "get">).get;

  if (typeof getter === "function") {
    return getter.call(searchParams, key);
  }

  const value = (searchParams as AppSearchParams)[key];

  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function getNonEmptyString(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function hasLookupValue<TValue extends string>(
  lookup: Record<TValue, true>,
  value: string | null | undefined
): value is TValue {
  return Boolean(value && Object.prototype.hasOwnProperty.call(lookup, value));
}

export function isExplorePlaceRouteSlug(
  value: string | null | undefined
): value is ExplorePlaceSlug {
  return hasLookupValue(explorePlaceSlugLookup, value);
}

export function isExploreJourneyRouteParam(
  value: string | null | undefined
): value is ExploreJourneyRouteId {
  return hasLookupValue(exploreJourneyRouteIdLookup, value);
}

function normalizeExploreView(value: string | null | undefined): ExploreView {
  if (value === exploreViewValues.map || value === exploreViewValues.place) {
    return value;
  }

  return exploreViewValues.welcome;
}

function normalizeRouteId(value: string | null | undefined) {
  const normalized = getNonEmptyString(value);

  return hasLookupValue(exploreJourneyRouteIdLookup, normalized)
    ? normalized
    : null;
}

function normalizePlaceSlug(value: string | null | undefined) {
  const normalized = getNonEmptyString(value);

  return hasLookupValue(explorePlaceSlugLookup, normalized) ? normalized : null;
}

export function buildExploreSearchParams({
  view = exploreViewValues.welcome,
  placeSlug = null,
  photoId = null,
  routeId = null,
}: ExploreHrefOptions = {}) {
  const normalizedView = normalizeExploreView(view);
  const normalizedRouteId = normalizeRouteId(routeId);
  const params = new URLSearchParams();

  if (normalizedView === exploreViewValues.welcome) {
    return params;
  }

  if (normalizedView === exploreViewValues.place) {
    const normalizedPlaceSlug = normalizePlaceSlug(placeSlug);

    if (!normalizedPlaceSlug) {
      params.set(exploreSearchParamKeys.view, exploreViewValues.map);

      if (normalizedRouteId) {
        params.set(exploreSearchParamKeys.route, normalizedRouteId);
      }

      return params;
    }

    params.set(exploreSearchParamKeys.view, exploreViewValues.place);
    params.set(exploreSearchParamKeys.place, normalizedPlaceSlug);

    const normalizedPhotoId = getNonEmptyString(photoId);

    if (normalizedPhotoId) {
      params.set(exploreSearchParamKeys.photo, normalizedPhotoId);
    }

    if (normalizedRouteId) {
      params.set(exploreSearchParamKeys.route, normalizedRouteId);
    }

    return params;
  }

  params.set(exploreSearchParamKeys.view, exploreViewValues.map);

  if (normalizedRouteId) {
    params.set(exploreSearchParamKeys.route, normalizedRouteId);
  }

  return params;
}

export function buildExploreHref(options: ExploreHrefOptions = {}) {
  const query = buildExploreSearchParams(options).toString();

  return query ? `${appRoutePaths.home}?${query}` : appRoutePaths.home;
}

export function buildExploreHrefFromSearchParams(searchParams: SearchParamsLike) {
  return buildExploreHref({
    view: normalizeExploreView(
      readSearchParam(searchParams, exploreSearchParamKeys.view)
    ),
    placeSlug: readSearchParam(searchParams, exploreSearchParamKeys.place),
    photoId: readSearchParam(searchParams, exploreSearchParamKeys.photo),
    routeId: readSearchParam(searchParams, exploreSearchParamKeys.route),
  });
}

export function hasInvalidExplorePlaceSlug(searchParams: SearchParamsLike) {
  return (
    readSearchParam(searchParams, exploreSearchParamKeys.view) ===
      exploreViewValues.place &&
    !normalizePlaceSlug(
      readSearchParam(searchParams, exploreSearchParamKeys.place)
    )
  );
}

function pathnameMatches(
  pathname: string | null | undefined,
  pathnames: readonly string[]
) {
  return typeof pathname === "string" && pathnames.includes(pathname);
}

export function isImmersiveShellPathname(pathname: string | null | undefined) {
  return pathnameMatches(pathname, immersiveShellPathnames);
}

export function isFooterlessPathname(pathname: string | null | undefined) {
  return pathnameMatches(pathname, footerlessPathnames);
}

export function isGlobalMusicHiddenPathname(
  pathname: string | null | undefined
) {
  return pathnameMatches(pathname, globalMusicHiddenPathnames);
}

export function isThreeDPathname(pathname: string | null | undefined) {
  return pathname === appRoutePaths.threeD;
}

export function shouldDisableRoutePrefetch(href: string) {
  return href === appRoutePaths.threeD;
}

export const appRoutes = {
  ...appRoutePaths,
  map: (routeId?: ExploreJourneyRouteId | string | null) =>
    buildExploreHref({ view: exploreViewValues.map, routeId }),
  place: (
    placeSlug: ExplorePlaceSlug | string | null | undefined,
    { routeId, photoId }: PlaceRouteOptions = {}
  ) =>
    buildExploreHref({
      view: exploreViewValues.place,
      placeSlug,
      routeId,
      photoId,
    }),
} as const;
