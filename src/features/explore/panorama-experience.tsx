"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { MusicToggleButton } from "@/components/media/music-toggle-button";
import { heroPanoramaScene } from "@/data/panorama";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type { BilingualText, PanoramaHotspot } from "@/types/content";

function formatInline(copy: BilingualText) {
  return `${copy.zh} / ${copy.en}`;
}

function BilingualStack({
  copy,
  className,
  zhClassName,
  enClassName,
}: {
  copy: BilingualText;
  className?: string;
  zhClassName?: string;
  enClassName?: string;
}) {
  return (
    <div className={className}>
      <p className={zhClassName}>{copy.zh}</p>
      <p className={enClassName}>{copy.en}</p>
    </div>
  );
}

type HotspotPanelProps = {
  activeHotspot: PanoramaHotspot;
  activeIndex: number;
  totalHotspots: number;
  visitedCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onClose?: () => void;
};

function HotspotPanel({
  activeHotspot,
  activeIndex,
  totalHotspots,
  visitedCount,
  onPrevious,
  onNext,
  onClose,
}: HotspotPanelProps) {
  const panelMedia = activeHotspot.panelMedia ?? heroPanoramaScene.panelMedia;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-white/14 bg-[rgba(9,10,14,0.58)] text-white shadow-[0_28px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f1d8b2]">
            文华 Dossier
          </p>
          <p className="mt-1 text-sm text-white/72">
            Stop {String(activeIndex + 1).padStart(2, "0")} / {String(totalHotspots).padStart(2, "0")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/74">
            Viewed {visitedCount}/{totalHotspots}
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/10 text-lg text-white/80"
              aria-label="Close details panel"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
        {panelMedia ? (
          <div className="relative h-44 overflow-hidden rounded-[1.45rem] border border-white/12">
            <Image
              src={panelMedia.src}
              alt={panelMedia.alt.en}
              fill
              sizes="(max-width: 1024px) 100vw, 28rem"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,14,0.04),rgba(8,10,14,0.62))]" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <BilingualStack
                copy={activeHotspot.markerLabel}
                zhClassName="text-lg font-semibold text-[#f5ddb4]"
                enClassName="text-xs font-semibold uppercase tracking-[0.22em] text-white/68"
              />
            </div>
          </div>
        ) : null}

        <BilingualStack
          copy={activeHotspot.panelEyebrow}
          className="mt-5"
          zhClassName="text-xs font-semibold uppercase tracking-[0.28em] text-[#f1d8b2]"
          enClassName="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/58"
        />

        <BilingualStack
          copy={activeHotspot.title}
          className="mt-4"
          zhClassName="font-display text-4xl leading-tight text-white"
          enClassName="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/70"
        />

        <div className="mt-5 space-y-4 rounded-[1.45rem] border border-white/10 bg-white/6 p-4">
          <BilingualStack
            copy={activeHotspot.summary}
            zhClassName="text-base leading-7 text-white"
            enClassName="mt-2 text-sm leading-7 text-white/72"
          />
        </div>

        <div className="mt-5 rounded-[1.45rem] border border-[#d3b178]/18 bg-[rgba(211,177,120,0.08)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#f1d8b2]">
            Curator note
          </p>
          <BilingualStack
            copy={activeHotspot.story}
            className="mt-3"
            zhClassName="text-sm leading-7 text-white"
            enClassName="mt-2 text-sm leading-7 text-white/72"
          />
        </div>

        <div className="mt-5 space-y-3">
          {activeHotspot.facts.map((fact) => (
            <article
              key={fact.id}
              className="rounded-[1.3rem] border border-white/10 bg-white/7 p-4"
            >
              <BilingualStack
                copy={fact.title}
                zhClassName="text-base font-semibold text-[#f5ddb4]"
                enClassName="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/58"
              />
              <BilingualStack
                copy={fact.body}
                className="mt-3"
                zhClassName="text-sm leading-7 text-white"
                enClassName="mt-2 text-sm leading-7 text-white/72"
              />
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-t border-white/10 px-5 py-4 md:grid-cols-3 md:px-6">
        <button
          type="button"
          onClick={onPrevious}
          className="rounded-full border border-white/16 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/16"
        >
          上一站 Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full border border-[#d3b178]/30 bg-[#d3b178]/15 px-4 py-3 text-sm font-semibold text-[#f6dfb8] hover:bg-[#d3b178]/24"
        >
          下一站 Next
        </button>
        <Link
          href="/selfie"
          className="inline-flex items-center justify-center rounded-full border border-white/16 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/16"
        >
          自拍留影 Selfie
        </Link>
      </div>
    </div>
  );
}

export function PanoramaExperience() {
  const selectedExploreZoneId = useAppStore((state) => state.selectedExploreZoneId);
  const visitedExploreZoneIds = useAppStore((state) => state.visitedExploreZoneIds);
  const setSelectedExploreZoneId = useAppStore((state) => state.setSelectedExploreZoneId);
  const markExploreZoneVisited = useAppStore((state) => state.markExploreZoneVisited);
  const setHasCompletedTour = useAppStore((state) => state.setHasCompletedTour);
  const reduceMotion = useReducedMotion() ?? false;

  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(true);

  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const smoothX = useSpring(panX, { stiffness: 120, damping: 22, mass: 0.4 });
  const smoothY = useSpring(panY, { stiffness: 120, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (!selectedExploreZoneId) {
      setSelectedExploreZoneId(heroPanoramaScene.hotspots[0].id);
    }
  }, [selectedExploreZoneId, setSelectedExploreZoneId]);

  const activeHotspotId = selectedExploreZoneId ?? heroPanoramaScene.hotspots[0].id;
  const deferredHotspotId = useDeferredValue(activeHotspotId);
  const activeHotspot =
    heroPanoramaScene.hotspots.find((hotspot) => hotspot.id === deferredHotspotId) ??
    heroPanoramaScene.hotspots[0];
  const activeIndex = heroPanoramaScene.hotspots.findIndex(
    (hotspot) => hotspot.id === activeHotspot.id
  );
  const visitedCount = useMemo(
    () =>
      heroPanoramaScene.hotspots.filter((hotspot) =>
        visitedExploreZoneIds.includes(hotspot.id)
      ).length,
    [visitedExploreZoneIds]
  );

  useEffect(() => {
    markExploreZoneVisited(activeHotspot.id);
  }, [activeHotspot.id, markExploreZoneVisited]);

  useEffect(() => {
    setHasCompletedTour(visitedCount >= heroPanoramaScene.hotspots.length);
  }, [setHasCompletedTour, visitedCount]);

  function selectHotspot(hotspotId: PanoramaHotspot["id"]) {
    setIsMobilePanelOpen(true);
    startTransition(() => {
      setSelectedExploreZoneId(hotspotId);
    });
  }

  function goToRelative(offset: number) {
    const nextIndex =
      (activeIndex + offset + heroPanoramaScene.hotspots.length) %
      heroPanoramaScene.hotspots.length;
    selectHotspot(heroPanoramaScene.hotspots[nextIndex].id);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratioX = (event.clientX - bounds.left) / bounds.width;
    const ratioY = (event.clientY - bounds.top) / bounds.height;
    panX.set((0.5 - ratioX) * 86);
    panY.set((0.5 - ratioY) * 38);
  }

  function handlePointerLeave() {
    panX.set(0);
    panY.set(0);
  }

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#06080d] text-white"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="absolute inset-[-8%]"
        style={
          reduceMotion
            ? { scale: 1.08 }
            : { x: smoothX, y: smoothY, scale: 1.1 }
        }
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroPanoramaScene.assetSrc})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(22,78,144,0.5),transparent_34%),radial-gradient(circle_at_75%_18%,rgba(248,182,82,0.22),transparent_36%),linear-gradient(180deg,rgba(8,12,25,0.18)_0%,rgba(17,15,18,0.16)_40%,rgba(9,10,13,0.52)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,10,16,0.3),transparent_22%,transparent_78%,rgba(7,10,16,0.36))]" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(11,12,16,0)_0%,rgba(6,8,13,0.25)_30%,rgba(5,6,10,0.76)_100%)]" />

        {heroPanoramaScene.hotspots.map((hotspot, index) => {
          const isActive = hotspot.id === activeHotspot.id;

          return (
            <motion.button
              key={hotspot.id}
              type="button"
              onClick={() => selectHotspot(hotspot.id)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${hotspot.anchor.x}%`, top: `${hotspot.anchor.y}%` }}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            >
              <span
                className={cn(
                  "absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border",
                  isActive
                    ? "border-[#f4dcae]/60 bg-[#f4dcae]/12 shadow-[0_0_0_14px_rgba(244,220,174,0.08)]"
                    : "border-white/18 bg-[rgba(10,10,14,0.3)]"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold shadow-[0_18px_34px_rgba(0,0,0,0.34)]",
                  isActive
                    ? "border-[#f4dcae]/80 bg-[#f4dcae] text-[#2f2317]"
                    : "border-white/26 bg-[rgba(7,9,12,0.72)] text-white"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full mt-3 hidden -translate-x-1/2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] lg:block",
                  isActive
                    ? "border-[#f4dcae]/35 bg-[rgba(8,10,15,0.78)] text-[#f6dfb8]"
                    : "border-white/14 bg-[rgba(8,10,15,0.72)] text-white/70"
                )}
              >
                {formatInline(hotspot.markerLabel)}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_55%,rgba(5,6,10,0.42)_100%)]" />

      <div className="absolute left-4 top-4 z-30 w-[min(22rem,calc(100vw-2rem))] md:left-6 md:top-6 md:w-80">
        <div className="rounded-[1.8rem] border border-white/14 bg-[rgba(8,10,14,0.48)] p-5 backdrop-blur-xl shadow-[0_28px_70px_rgba(0,0,0,0.3)]">
          <p className="text-3xl font-semibold tracking-[0.12em] text-[#f4dcae]">
            全景故宫
          </p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/64">
            The Panoramic Palace Museum
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/16"
            >
              Home
            </Link>
            <Link
              href="/selfie"
              className="rounded-full border border-[#d3b178]/26 bg-[#d3b178]/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f6dfb8] hover:bg-[#d3b178]/22"
            >
              Selfie
            </Link>
          </div>

          <BilingualStack
            copy={heroPanoramaScene.routeLabel}
            className="mt-6"
            zhClassName="text-xs font-semibold uppercase tracking-[0.28em] text-[#f1d8b2]"
            enClassName="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/56"
          />
          <BilingualStack
            copy={heroPanoramaScene.title}
            className="mt-4"
            zhClassName="font-display text-3xl leading-tight text-white"
            enClassName="mt-2 text-sm leading-6 text-white/72"
          />
          <BilingualStack
            copy={heroPanoramaScene.subtitle}
            className="mt-4"
            zhClassName="text-sm leading-7 text-white/90"
            enClassName="mt-2 text-sm leading-7 text-white/68"
          />
        </div>

        <div className="mt-4 hidden rounded-[1.8rem] border border-white/12 bg-[rgba(8,10,14,0.4)] p-4 backdrop-blur-xl md:block">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#f1d8b2]">
              Scene map
            </p>
            <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">
              Viewed {visitedCount}/{heroPanoramaScene.hotspots.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {heroPanoramaScene.hotspots.map((hotspot, index) => {
              const isActive = hotspot.id === activeHotspot.id;

              return (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => selectHotspot(hotspot.id)}
                  className={cn(
                    "w-full rounded-[1.2rem] border px-4 py-3 text-left transition-colors",
                    isActive
                      ? "border-[#d3b178]/28 bg-[#d3b178]/12 text-white"
                      : "border-white/10 bg-white/7 text-white/82 hover:bg-white/10"
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f1d8b2]">
                    Stop {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{formatInline(hotspot.markerLabel)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-8 z-30 hidden -translate-x-1/2 lg:block">
        <div
          className="rounded-[1.2rem] border border-white/16 bg-[rgba(8,10,14,0.42)] px-3 py-5 text-center text-[#f4dcae] backdrop-blur-xl"
          style={{ writingMode: "vertical-rl" }}
        >
          <p className="text-xl font-semibold tracking-[0.18em]">
            {heroPanoramaScene.sceneLabel.zh}
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/58">
            {heroPanoramaScene.sceneLabel.en}
          </p>
        </div>
      </div>

      <div className="absolute right-0 top-0 z-30 hidden h-full w-[26rem] p-6 lg:block">
        <HotspotPanel
          activeHotspot={activeHotspot}
          activeIndex={activeIndex}
          totalHotspots={heroPanoramaScene.hotspots.length}
          visitedCount={visitedCount}
          onPrevious={() => goToRelative(-1)}
          onNext={() => goToRelative(1)}
        />
      </div>

      <div className="absolute inset-x-4 bottom-4 z-30 md:left-6 md:right-auto">
        <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-white/14 bg-[rgba(8,10,14,0.48)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <MusicToggleButton tone="dark" compact />
          <button
            type="button"
            onClick={() => goToRelative(1)}
            className="rounded-full border border-white/18 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/16"
          >
            下一站 Next stop
          </button>
          <button
            type="button"
            onClick={() => setIsMobilePanelOpen((current) => !current)}
            className="rounded-full border border-white/18 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/16 lg:hidden"
          >
            {isMobilePanelOpen ? "收起面板 Close panel" : "打开面板 Open panel"}
          </button>
          <span className="rounded-full border border-[#d3b178]/22 bg-[#d3b178]/10 px-4 py-3 text-sm font-semibold text-[#f6dfb8]">
            {formatInline(heroPanoramaScene.location)}
          </span>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-24 z-30 lg:hidden">
        <AnimatePresence initial={false}>
          {isMobilePanelOpen ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 18 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <HotspotPanel
                activeHotspot={activeHotspot}
                activeIndex={activeIndex}
                totalHotspots={heroPanoramaScene.hotspots.length}
                visitedCount={visitedCount}
                onPrevious={() => goToRelative(-1)}
                onNext={() => goToRelative(1)}
                onClose={() => setIsMobilePanelOpen(false)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
