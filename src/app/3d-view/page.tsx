import { existsSync } from "node:fs";
import { join } from "node:path";
import { ThreeDViewPageClient } from "@/app/3d-view/three-d-view-page-client";
import { forbiddenCityViewerConfig } from "@/features/three-d-view/viewer-config";

export default function ThreeDViewPage() {
  const hasModelAsset = existsSync(
    join(process.cwd(), "public", "models", "forbidden-city.glb")
  );

  return (
    <ThreeDViewPageClient
      config={forbiddenCityViewerConfig}
      hasModelAsset={hasModelAsset}
    />
  );
}
