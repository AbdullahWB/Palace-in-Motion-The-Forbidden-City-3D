# Palace in Motion

Production-ready scaffold for "Palace in Motion: A 3D Interactive Heritage Tour of the Forbidden City with an AI Cultural Guide".

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- React Three Fiber
- `@react-three/drei`
- Zustand
- Framer Motion

## Routes

- `/` landing page
- `/explore` interactive 3D exploration placeholder
- `/tour` guided tour placeholder
- `/selfie` selfie and postcard placeholder

## Project Structure

```text
src/
  app/                 App Router routes and layout
  components/
    layout/            Shared shell components
    ui/                Reusable presentational primitives
  data/                Placeholder content modules
  features/
    explore/           3D scene placeholder and route-specific UI
    selfie/            Postcard placeholder UI
    tour/              Guided tour placeholder UI
  lib/                 Shared constants and utilities
  store/               Zustand store
  types/               Shared TypeScript types
```

## Prerequisites

- Node.js 22+
- npm 11+

## Development

Install dependencies:

```bash
npm install
```

If PowerShell blocks `npm` because of script execution policy, use:

```bash
npm.cmd install
```

Start the development server:

```bash
npm run dev
```

PowerShell fallback:

```bash
npm.cmd run dev
```

Then open `http://localhost:3000`.

## Quality Checks

Run lint:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```

PowerShell fallback:

```bash
npm.cmd run lint
npm.cmd run build
```

## Current Scope

This scaffold intentionally stops at foundation work:

- shared layout, theme, typography, and navigation
- typed placeholder content for each route
- a minimal Zustand store for UI state
- a safe client-only React Three Fiber scene on `/explore`

It does not yet include:

- backend or API integrations
- AI guide orchestration
- content management
- real 3D assets or scene streaming
- selfie upload, export, or persistence
