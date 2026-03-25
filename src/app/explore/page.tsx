import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteOverview } from "@/data/heritage/site-overview";
import { ExploreStage } from "@/features/explore/explore-stage";
import { ExploreSidebar } from "@/features/explore/explore-sidebar";

export const metadata: Metadata = {
  title: "Explore",
  description: "A stylized Forbidden City-inspired 3D route with axial zones and interactive storytelling metadata.",
};

export default function ExplorePage() {
  return (
    <PageContainer className="py-12 md:py-16">
      <SectionHeading
        eyebrow="3D exploration"
        title="A stylized axial reading of the Forbidden City."
        description={siteOverview.exploreIntro}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_24rem]">
        <ExploreStage />
        <ExploreSidebar />
      </div>
    </PageContainer>
  );
}
