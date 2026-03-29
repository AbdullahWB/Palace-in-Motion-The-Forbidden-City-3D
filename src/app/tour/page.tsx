import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { DemoFlowRail } from "@/components/ui/demo-flow-rail";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteOverview } from "@/data/heritage/site-overview";
import { TourShell } from "@/features/tour/tour-shell";

export const metadata: Metadata = {
  title: "Tour",
  description:
    "A six-stop guided walkthrough of the Forbidden City's ceremonial axis with camera-driven storytelling.",
};

export default function TourPage() {
  return (
    <PageContainer className="py-12 md:py-16">
      <SectionHeading
        eyebrow="Guided tour"
        title="Walk the ceremonial axis as a paced narrative."
        description={siteOverview.tourIntro}
      />
      <DemoFlowRail
        currentStep="tour"
        nextLabel="Use the AI guide from the current stop to deepen the interpretation."
        className="mt-6"
      />
      <div className="mt-8">
        <TourShell />
      </div>
    </PageContainer>
  );
}
