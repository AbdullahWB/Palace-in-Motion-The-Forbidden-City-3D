import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SelfieStudio } from "@/features/selfie/selfie-studio";

export const metadata: Metadata = {
  title: "Selfie",
  description: "Placeholder selfie and postcard route for the Palace in Motion scaffold.",
};

export default function SelfiePage() {
  return (
    <PageContainer className="py-12 md:py-16">
      <SectionHeading
        eyebrow="Selfie and postcard"
        title="A composition shell for future capture and sharing tools."
        description="The route already includes postcard framing state and a preview surface, but stops short of uploads, exports, or any fake media pipeline."
      />
      <div className="mt-8">
        <SelfieStudio />
      </div>
    </PageContainer>
  );
}
