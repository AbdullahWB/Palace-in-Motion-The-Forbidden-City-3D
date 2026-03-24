import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { aiGuidePreview, aiGuidePreviewPoints } from "@/data/landing";

export function AIGuidePreviewSection() {
  return (
    <section id="ai-guide" className="scroll-mt-28 py-18 md:py-24">
      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <MotionReveal className="museum-surface rounded-[2rem] border border-white/50 p-7 md:p-8">
            <SectionHeading
              eyebrow={aiGuidePreview.eyebrow}
              title={aiGuidePreview.title}
              description={aiGuidePreview.description}
            />

            <p className="mt-6 max-w-xl text-sm leading-7 text-muted">
              Rather than simulating chatter, the guide is intended to deliver
              contextual interpretation with precision, restraint, and cultural
              care.
            </p>

            <Link
              href="/tour"
              className="mt-8 inline-flex items-center justify-center rounded-full border border-accent/18 bg-white/75 px-6 py-3 text-sm font-semibold text-foreground hover:border-accent/30 hover:bg-white"
            >
              Preview the guided route
            </Link>
          </MotionReveal>

          <div className="grid gap-4">
            {aiGuidePreviewPoints.map((point, index) => (
              <MotionReveal
                key={point.title}
                delay={index * 0.08}
                className="museum-surface rounded-[1.6rem] border border-white/45 p-5 md:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/18 bg-white/70 text-sm font-semibold text-accent">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-foreground">
                      {point.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {point.description}
                    </p>
                  </div>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
