import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
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
        description="This route reuses the stylized Forbidden City scene but trades free exploration for a guided camera, concise interpretation, and a stable six-stop sequence."
      />
      <div className="mt-8">
        <TourShell />
      </div>
    </PageContainer>
  );
}
