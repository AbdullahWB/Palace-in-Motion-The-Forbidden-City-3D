# Feedback and Recommended Improvements

The current version of **Palace in Motion** is an AI-assisted digital heritage learning platform focused on panoramic exploration, guided routes, Passport progress, source-aware AI explanations, preservation notes, accessibility tools, Travel Diary output, and a model-ready 3D viewer.

Future planning should focus on the visitor and self-guided learning experience.

## Complete the 3D View

The 3D View is prepared for a real Forbidden City GLB asset, but the high-fidelity model is not bundled. Add an optimized, licensed model at:

```text
public/models/forbidden-city.glb
```

Recommended work:

1. Compress geometry with Draco or Meshopt.
2. Use web-friendly textures such as KTX2 or WebP.
3. Align model scale with existing hotspots and route overlays.
4. Verify low, medium, and high quality modes.
5. Keep the procedural fallback working when the model is missing or fails.
6. Document source, license, polygon count, texture sizes, and compression method.

## Refactor Large Components

The biggest maintainability risk is component size. `panorama-experience.tsx` handles the welcome screen, map, place view, Passport drawer, Auto Tour, selfie modal, Travel Diary, accessibility behavior, query-state navigation, and progress updates.

Recommended split:

- `WelcomePanel.tsx`
- `PalaceMapView.tsx`
- `PlaceView.tsx`
- `PlaceInfoPanel.tsx`
- `AutoTourControls.tsx`
- `PassportDrawer.tsx`
- `TravelDiaryPanel.tsx`
- `SelfieEntryModal.tsx`

This would make the feature easier to test and change without touching the full immersive shell.

## Strengthen Accessibility

Accessibility remains a core strength. Next improvements:

- Add ARIA labels to every icon-only control.
- Add `aria-live` regions for Auto Tour narration and loading states.
- Add focus traps to Passport and Selfie overlays.
- Make Escape close major overlays consistently.
- Ensure map markers, route cards, scene frames, and 3D hotspots are keyboard reachable.
- Make reduced-motion mode disable large camera and background movement.
- Provide transcript text for voice narration.

## Improve Engagement

The app already supports route seals, quiz stamps, Travel Diary generation, and 3D challenge badges. Useful additions:

- Visit all 10 palace places.
- Complete every route.
- View every scene frame in one route.
- Read five preservation notes.
- Earn all quiz stamps.
- Follow one full route overlay in 3D.
- Compare a map route with the 3D route.

## Production Hardening

The project already has scripts for linting, type checking, unit tests, build, Playwright, and bundle analysis. Recommended next steps:

1. Add a GitHub Actions workflow for lint, typecheck, tests, build, and E2E.
2. Add production security headers in `next.config.ts`.
3. Add caching rules for large images, videos, and future GLB assets.
4. Add E2E coverage for the main route, Companion, Passport, Selfie entry, and 3D fallback.

## Priority Order

1. Complete the 3D model integration.
2. Refactor the largest client components.
3. Strengthen accessibility and keyboard support.
4. Expand visitor achievement missions.
5. Add production security headers and CI.
