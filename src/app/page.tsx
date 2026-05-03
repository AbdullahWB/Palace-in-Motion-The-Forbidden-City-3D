import { redirect } from "next/navigation";
import { normalizeExploreSearchState } from "@/data/panorama";
import { PanoramaExperience } from "@/features/explore/panorama-experience";
import {
  buildExploreHrefFromSearchParams,
  hasInvalidExplorePlaceSlug,
} from "@/lib/app-routes";

type HomePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const requestedSearchParams = await searchParams;

  if (hasInvalidExplorePlaceSlug(requestedSearchParams)) {
    redirect(buildExploreHrefFromSearchParams(requestedSearchParams));
  }

  const initialState = normalizeExploreSearchState(requestedSearchParams);

  return <PanoramaExperience initialState={initialState} />;
}
