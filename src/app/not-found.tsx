import Link from "next/link";
import { ForbiddenCityErrorScreen } from "@/components/ui/forbidden-city-status-screens";
import { appRoutes } from "@/lib/app-routes";

export default function NotFound() {
  return (
    <ForbiddenCityErrorScreen
      code="404"
      actions={
        <>
          <Link
            href={appRoutes.home}
            className="rounded-full border-none bg-[#8B1F26] px-5 py-2 text-xs font-medium tracking-wide text-[#f8ead8] outline-none transition hover:bg-[#6f171e] focus-visible:ring-2 focus-visible:ring-[#c49010]"
          >
            Home
          </Link>
          <Link
            href={appRoutes.map()}
            className="rounded-full border border-[rgba(100,50,30,0.3)] bg-transparent px-5 py-2 text-xs font-medium tracking-wide text-[#5a2818] outline-none transition hover:bg-[#eadfce] focus-visible:ring-2 focus-visible:ring-[#c49010]"
          >
            Open map
          </Link>
          <Link
            href={appRoutes.threeD}
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
