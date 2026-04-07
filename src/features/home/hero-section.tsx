"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import {
  landingFeaturePreviews,
  landingHero,
  landingHeroActions,
} from "@/data/landing";
import type { HeroAction } from "@/types/content";
import { cn } from "@/lib/utils";
import { AmbientMotionLayer } from "@/features/home/ambient-motion-layer";

function HeroActionButton({
  action,
  index,
  reduceMotion,
}: {
  action: HeroAction;
  index: number;
  reduceMotion: boolean;
}) {
  const baseClassName =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold md:px-7 md:py-3.5";

  const variantClassName = cn(
    action.variant === "primary" &&
      "bg-accent text-white shadow-[0_18px_40px_rgba(138,34,48,0.24)] hover:bg-accent-strong",
    action.variant === "secondary" &&
      "border border-white/50 bg-white/72 text-foreground backdrop-blur hover:bg-white",
    action.variant === "ghost" &&
      "border border-accent/16 bg-[rgba(255,248,240,0.34)] text-foreground hover:border-accent/28 hover:bg-white/70"
  );

  const wrapperProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.72,
          delay: 0.42 + index * 0.08,
          ease: [0.16, 1, 0.3, 1] as const,
        },
      };

  return (
    <motion.div {...wrapperProps}>
      {action.href.startsWith("#") ? (
        <a href={action.href} className={cn(baseClassName, variantClassName)}>
          {action.label}
        </a>
      ) : (
        <Link href={action.href} className={cn(baseClassName, variantClassName)}>
          {action.label}
        </Link>
      )}
    </motion.div>
  );
}

export function HeroSection() {
  const reduceMotion = useReducedMotion() ?? false;

  const revealProps = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.8,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <section className="relative isolate overflow-hidden">
      <AmbientMotionLayer />

      <PageContainer className="relative flex min-h-[calc(100svh-5rem)] items-center py-10 md:py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:items-end">
          <div className="max-w-4xl">
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.34em] text-accent-soft"
              {...revealProps(0.08)}
            >
              {landingHero.eyebrow}
            </motion.p>

            <div className="mt-6 space-y-1">
              {landingHero.titleLines.map((line, index) => (
                <div key={line} className="overflow-hidden">
                  <motion.h1
                    className={cn(
                      "font-display text-[clamp(4.2rem,10vw,8.8rem)] leading-[0.9] tracking-[-0.04em] text-wrap-balance",
                      index === 1 &&
                        "bg-[linear-gradient(120deg,#251813_10%,#8a2230_55%,#b78a4c_100%)] bg-clip-text text-transparent"
                    )}
                    initial={
                      reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: "108%" }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.95,
                      delay: 0.16 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {line}
                  </motion.h1>
                </div>
              ))}
            </div>

            <motion.p
              className="mt-6 max-w-2xl text-lg leading-8 text-muted md:text-xl"
              {...revealProps(0.32)}
            >
              {landingHero.subtitle}
            </motion.p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {landingHeroActions.map((action, index) => (
                <HeroActionButton
                  key={action.label}
                  action={action}
                  index={index}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>

          <motion.aside
            className="museum-surface relative overflow-hidden rounded-[2rem] border border-white/50 p-6 md:p-8 lg:justify-self-end"
            {...revealProps(0.28)}
          >
            <div className="hero-lattice absolute inset-0 opacity-55" />
            <div className="absolute -right-14 top-8 h-36 w-36 rounded-full bg-[rgba(183,138,76,0.16)] blur-3xl" />
            <div className="absolute -left-10 bottom-10 h-28 w-28 rounded-full bg-[rgba(138,34,48,0.12)] blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-soft">
                Panorama preview
              </p>
              <h2 className="mt-4 max-w-sm font-display text-3xl leading-tight text-foreground md:text-4xl">
                A palace experience now built around one immersive route.
              </h2>

              <div className="mt-8 space-y-4">
                {landingFeaturePreviews.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="rounded-[1.5rem] border border-white/55 bg-white/55 p-4 backdrop-blur-sm"
                    initial={
                      reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.65,
                      delay: 0.46 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-soft">
                          {feature.eyebrow}
                        </p>
                        <p className="mt-2 font-display text-2xl leading-tight text-foreground">
                          {feature.title}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-accent">
                        0{index + 1}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </PageContainer>
    </section>
  );
}
