import type { Metadata } from "next";
import { PanoramaExperience } from "@/features/explore/panorama-experience";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "A fullscreen Palace in Motion panorama route with bilingual hotspot storytelling, guided reading, and integrated scene music.",
};

export default function ExplorePage() {
  return <PanoramaExperience />;
}
