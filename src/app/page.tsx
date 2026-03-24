import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { InfoCard } from "@/components/ui/info-card";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  featureCards,
  landingHighlights,
  landingMetrics,
} from "@/data/landing";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function Home() {
  return (
    <div className="pb-24">
      <PageContainer className="pt-12 md:pt-16">
        <MotionReveal className="overflow-hidden rounded-[2rem] border border-border/80 bg-surface/95 px-6 py-10 shadow-[0_24px_70px_rgba(74,37,28,0.12)] backdrop-blur md:px-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.9fr)] lg:items-end">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent-soft">
                Forbidden City digital heritage scaffold
              </p>
              <div className="space-y-4">
                <h1 className="max-w-4xl font-display text-5xl leading-none text-foreground sm:text-6xl md:text-7xl">
                  {APP_NAME}
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-muted md:text-xl">
                  {APP_TAGLINE}
                </p>
                <p className="max-w-2xl text-sm leading-7 text-muted md:text-base">
                  This foundation establishes the navigation shell, theme,
                  placeholder content, and a safe 3D canvas entry point so the
                  next implementation phase can focus on real scenes,
                  storytelling, and AI guidance.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-strong"
                >
                  Enter the 3D courtyard
                </Link>
                <Link
                  href="/tour"
                  className="inline-flex items-center justify-center rounded-full border border-accent/20 bg-white/70 px-6 py-3 text-sm font-semibold text-foreground hover:border-accent/40 hover:bg-white"
                >
                  View tour structure
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {landingMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.6rem] border border-border bg-white/80 px-5 py-5 shadow-[0_18px_50px_rgba(74,37,28,0.08)]"
                >
                  <p className="font-display text-3xl leading-none text-accent md:text-4xl">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </MotionReveal>
      </PageContainer>

      <PageContainer className="mt-20">
        <SectionHeading
          eyebrow="Route foundation"
          title="Placeholder journeys are ready for real content."
          description="Each route is scaffolded with its own purpose, modular data, and a clear seam for the next implementation stage."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featureCards.map((card, index) => (
            <MotionReveal key={card.href} delay={index * 0.08}>
              <InfoCard title={card.title} description={card.body} href={card.href} />
            </MotionReveal>
          ))}
        </div>
      </PageContainer>

      <PageContainer className="mt-20">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <MotionReveal className="rounded-[1.8rem] border border-border bg-surface/90 p-7 shadow-[0_18px_50px_rgba(74,37,28,0.08)]">
            <SectionHeading
              eyebrow="Why this scaffold"
              title="Clean seams for a medium-sized app."
              description="The current structure stays lean while leaving room for richer scene orchestration, narrative state, and media workflows."
            />
          </MotionReveal>

          <div className="grid gap-4">
            {landingHighlights.map((highlight, index) => (
              <MotionReveal
                key={highlight.title}
                delay={index * 0.06}
                className="rounded-[1.5rem] border border-border bg-white/85 p-5 shadow-[0_16px_40px_rgba(74,37,28,0.08)]"
              >
                <h2 className="font-display text-2xl text-foreground">
                  {highlight.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {highlight.description}
                </p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
