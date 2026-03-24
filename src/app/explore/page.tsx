import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ExploreStage } from "@/features/explore/explore-stage";
import { ScenePanel } from "@/features/explore/scene-panel";

export const metadata: Metadata = {
  title: "Explore",
  description: "A client-only 3D exploration placeholder for the Forbidden City experience.",
};

export default function ExplorePage() {
  return (
    <PageContainer className="py-12 md:py-16">
      <SectionHeading
        eyebrow="3D exploration"
        title="A spatial MVP for the Forbidden City experience."
        description="This first scene proves the 3D foundation with a lightweight architectural blockout, smooth camera controls, and clickable cultural hotspots."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_24rem]">
        <ExploreStage />
        <ScenePanel />
      </div>
    </PageContainer>
  );
}
