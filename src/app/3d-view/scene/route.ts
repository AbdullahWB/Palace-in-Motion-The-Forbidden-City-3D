import { buildForbiddenCityHtmlSceneDocument, hasForbiddenCityHtmlScene } from "@/features/three-d-view/forbidden-city-html-scene";

export const dynamic = "force-static";
export const runtime = "nodejs";

export async function GET() {
  if (!hasForbiddenCityHtmlScene()) {
    return new Response("Forbidden City 3D scene not found.", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(buildForbiddenCityHtmlSceneDocument(), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
