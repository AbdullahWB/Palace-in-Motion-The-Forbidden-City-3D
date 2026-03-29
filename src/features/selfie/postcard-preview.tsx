"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PostcardCompositionResult } from "@/lib/selfie/compose-postcard";
import type { PostcardFrame } from "@/types/content";
import { cn } from "@/lib/utils";

type PostcardPreviewProps = {
  frame: PostcardFrame;
  composition: PostcardCompositionResult | null;
  sourceImage: string | null;
  focusLabel: string;
  title: string;
  caption: string;
  isCameraActive: boolean;
  isGenerating: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
};

const frameStyles = {
  "imperial-red": {
    frame: "border-[#8a2230] bg-gradient-to-br from-[#fff6ef] via-[#f5e5d6] to-[#efd7c0]",
    ribbon: "bg-[#8a2230] text-white",
    inset: "bg-white/65",
  },
  "sunlit-bronze": {
    frame: "border-[#b78a4c] bg-gradient-to-br from-[#fff8ee] via-[#f0e1c7] to-[#e8d1a8]",
    ribbon: "bg-[#b78a4c] text-[#2a1e16]",
    inset: "bg-white/58",
  },
  "jade-ink": {
    frame: "border-[#29453c] bg-gradient-to-br from-[#f2f1ea] via-[#dde6dd] to-[#c9d8ce]",
    ribbon: "bg-[#29453c] text-white",
    inset: "bg-white/56",
  },
} as const;

export function PostcardPreview({
  frame,
  composition,
  sourceImage,
  focusLabel,
  title,
  caption,
  isCameraActive,
  isGenerating,
  videoRef,
}: PostcardPreviewProps) {
  const activeStyle = frameStyles[frame.accentToken];
  const reduceMotion = useReducedMotion() ?? false;
  const previewStateKey = composition
    ? "composition"
    : isCameraActive
      ? "camera"
      : sourceImage
        ? "source"
        : "empty";

  return (
    <section
      className={cn(
        "paper-panel rounded-[1.9rem] border p-6 md:p-8",
        activeStyle.frame
      )}
    >
      <div
        className={cn(
          "rounded-[1.55rem] border border-white/70 p-5 backdrop-blur md:p-7",
          activeStyle.inset
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
              Postcard preview
            </p>
            <h2 className="mt-3 font-display text-4xl text-foreground">
              {title.trim() || frame.defaultTitle || frame.title}
            </h2>
          </div>
          <div
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]",
              activeStyle.ribbon
            )}
          >
            {frame.ribbonLabel}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_17rem]">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/72 p-5">
            <div className="relative flex h-[24rem] items-center justify-center overflow-hidden rounded-[1.2rem] border border-white/70 bg-gradient-to-br from-white/80 to-white/40">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={previewStateKey}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 1.015 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="absolute inset-0"
                >
                  {composition ? (
                    <Image
                      src={composition.dataUrl}
                      alt="Generated Forbidden City postcard preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : sourceImage ? (
                    <Image
                      src={sourceImage}
                      alt="Selected source photo"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center">
                      <div className="max-w-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                          Ready for capture
                        </p>
                        <p className="mt-3 font-display text-3xl text-foreground">
                          Add a portrait or scene snapshot
                        </p>
                        <p className="mt-3 text-sm leading-7 text-muted">
                          Start the camera or upload an image, then generate a themed
                          souvenir card for the Forbidden City.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#201612]/35 backdrop-blur-[2px]">
                  <p className="rounded-full border border-white/25 bg-white/20 px-4 py-2 text-sm font-semibold text-white">
                    Generating postcard...
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/70 bg-white/65 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
              Composition notes
            </p>
            <p className="mt-4 font-display text-3xl text-foreground">
              {focusLabel}
            </p>
            <p className="mt-4 text-sm leading-7 text-muted">
              {caption.trim() ||
                "A short caption will appear here after you type one or ask the AI guide for a suggestion."}
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">
              Theme preset
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">{frame.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
