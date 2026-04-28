# Forbidden City GLB Asset Handoff

Place the production model at:

```text
public/models/forbidden-city.glb
```

The 3D page detects this exact file and swaps from the procedural fallback to the real model automatically.

Recommended web export targets:

- Use a licensed photogrammetry, CAD, or hand-authored model source.
- Export as binary glTF (`.glb`) with Y-up orientation and the palace centered near world origin.
- Keep the model aligned to the existing route coordinate system where possible: south gate on positive Z, inner court on negative Z, central axis near X=0.
- Compress geometry with Draco or Meshopt.
- Compress textures with KTX2 or WebP and keep mobile textures near 1K-2K unless a close inspection view needs more detail.
- Keep the first-load asset budget under 25-40 MB for mobile if possible, with lower LODs for older devices.

Example optimization commands with glTF Transform:

```bash
npx @gltf-transform/cli optimize source.glb public/models/forbidden-city.glb --compress draco --texture-compress webp --texture-size 2048
```

If route overlays or hotspots do not align perfectly after importing the real model, update the coordinates in `src/features/three-d-view/viewer-config.ts`.
