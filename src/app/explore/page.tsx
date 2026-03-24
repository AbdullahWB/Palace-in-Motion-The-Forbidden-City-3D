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
        title="A safe scene shell for future palace environments."
        description="This route already mounts a React Three Fiber canvas on the client, with modular scene notes beside it and no external assets yet."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_24rem]">
        <ExploreStage />
        <ScenePanel />
      </div>
    </PageContainer>
  );
}
