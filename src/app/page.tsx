import { normalizeExploreSearchState } from "@/data/panorama";
import { PanoramaExperience } from "@/features/explore/panorama-experience";

export default function HomePage() {
  const initialState = normalizeExploreSearchState({});

  return <PanoramaExperience initialState={initialState} />;
}
