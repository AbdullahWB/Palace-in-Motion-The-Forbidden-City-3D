const sceneNotes = [
  "Canvas is isolated to the client to avoid hydration issues in the App Router.",
  "Geometry is intentionally primitive so scene architecture can evolve before asset integration.",
  "The side panel gives the route a place for metadata, camera presets, and scene legends later.",
];

const nextSceneSteps = [
  "Replace primitives with a streamed palace blockout model.",
  "Add point-of-interest markers and contextual overlays.",
  "Introduce camera bookmarks for guided transitions.",
];

export function ScenePanel() {
  return (
    <aside className="paper-panel rounded-[1.8rem] border border-border p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
        Scene notes
      </p>
      <h2 className="mt-3 font-display text-3xl text-foreground">
        Explore route scaffolding
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        The scene already demonstrates the rendering boundary, route layout,
        and interaction surface that later palace models can plug into.
      </p>

      <div className="mt-6 space-y-4">
        {sceneNotes.map((note) => (
          <div
            key={note}
            className="rounded-[1.35rem] border border-border bg-white/80 p-4"
          >
            <p className="text-sm leading-7 text-muted">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
          Next scene layer
        </p>
        <ul className="mt-3 space-y-3 text-sm leading-7 text-muted">
          {nextSceneSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
