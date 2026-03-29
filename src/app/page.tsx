import { AIGuidePreviewSection } from "@/features/home/ai-guide-preview-section";
import { FeaturePreviewSection } from "@/features/home/feature-preview-section";
import { HeroSection } from "@/features/home/hero-section";
import { ProjectSummarySection } from "@/features/home/project-summary-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturePreviewSection />
      <AIGuidePreviewSection />
      <ProjectSummarySection />
    </>
  );
}
