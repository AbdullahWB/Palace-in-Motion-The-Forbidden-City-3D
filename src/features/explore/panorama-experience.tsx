"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { LanguageToggleButton } from "@/components/preferences/language-toggle-button";
import { MusicToggleButton } from "@/components/media/music-toggle-button";
import { ThemeToggleButton } from "@/components/preferences/theme-toggle-button";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import {
  exploreExperience,
  getExplorePhotoById,
  getExplorePlaceBySlug,
  normalizeExploreSearchState,
} from "@/data/panorama";
import { SelfieStudio } from "@/features/selfie/selfie-studio";
import { pickLocalizedText } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type {
  ExplorePlace,
  ExplorePlacePhoto,
  ExplorePlaceSlug,
  ExploreSearchState,
} from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

type PanoramaExperienceProps = {
  initialState: ExploreSearchState;
};

type PlaceInfoPanelProps = {
  place: ExplorePlace;
  activePhoto: ExplorePlacePhoto;
  language: AppLanguage;
  copy: (typeof exploreUiCopy)["zh"];
  theme: "dark" | "light";
  compact?: boolean;
};

const exploreUiCopy = {
  zh: {
    brandTitle: "全景故宫",
    brandSubtitle: "全景故宫博物馆",
    home: "首页",
    preparedPlaces: "已准备场景",
    welcome: "欢迎",
    palaceMap: "宫城地图",
    mapInstruction: "拖动或缩放地图，然后点击一个场所进入视图。",
    mappedPlaces: "地点已映射",
    closeMap: "关闭宫城地图",
    zoomOut: "缩小地图",
    zoomIn: "放大地图",
    backToWelcome: "返回欢迎",
    placeView: "场所视图",
    backToMap: "返回地图",
    close: "关闭",
    selfie: "合影",
    sceneFrames: "场景序列",
    views: "张视图",
    activeFrame: "当前画面",
    closeSelfieModal: "关闭合影弹窗",
  },
  en: {
    brandTitle: "Panoramic Palace",
    brandSubtitle: "The Panoramic Palace Museum",
    home: "Home",
    preparedPlaces: "Prepared places",
    welcome: "Welcome",
    palaceMap: "Palace map",
    mapInstruction: "Drag or zoom the map, then click one place to enter its view.",
    mappedPlaces: "mapped places",
    closeMap: "Close palace map",
    zoomOut: "Zoom out map",
    zoomIn: "Zoom in map",
    backToWelcome: "Back to welcome",
    placeView: "Place view",
    backToMap: "Back to map",
    close: "Close",
    selfie: "Selfie",
    sceneFrames: "Scene frames",
    views: "views",
    activeFrame: "Active frame",
    closeSelfieModal: "Close selfie modal",
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toSearchString(searchState: ExploreSearchState) {
  const params = new URLSearchParams();

  params.set("view", searchState.view);

  if (searchState.placeSlug) {
    params.set("place", searchState.placeSlug);
  }

  if (searchState.photoId) {
    params.set("photo", searchState.photoId);
  }

  return params.toString();
}

function PlaceInfoPanel({
  place,
  activePhoto,
  language,
  copy,
  theme,
  compact = false,
}: PlaceInfoPanelProps) {
  const isDarkTheme = theme === "dark";
  const accentTextClass = isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft";
  const paragraphTextClass = isDarkTheme ? "text-white" : "text-foreground";
  const secondaryParagraphTextClass = isDarkTheme
    ? "text-white/76"
    : "text-foreground/78";

  return (
    <div
      className={cn(
        "h-full overflow-hidden rounded-[1.8rem] border shadow-[0_28px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl",
        isDarkTheme
          ? "border-[#d6b071]/28 bg-[rgba(8,12,20,0.76)] text-white"
          : "border-border/70 bg-[rgba(255,248,240,0.86)] text-foreground",
        compact ? "max-h-[32svh]" : "max-h-none"
      )}
    >
      <div
        className={cn(
          "h-full overflow-y-auto",
          compact ? "px-4 py-4" : "px-6 py-6"
        )}
      >
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.28em]",
            accentTextClass
          )}
        >
          {pickLocalizedText(place.badgeLabel, language)}
        </p>

        <p
          className={cn(
            "mt-4 font-display",
            paragraphTextClass,
            compact ? "text-3xl" : "text-4xl leading-tight"
          )}
        >
          {pickLocalizedText(place.title, language)}
        </p>

        <div
          className={cn(
            "mt-5 rounded-[1.35rem] border p-4",
            isDarkTheme ? "border-white/10 bg-white/7" : "border-border/80 bg-background/82"
          )}
        >
          <p className={cn("text-sm leading-7", paragraphTextClass)}>
            {pickLocalizedText(place.shortDescription, language)}
          </p>
        </div>

        <div
          className={cn(
            "mt-5 rounded-[1.35rem] border p-4",
            isDarkTheme ? "border-[#d6b071]/20 bg-[#d6b071]/8" : "border-accent-soft/20 bg-accent-soft/8"
          )}
        >
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", accentTextClass)}>
            {copy.activeFrame}
          </p>
          <p className={cn("mt-3 text-sm font-semibold", paragraphTextClass)}>
            {pickLocalizedText(activePhoto.caption, language)}
          </p>
        </div>

        <p className={cn("mt-5 text-sm leading-8", secondaryParagraphTextClass)}>
          {pickLocalizedText(place.longDescription, language)}
        </p>
      </div>
    </div>
  );
}

export function PanoramaExperience({
  initialState,
}: PanoramaExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion() ?? false;
  const { language, theme } = useSitePreferences();
  const ui = exploreUiCopy[language];
  const isDarkTheme = theme === "dark";

  const visitedExplorePlaceSlugs = useAppStore(
    (state) => state.visitedExplorePlaceSlugs
  );
  const markExplorePlaceVisited = useAppStore(
    (state) => state.markExplorePlaceVisited
  );
  const setHasCompletedTour = useAppStore((state) => state.setHasCompletedTour);

  const [mapScale, setMapScale] = useState(exploreExperience.map.initialScale);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);

  const mapDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const smoothX = useSpring(panX, { stiffness: 90, damping: 22, mass: 0.5 });
  const smoothY = useSpring(panY, { stiffness: 90, damping: 22, mass: 0.5 });

  const searchKey = searchParams.toString();
  const liveSearchState = normalizeExploreSearchState({
    view: searchParams.get("view") ?? undefined,
    place: searchParams.get("place") ?? undefined,
    photo: searchParams.get("photo") ?? undefined,
  });
  const searchState = searchKey ? liveSearchState : initialState;

  const activePlace = getExplorePlaceBySlug(searchState.placeSlug);
  const deferredPhotoId = useDeferredValue(searchState.photoId);
  const activePhoto = getExplorePhotoById(activePlace, deferredPhotoId);
  const visitedCount = visitedExplorePlaceSlugs.length;
  const showWelcomeVideo =
    searchState.view === "welcome" &&
    Boolean(exploreExperience.welcome.heroVideoSrc);

  useEffect(() => {
    if (searchState.view === "place" && activePlace) {
      markExplorePlaceVisited(activePlace.slug);
    }
  }, [activePlace, markExplorePlaceVisited, searchState.view]);

  useEffect(() => {
    setHasCompletedTour(visitedCount >= exploreExperience.places.length);
  }, [setHasCompletedTour, visitedCount]);

  useEffect(() => {
    if (!isSelfieModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSelfieModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelfieModalOpen]);

  const backdropSrc =
    searchState.view === "place"
      ? activePhoto?.src ?? activePlace?.coverSrc ?? exploreExperience.welcome.heroSrc
      : exploreExperience.welcome.heroSrc;
  const localize = (copy: { zh: string; en: string }) =>
    pickLocalizedText(copy, language);

  function clampMapOffset(
    nextOffset: {
      x: number;
      y: number;
    },
    scale: number
  ) {
    const limitX = Math.max(0, (scale - 1) * 360);
    const limitY = Math.max(0, (scale - 1) * 260);

    return {
      x: clamp(nextOffset.x, -limitX, limitX),
      y: clamp(nextOffset.y, -limitY, limitY),
    };
  }

  function navigate(nextState: ExploreSearchState) {
    const nextSearch = toSearchString(nextState);
    const nextHref = nextSearch ? `${pathname}?${nextSearch}` : pathname;

    startTransition(() => {
      router.push(nextHref, { scroll: false });
    });
  }

  function openWelcome() {
    setIsSelfieModalOpen(false);
    navigate({
      view: "welcome",
      placeSlug: null,
      photoId: null,
    });
  }

  function openMap() {
    setIsSelfieModalOpen(false);
    setMapScale(exploreExperience.map.initialScale);
    setMapOffset({ x: 0, y: 0 });
    navigate({
      view: "map",
      placeSlug: null,
      photoId: null,
    });
  }

  function openPlace(placeSlug: ExplorePlaceSlug, photoId?: string | null) {
    const place = getExplorePlaceBySlug(placeSlug);
    const placePhoto = getExplorePhotoById(
      place,
      photoId ?? place?.defaultPhotoId ?? null
    );

    if (!place || !placePhoto) {
      openMap();
      return;
    }

    navigate({
      view: "place",
      placeSlug: place.slug,
      photoId: placePhoto.id,
    });
  }

  function selectPhoto(photoId: string) {
    if (!activePlace) {
      return;
    }

    openPlace(activePlace.slug, photoId);
  }

  function handleScenePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (reduceMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratioX = (event.clientX - bounds.left) / bounds.width;
    const ratioY = (event.clientY - bounds.top) / bounds.height;
    const intensity = searchState.view === "place" ? 34 : 14;

    panX.set((0.5 - ratioX) * intensity);
    panY.set((0.5 - ratioY) * intensity * 0.66);
  }

  function handleScenePointerLeave() {
    panX.set(0);
    panY.set(0);
  }

  function adjustMapScale(nextScale: number) {
    const clampedScale = clamp(
      nextScale,
      exploreExperience.map.minScale,
      exploreExperience.map.maxScale
    );

    setMapScale(clampedScale);
    setMapOffset((currentOffset) => clampMapOffset(currentOffset, clampedScale));
  }

  function handleMapWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    adjustMapScale(mapScale + (event.deltaY < 0 ? 0.16 : -0.16));
  }

  function handleMapPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    mapDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: mapOffset.x,
      originY: mapOffset.y,
    };
  }

  function handleMapPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!mapDragRef.current || mapDragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const nextX =
      mapDragRef.current.originX + event.clientX - mapDragRef.current.startX;
    const nextY =
      mapDragRef.current.originY + event.clientY - mapDragRef.current.startY;

    setMapOffset(clampMapOffset({ x: nextX, y: nextY }, mapScale));
  }

  function handleMapPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (mapDragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      mapDragRef.current = null;
    }
  }

  return (
    <section
      className={cn(
        "relative h-[100svh] overflow-hidden",
        isDarkTheme ? "bg-[#05070d] text-white" : "bg-background text-foreground"
      )}
      onPointerMove={handleScenePointerMove}
      onPointerLeave={handleScenePointerLeave}
    >
      <motion.div
        className="absolute inset-[-6%]"
        style={reduceMotion ? { scale: 1.06 } : { x: smoothX, y: smoothY }}
        animate={reduceMotion ? undefined : { scale: [1.05, 1.09, 1.06] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 18, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
        }
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropSrc})` }}
        />
        {showWelcomeVideo ? (
          <video
            key={exploreExperience.welcome.heroVideoSrc}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={
              exploreExperience.welcome.heroVideoPosterSrc ??
              exploreExperience.welcome.heroSrc
            }
          >
            <source
              src={exploreExperience.welcome.heroVideoSrc}
              type="video/mp4"
            />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(38,94,164,0.5),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(227,178,96,0.24),transparent_34%),linear-gradient(180deg,rgba(8,10,15,0.12),rgba(8,10,15,0.3)_48%,rgba(5,7,12,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,14,0.32),transparent_22%,transparent_78%,rgba(6,8,14,0.36))]" />
      </motion.div>

      {searchState.view === "place" && activePhoto ? (
        <motion.div
          className="absolute inset-[-4%] opacity-50 blur-2xl"
          style={reduceMotion ? { scale: 1.08 } : { x: smoothX, y: smoothY, scale: 1.1 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-screen"
            style={{ backgroundImage: `url(${activePhoto.src})` }}
          />
        </motion.div>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_56%,rgba(4,6,10,0.48)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(5,7,12,0)_0%,rgba(5,7,12,0.18)_30%,rgba(5,7,12,0.82)_100%)]" />

      {searchState.view !== "place" ? (
        <div className="absolute left-4 top-4 z-30 w-[min(22rem,calc(100vw-2rem))] md:left-6 md:top-6">
          <div
            className={cn(
              "rounded-[1.8rem] border p-5 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.22)]",
              isDarkTheme
                ? "border-white/14 bg-[rgba(8,10,14,0.44)] text-white"
                : "border-border/70 bg-[rgba(255,248,240,0.82)] text-foreground"
            )}
          >
            <p
              className={cn(
                "text-3xl font-semibold tracking-[0.12em]",
                isDarkTheme ? "text-[#f4dcae]" : "text-accent"
              )}
            >
              {ui.brandTitle}
            </p>
            <p
              className={cn(
                "mt-2 text-[11px] font-semibold uppercase tracking-[0.28em]",
                isDarkTheme ? "text-white/62" : "text-foreground/62"
              )}
            >
              {ui.brandSubtitle}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                  isDarkTheme
                    ? "border-white/16 bg-white/10 text-white"
                    : "border-border/70 bg-background/76 text-foreground"
                )}
              >
                {ui.home}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <LanguageToggleButton tone={isDarkTheme ? "dark" : "light"} />
              <ThemeToggleButton tone={isDarkTheme ? "dark" : "light"} />
            </div>

            <p
              className={cn(
                "mt-6 text-[11px] font-semibold uppercase tracking-[0.24em]",
                isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
              )}
            >
              {ui.preparedPlaces}
            </p>
            <p
              className={cn(
                "mt-2 text-sm",
                isDarkTheme ? "text-white/76" : "text-foreground/74"
              )}
            >
              {visitedCount} / {exploreExperience.places.length}
            </p>
          </div>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {searchState.view === "welcome" ? (
          <motion.div
            key="welcome"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -18 }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
            }
            className="absolute inset-0 z-20 flex items-center justify-center px-4"
          >
            <div
              className={cn(
                "w-full max-w-3xl rounded-[2.1rem] border px-6 py-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl md:px-10 md:py-10",
                isDarkTheme
                  ? "border-white/14 bg-[rgba(8,10,14,0.42)] text-white"
                  : "border-border/70 bg-[rgba(255,248,240,0.78)] text-foreground"
              )}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.32em]",
                  isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
                )}
              >
                {ui.welcome}
              </p>

              <p
                className={cn(
                  "mt-5 font-display text-5xl leading-none md:text-7xl",
                  isDarkTheme ? "text-white" : "text-foreground"
                )}
              >
                {localize(exploreExperience.welcome.title)}
              </p>

              <p
                className={cn(
                  "mx-auto mt-6 max-w-2xl text-base leading-8",
                  isDarkTheme ? "text-white/86" : "text-foreground/80"
                )}
              >
                {localize(exploreExperience.welcome.subtitle)}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={openMap}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border px-7 py-4 text-center shadow-[0_18px_40px_rgba(14,10,6,0.18)]",
                    isDarkTheme
                      ? "border-[#d6b071]/34 bg-[#d6b071]/16 hover:bg-[#d6b071]/24"
                      : "border-accent-soft/28 bg-accent-soft/16 hover:bg-accent-soft/24"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkTheme ? "text-[#f6dfb8]" : "text-accent-strong"
                    )}
                  >
                    {localize(exploreExperience.welcome.ctaLabel)}
                  </span>
                </button>

                <MusicToggleButton tone={isDarkTheme ? "dark" : "light"} />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {searchState.view === "map" ? (
          <motion.div
            key="map"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.24 }}
            className="absolute inset-0 z-40 flex items-center justify-center px-4 py-6"
          >
            <div className="absolute inset-0 bg-[rgba(4,6,10,0.46)] backdrop-blur-[10px]" />

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 18 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
              className={cn(
                "relative z-10 w-full max-w-[82rem] rounded-[2rem] border p-4 shadow-[0_32px_90px_rgba(0,0,0,0.26)] backdrop-blur-2xl",
                isDarkTheme
                  ? "border-[#d6b071]/22 bg-[rgba(8,12,20,0.78)] text-white"
                  : "border-border/70 bg-[rgba(255,248,240,0.86)] text-foreground"
              )}
            >
              <div className="flex items-center justify-between gap-4 px-2 pb-4">
                <div>
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.28em]",
                      isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
                    )}
                  >
                    {ui.palaceMap}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm",
                      isDarkTheme ? "text-white/72" : "text-foreground/72"
                    )}
                  >
                    {ui.mapInstruction}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openWelcome}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border text-lg",
                    isDarkTheme
                      ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                      : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                  )}
                  aria-label={ui.closeMap}
                >
                  ×
                </button>
              </div>

              <div className="relative h-[min(72svh,44rem)] overflow-hidden rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,246,227,0.9),rgba(246,233,208,0.78))]">
                <div
                  className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
                  onWheel={handleMapWheel}
                  onPointerDown={handleMapPointerDown}
                  onPointerMove={handleMapPointerMove}
                  onPointerUp={handleMapPointerUp}
                  onPointerCancel={handleMapPointerUp}
                >
                  <div
                    className="absolute left-1/2 top-1/2 h-[90%] w-[min(92%,70rem)]"
                    style={{
                      transform: `translate(-50%, -50%) translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={exploreExperience.map.imageSrc}
                        alt={localize(exploreExperience.map.alt)}
                        fill
                        priority
                        sizes="(max-width: 1024px) 92vw, 70rem"
                        className="object-contain select-none"
                      />

                      {exploreExperience.map.markers.map((marker, index) => (
                        <button
                          key={marker.placeSlug}
                          type="button"
                          onClick={() => openPlace(marker.placeSlug)}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${marker.x}%`,
                            top: `${marker.y}%`,
                          }}
                        >
                          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-[#ff7c41] text-[11px] font-semibold text-white shadow-[0_12px_24px_rgba(45,24,14,0.28)]">
                            {index + 1}
                          </span>
                          <span className="absolute left-1/2 top-full mt-2 min-w-28 -translate-x-1/2 rounded-xl border border-[#d6b071]/24 bg-white/92 px-3 py-2 text-center shadow-[0_12px_28px_rgba(45,24,14,0.18)]">
                            <span className="block text-xs font-semibold text-[#8e4c1d]">
                              {localize(marker.label)}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "absolute bottom-4 left-4 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md",
                    isDarkTheme
                      ? "border-[#d6b071]/24 bg-[rgba(8,12,20,0.72)] text-white/82"
                      : "border-border/80 bg-[rgba(255,248,240,0.82)] text-foreground/82"
                  )}
                >
                  {visitedCount} / {exploreExperience.places.length} {ui.mappedPlaces}
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustMapScale(mapScale - 0.18)}
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl backdrop-blur-md",
                      isDarkTheme
                        ? "border-[#d6b071]/28 bg-[rgba(8,12,20,0.72)] text-[#f6dfb8] hover:bg-[rgba(8,12,20,0.82)]"
                        : "border-border/80 bg-[rgba(255,248,240,0.82)] text-accent-strong hover:bg-[rgba(255,248,240,0.96)]"
                    )}
                    aria-label={ui.zoomOut}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustMapScale(mapScale + 0.18)}
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl backdrop-blur-md",
                      isDarkTheme
                        ? "border-[#d6b071]/28 bg-[rgba(8,12,20,0.72)] text-[#f6dfb8] hover:bg-[rgba(8,12,20,0.82)]"
                        : "border-border/80 bg-[rgba(255,248,240,0.82)] text-accent-strong hover:bg-[rgba(255,248,240,0.96)]"
                    )}
                    aria-label={ui.zoomIn}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
                <MusicToggleButton tone={isDarkTheme ? "dark" : "light"} compact />
                <button
                  type="button"
                  onClick={openWelcome}
                  className={cn(
                    "rounded-full border px-4 py-3 text-sm font-semibold",
                    isDarkTheme
                      ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                      : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                  )}
                >
                  {ui.backToWelcome}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {searchState.view === "place" && activePlace && activePhoto ? (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <div
              className="rounded-[1.25rem] border border-white/14 bg-[rgba(8,12,20,0.58)] px-3 py-5 text-center text-[#f5ddb4] backdrop-blur-xl"
              style={{ writingMode: "vertical-rl" }}
            >
              <p className="text-2xl font-semibold tracking-[0.18em]">
                {localize(activePlace.title)}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "absolute left-4 top-4 z-30 max-w-[min(18rem,calc(100vw-2rem))] rounded-[1.4rem] border px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl",
              isDarkTheme
                ? "border-white/14 bg-[rgba(8,12,20,0.5)]"
                : "border-border/70 bg-[rgba(255,248,240,0.84)]"
            )}
          >
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.28em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
              {ui.placeView}
            </p>
            <p className={cn("mt-2 text-sm font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
              {localize(activePlace.title)}
            </p>
          </div>

          <div className="absolute right-4 top-4 bottom-44 z-30 hidden w-[min(27rem,34vw)] lg:block">
            <PlaceInfoPanel
              place={activePlace}
              activePhoto={activePhoto}
              language={language}
              copy={ui}
              theme={theme}
            />
          </div>

          <div className="absolute inset-x-4 bottom-44 z-30 lg:hidden">
            <PlaceInfoPanel
              place={activePlace}
              activePhoto={activePhoto}
              language={language}
              copy={ui}
              theme={theme}
              compact
            />
          </div>

          <div className="absolute left-4 bottom-4 z-30 inline-flex max-w-[calc(100vw-2rem)] flex-col gap-3">
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-[1.5rem] border px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl",
                isDarkTheme
                  ? "border-white/12 bg-[rgba(8,12,20,0.54)]"
                  : "border-border/70 bg-[rgba(255,248,240,0.84)]"
              )}
            >
              <button
                type="button"
                onClick={openMap}
                className={cn(
                  "rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-[rgba(8,12,20,0.56)] text-white hover:bg-[rgba(8,12,20,0.68)]"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {ui.backToMap}
              </button>
              <button
                type="button"
                onClick={openWelcome}
                className={cn(
                  "rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-[rgba(8,12,20,0.56)] text-white hover:bg-[rgba(8,12,20,0.68)]"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {ui.close}
              </button>
              <button
                type="button"
                onClick={() => setIsSelfieModalOpen(true)}
                className={cn(
                  "rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-[#d6b071]/30 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                    : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                )}
              >
                {ui.selfie}
              </button>
              <MusicToggleButton tone={isDarkTheme ? "dark" : "light"} compact />
              <LanguageToggleButton tone={isDarkTheme ? "dark" : "light"} />
              <ThemeToggleButton tone={isDarkTheme ? "dark" : "light"} />
            </div>

            <div
              className={cn(
                "w-fit max-w-[calc(100vw-2rem)] rounded-[1.65rem] border p-3 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl",
                isDarkTheme
                  ? "border-white/12 bg-[rgba(8,12,20,0.54)]"
                  : "border-border/70 bg-[rgba(255,248,240,0.84)]"
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
                  {ui.sceneFrames}
                </p>
                <p className={cn("text-xs", isDarkTheme ? "text-white/68" : "text-foreground/66")}>
                  {activePlace.gallery.length} {ui.views}
                </p>
              </div>

              <div className="flex w-fit gap-3 overflow-x-auto pb-1">
                {activePlace.gallery.map((photo) => {
                  const isActive = photo.id === activePhoto.id;

                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => selectPhoto(photo.id)}
                      className={cn(
                        "group relative h-20 w-32 shrink-0 overflow-hidden rounded-[1rem] border transition-transform hover:-translate-y-0.5",
                        isActive
                          ? "border-[#f5ddb4]/70 ring-2 ring-[#f5ddb4]/30"
                          : "border-white/10"
                      )}
                    >
                      <Image
                        src={photo.src}
                        alt={localize(photo.alt)}
                        fill
                        sizes="8rem"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,12,0.04),rgba(6,8,12,0.74))]" />
                      <div className="absolute inset-x-0 bottom-0 p-2 text-left">
                        <p className="truncate text-xs font-semibold text-white">
                          {localize(photo.caption)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <AnimatePresence>
        {searchState.view === "place" &&
        activePlace &&
        activePhoto &&
        isSelfieModalOpen ? (
          <motion.div
            key="explore-selfie-modal"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.22 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          >
            <button
              type="button"
              onClick={() => setIsSelfieModalOpen(false)}
              className="absolute inset-0 bg-[rgba(4,6,10,0.72)] backdrop-blur-[14px]"
              aria-label={ui.closeSelfieModal}
            />

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 20 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
              className={cn(
                "relative z-10 h-[min(92svh,60rem)] w-full max-w-[92rem] overflow-hidden rounded-[2rem] border shadow-[0_36px_120px_rgba(0,0,0,0.34)]",
                isDarkTheme
                  ? "border-[#d6b071]/24 bg-[rgba(8,12,20,0.84)]"
                  : "border-border/70 bg-[rgba(255,248,240,0.9)]"
              )}
              role="dialog"
              aria-modal="true"
              aria-label={`${ui.selfie}: ${localize(activePlace.title)}`}
            >
              <SelfieStudio
                key={`${activePlace.slug}:${activePhoto.id}`}
                mode="modal"
                onClose={() => setIsSelfieModalOpen(false)}
                initialBackdrop={{
                  imageUrl: activePhoto.src,
                  label: localize(activePhoto.caption),
                }}
                initialTitle={localize(activePlace.title)}
                initialCaption={localize(activePlace.shortDescription)}
                placeLabel={localize(activePlace.title)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
