import type { Metadata } from "next";
import { SelfieStudio } from "@/features/selfie/selfie-studio";

export const metadata: Metadata = {
  title: "Selfie Postcard Studio",
  description:
    "Capture or upload a photo, frame it with a Forbidden City postcard theme, and generate a downloadable Palace in Motion souvenir.",
};

export default function SelfiePage() {
  return (
    <section className="min-h-[calc(100svh-5rem)]">
      <SelfieStudio />
    </section>
  );
}
