import { existsSync } from "node:fs";
import { join } from "node:path";
import { hasForbiddenCityHtmlScene } from "@/features/three-d-view/forbidden-city-html-scene";
import { ThreeDHtmlView } from "@/features/three-d-view/three-d-html-view";
import { ThreeDViewShell } from "@/features/three-d-view/three-d-view-shell";
import { forbiddenCityViewerConfig } from "@/features/three-d-view/viewer-config";

export default function ThreeDViewPage() {
  if (hasForbiddenCityHtmlScene()) {
    return <ThreeDHtmlView />;
  }

  const hasModelAsset = existsSync(
    join(process.cwd(), "public", "models", "forbidden-city.glb")
  );

  return (
    <ThreeDViewShell
      config={forbiddenCityViewerConfig}
      hasModelAsset={hasModelAsset}
    />
  );
}
