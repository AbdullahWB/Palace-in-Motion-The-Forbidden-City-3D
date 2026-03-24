import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { landingFeaturePreviews } from "@/data/landing";

export function FeaturePreviewSection() {
  return (
    <section className="py-18 md:py-24">
      <PageContainer>
        <SectionHeading
          eyebrow="Feature preview"
          title="Three entry points into a cinematic heritage experience."
          description="Designed for elegant exploration, guided narrative flow, and future AI-led interpretation."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {landingFeaturePreviews.map((feature, index) => (
            <MotionReveal key={feature.title} delay={index * 0.08}>
              <article className="museum-surface group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.8rem] border border-white/45 p-6 md:p-7">
                <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(183,138,76,0.9),transparent)]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-soft">
                    {feature.eyebrow}
                  </p>
                  <h2 className="mt-4 max-w-sm font-display text-3xl leading-tight text-foreground">
                    {feature.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-8">
                  {feature.href.startsWith("#") ? (
                    <a
                      href={feature.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
                    >
                      {feature.ctaLabel}
                      <span aria-hidden="true">/</span>
                    </a>
                  ) : (
                    <Link
                      href={feature.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
                    >
                      {feature.ctaLabel}
                      <span aria-hidden="true">/</span>
                    </Link>
                  )}
                </div>
              </article>
            </MotionReveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
