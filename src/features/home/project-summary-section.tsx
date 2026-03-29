import { DemoBadgePanel } from "@/components/ui/demo-badge-panel";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  demoFlowSteps,
  projectSummary,
  projectSummaryCards,
} from "@/data/landing";

export function ProjectSummarySection() {
  return (
    <section className="py-18 md:py-24">
      <PageContainer>
        <SectionHeading
          eyebrow={projectSummary.eyebrow}
          title={projectSummary.title}
          description={projectSummary.description}
        />

        <div className="mt-8 flex flex-wrap gap-3">
          {demoFlowSteps.map((step, index) => (
            <span
              key={step.id}
              className="rounded-full border border-accent/15 bg-white/78 px-4 py-2 text-sm font-semibold text-foreground"
            >
              {String(index + 1).padStart(2, "0")} {step.label}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_24rem]">
          <div className="grid gap-6 lg:grid-cols-3">
            {projectSummaryCards.map((card, index) => (
              <MotionReveal key={card.title} delay={index * 0.07}>
                <article className="museum-surface h-full rounded-[1.8rem] border border-white/45 p-6 md:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-soft">
                    {card.eyebrow}
                  </p>
                  <h2 className="mt-4 font-display text-3xl leading-tight text-foreground">
                    {card.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {card.description}
                  </p>
                </article>
              </MotionReveal>
            ))}
          </div>

          <MotionReveal delay={0.18}>
            <DemoBadgePanel className="h-full" />
          </MotionReveal>
        </div>
      </PageContainer>
    </section>
  );
}
