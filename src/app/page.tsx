import { normalizeExploreSearchState } from "@/data/panorama";
import { PanoramaExperience } from "@/features/explore/panorama-experience";

type HomePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const initialState = normalizeExploreSearchState(await searchParams);

  return <PanoramaExperience initialState={initialState} />;
}
