import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TourShell } from "@/features/tour/tour-shell";

export const metadata: Metadata = {
  title: "Tour",
  description: "Placeholder guided-tour route for the Palace in Motion scaffold.",
};

export default function TourPage() {
  return (
    <PageContainer className="py-12 md:py-16">
      <SectionHeading
        eyebrow="Guided tour"
        title="Narrative structure without premature tour logic."
        description="The layout is ready for stop sequencing, guide prompts, synced camera moves, and future AI narration without inventing those systems yet."
      />
      <div className="mt-8">
        <TourShell />
      </div>
    </PageContainer>
  );
}
