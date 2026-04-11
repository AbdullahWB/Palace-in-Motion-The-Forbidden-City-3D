import { redirect } from "next/navigation";

type ExploreRedirectPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function buildSearchString(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, item);
      });
      continue;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  return params.toString();
}

export default async function ExploreRedirectPage({
  searchParams,
}: ExploreRedirectPageProps) {
  const query = buildSearchString(await searchParams);

  redirect(query ? `/?${query}` : "/");
}
