import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN_CITY_HTML_SCENE_PATH = join(
  process.cwd(),
  "src",
  "features",
  "three-d-view",
  "forbidden_city_3d_complete.html"
);

const sceneStyleOverrides = `
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: #04070d;
    color-scheme: dark;
    overscroll-behavior: none;
  }

  body {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  #wrap {
    width: 100% !important;
    height: 100svh !important;
    min-height: 100svh !important;
    border-radius: 0 !important;
  }

  #c3d {
    touch-action: none;
  }

  a,
  button {
    font: inherit;
  }
`;

export function hasForbiddenCityHtmlScene() {
  return existsSync(FORBIDDEN_CITY_HTML_SCENE_PATH);
}

function normalizeSceneMarkup(source: string) {
  return source.trimStart();
}

export function buildForbiddenCityHtmlSceneDocument() {
  const rawMarkup = readFileSync(FORBIDDEN_CITY_HTML_SCENE_PATH, "utf8");
  const normalizedMarkup = normalizeSceneMarkup(rawMarkup);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
    />
    <title>Forbidden City 3D View</title>
    <style>${sceneStyleOverrides}</style>
  </head>
  <body>
    ${normalizedMarkup}
  </body>
</html>`;
}
