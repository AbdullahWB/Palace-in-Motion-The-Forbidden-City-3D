"use client";

import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { cn } from "@/lib/utils";

export type LocalizedCopy = {
  zh: string;
  en: string;
};

type ImmersiveStatusScreenProps = {
  eyebrow: LocalizedCopy;
  title: LocalizedCopy;
  description: LocalizedCopy;
  statusLabel?: LocalizedCopy;
  code?: string;
  actions?: ReactNode;
  kind?: "loading" | "error";
};

type StandardStatusScreenProps = {
  eyebrow: LocalizedCopy;
  title: LocalizedCopy;
  description: LocalizedCopy;
  statusLabel?: LocalizedCopy;
  actions?: ReactNode;
  kind?: "loading" | "error";
  canvasHeightClassName?: string;
};

type ImmersiveAssetLoadingOverlayProps = {
  visible: boolean;
  eyebrow: LocalizedCopy;
  title: LocalizedCopy;
  description: LocalizedCopy;
  statusLabel?: LocalizedCopy;
  actions?: ReactNode;
  kind?: "loading" | "error";
  className?: string;
  compact?: boolean;
};

function localize(copy: LocalizedCopy, language: "zh" | "en") {
  return copy[language];
}

export function ImmersiveStatusScreen({
  eyebrow,
  title,
  description,
  statusLabel,
  code,
  actions,
  kind = "loading",
}: ImmersiveStatusScreenProps) {
  const { language } = useSitePreferences();
  const titleText = localize(title, language);
  const descriptionText = localize(description, language);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 hero-vignette" />
      <div className="absolute inset-0 hero-lattice opacity-80" />
      <div className="absolute -left-28 top-10 hero-orb h-80 w-80 bg-[rgba(182,63,84,0.18)]" />
      <div className="absolute right-[-6rem] top-16 hero-orb h-96 w-96 bg-[rgba(214,176,113,0.18)]" />
      <div className="absolute left-1/2 top-[58%] h-[28rem] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_64%)] blur-3xl" />

      <div className="relative flex min-h-[100svh] items-center justify-center px-6 py-14">
        <div className="museum-surface w-full max-w-4xl rounded-[2.5rem] border border-border/80 p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-accent-soft/18 bg-accent-soft/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-soft">
              {localize(eyebrow, language)}
            </span>
            {statusLabel ? (
              <span className="rounded-full border border-border/80 bg-surface/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                {localize(statusLabel, language)}
              </span>
            ) : null}
            {code ? (
              <span className="rounded-full border border-border/80 bg-surface/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                {code}
              </span>
            ) : null}
          </div>

          <h1 className="mt-6 font-display text-5xl leading-none text-foreground md:text-7xl">
            {titleText}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted md:text-lg">
            {descriptionText}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn(
                  "rounded-[1.6rem] border border-border/80 bg-surface/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)]",
                  kind === "loading" ? "animate-pulse" : ""
                )}
              >
                <div className="h-3 w-24 rounded-full bg-accent-soft/18" />
                <div className="mt-4 h-5 w-3/4 rounded-full bg-accent-soft/10" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 rounded-full bg-accent-soft/10" />
                  <div className="h-3 rounded-full bg-accent-soft/8" />
                  <div className="h-3 w-5/6 rounded-full bg-accent-soft/8" />
                </div>
              </div>
            ))}
          </div>

          {actions ? <div className="mt-10 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function StandardStatusScreen({
  eyebrow,
  title,
  description,
  statusLabel,
  actions,
  kind = "loading",
  canvasHeightClassName = "h-[34rem] xl:h-[42rem]",
}: StandardStatusScreenProps) {
  const { language } = useSitePreferences();

  return (
    <PageContainer className="py-12 md:py-16">
      <section aria-busy={kind === "loading"} className="relative">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-accent-soft/18 bg-accent-soft/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-soft">
              {localize(eyebrow, language)}
            </span>
            {statusLabel ? (
              <span className="rounded-full border border-border/80 bg-surface/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                {localize(statusLabel, language)}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 font-display text-4xl leading-tight text-foreground md:text-5xl">
            {localize(title, language)}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted md:text-lg">
            {localize(description, language)}
          </p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_24rem]">
          <div
            className={cn(
              "paper-panel overflow-hidden rounded-[1.9rem] border border-border/80",
              kind === "loading" ? "animate-pulse" : ""
            )}
          >
            <div className="border-b border-border/80 px-5 py-4">
              <div className="h-3 w-40 rounded-full bg-accent-soft/18" />
              <div className="mt-3 h-3 w-80 max-w-full rounded-full bg-accent-soft/10" />
            </div>
            <div className={cn("w-full bg-white/45", canvasHeightClassName)} />
          </div>

          <div className="space-y-6">
            <div
              className={cn(
                "paper-panel rounded-[1.8rem] border border-border/80 p-6",
                kind === "loading" ? "animate-pulse" : ""
              )}
            >
              <div className="h-3 w-28 rounded-full bg-accent-soft/18" />
              <div className="mt-4 h-10 w-52 rounded-2xl bg-accent-soft/12" />
              <div className="mt-4 space-y-3">
                <div className="h-3 rounded-full bg-accent-soft/10" />
                <div className="h-3 rounded-full bg-accent-soft/8" />
                <div className="h-3 w-5/6 rounded-full bg-accent-soft/8" />
              </div>
              <div className="mt-6 h-32 rounded-[1.35rem] bg-accent-soft/8" />
            </div>

            {actions ? (
              <div className="paper-panel rounded-[1.8rem] border border-border/80 p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-soft">
                  {language === "zh" ? "可用操作" : "Available actions"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">{actions}</div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

export function ImmersiveAssetLoadingOverlay({
  visible,
  eyebrow,
  title,
  description,
  statusLabel,
  actions,
  kind = "loading",
  className,
  compact = false,
}: ImmersiveAssetLoadingOverlayProps) {
  const { language } = useSitePreferences();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center p-6 transition-opacity duration-400",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      aria-hidden={!visible}
    >
      <div className="absolute inset-0 bg-[rgba(4,6,10,0.2)] backdrop-blur-[6px]" />
      <div
        className={cn(
          "relative museum-surface w-full border border-border/80 text-center shadow-[0_26px_80px_rgba(0,0,0,0.2)]",
          compact
            ? "max-w-md rounded-[1.8rem] px-6 py-6"
            : "max-w-xl rounded-[2rem] px-8 py-8"
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-soft">
          {localize(eyebrow, language)}
        </p>
        <h2 className="mt-4 font-display text-3xl leading-none text-foreground md:text-4xl">
          {localize(title, language)}
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          {localize(description, language)}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <span
            className={cn(
              "h-3 w-3 rounded-full bg-accent-soft",
              kind === "loading" ? "animate-pulse" : ""
            )}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
            {statusLabel
              ? localize(statusLabel, language)
              : language === "zh"
                ? "资源加载中"
                : "Loading assets"}
          </span>
        </div>
        {actions ? (
          <div className="pointer-events-auto mt-5 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
