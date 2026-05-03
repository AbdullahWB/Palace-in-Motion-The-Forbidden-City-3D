import { redirect } from "next/navigation";
import { buildExploreHrefFromSearchParams } from "@/lib/app-routes";

type ExploreRedirectPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ExploreRedirectPage({
  searchParams,
}: ExploreRedirectPageProps) {
  redirect(buildExploreHrefFromSearchParams(await searchParams));
}
