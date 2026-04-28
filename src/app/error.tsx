"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ForbiddenCityErrorScreen } from "@/components/ui/forbidden-city-status-screens";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ForbiddenCityErrorScreen
      code={error.digest ?? "APP"}
      actions={
        <>
          <button
            type="button"
            onClick={unstable_retry}
            className="rounded-full border-none bg-[#8B1F26] px-5 py-2 text-xs font-medium tracking-wide text-[#f8ead8] outline-none transition hover:bg-[#6f171e] focus-visible:ring-2 focus-visible:ring-[#c49010]"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-full border border-[rgba(100,50,30,0.3)] bg-transparent px-5 py-2 text-xs font-medium tracking-wide text-[#5a2818] outline-none transition hover:bg-[#eadfce] focus-visible:ring-2 focus-visible:ring-[#c49010]"
          >
            Home
          </Link>
          <Link
            href="/3d-view"
            prefetch={false}
            className="rounded-full border border-[rgba(100,50,30,0.3)] bg-transparent px-5 py-2 text-xs font-medium tracking-wide text-[#5a2818] outline-none transition hover:bg-[#eadfce] focus-visible:ring-2 focus-visible:ring-[#c49010]"
          >
            3D view
          </Link>
        </>
      }
    />
  );
}
