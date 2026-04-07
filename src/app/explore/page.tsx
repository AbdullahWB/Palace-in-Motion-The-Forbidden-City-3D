import type { Metadata } from "next";
import { normalizeExploreSearchState } from "@/data/panorama";
import { PanoramaExperience } from "@/features/explore/panorama-experience";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "A fullscreen Palace in Motion route with a welcoming palace view, zoomable map overlay, and place-by-place photo exploration.",
};

type ExplorePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const initialState = normalizeExploreSearchState(await searchParams);

  return <PanoramaExperience initialState={initialState} />;
}
