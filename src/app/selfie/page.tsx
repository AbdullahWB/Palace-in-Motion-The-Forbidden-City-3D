import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SelfieStudio } from "@/features/selfie/selfie-studio";

export const metadata: Metadata = {
  title: "Selfie Postcard Studio",
  description:
    "Capture or upload a photo, frame it with a Forbidden City postcard theme, and generate a downloadable Palace in Motion souvenir.",
};

export default function SelfiePage() {
  return (
    <PageContainer className="py-12 md:py-16">
      <SectionHeading
        eyebrow="Selfie and postcard"
        title="Build a polished Forbidden City souvenir card."
        description="Capture a live image or upload a photo, pair it with a themed postcard frame, and let the AI cultural guide suggest a concise caption grounded in the same heritage content used across the experience."
      />
      <div className="mt-8">
        <SelfieStudio />
      </div>
    </PageContainer>
  );
}
