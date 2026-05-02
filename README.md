# Palace in Motion

**Palace in Motion** is an AI-assisted digital heritage learning platform for exploring the Forbidden City through panoramic place views, guided routes, verified AI explanations, Passport progress, classroom activities, accessibility controls, preservation notes, and a model-ready 3D viewer.

## Competition Pitch

The latest update transforms Palace in Motion from an interactive virtual tour into a more complete heritage education product. It supports tourists, students, teachers, and accessibility-focused users with guided exploration, local-first learning records, source-aware AI help, and responsible tourism content.

The project is designed around four competition strengths:

- **Education:** Classroom Mode, student task sheets, progress reports, quizzes, route seals, and Travel Diary generation turn exploration into a structured learning activity.
- **Accessibility:** A persistent Accessibility and Comfort panel supports larger text, high contrast, reduced motion, simplified content, keyboard focus, and local preference persistence.
- **Preservation awareness:** Each place can surface preservation notes about roof care, painted surfaces, courtyard paving, visitor flow, low-impact tourism, and cultural responsibility.
- **Engagement:** Passport stamps, achievement missions, challenge badges, AI Companion prompts, scene-frame explanations, and Auto Tour controls encourage deeper exploration.

## Core Features

- **Preservation notes in place views:** Palace locations include conservation-aware notes that explain why fragile heritage spaces need care.
- **Integrated Auto Tour panel:** Guided narration appears inside the place view with pause, resume, back, next, voice toggle, and exit controls.
- **Accessibility and Comfort panel:** The global Access control applies comfort preferences across Explore, map, Passport, 3D, Companion, and Classroom.
- **Teacher and Classroom Toolkit:** Teachers can assign a route, generate a student task sheet, review progress, save reports, and print classroom materials.
- **Student task sheet and progress report:** Classroom Mode gives students route goals, quiz prompts, preservation reflection tasks, diary submission guidance, and completion tracking.
- **Achievement missions and challenge badges:** Route completion, quiz success, diary generation, preservation learning, classroom activity, and 3D challenges unlock visible progress.
- **AI Palace Companion:** The Companion supports route questions, place explanations, map commands, quizzes, journey continuation, and multiple explanation styles.
- **AI heritage verification labels:** AI answers are marked as grounded in the local Palace Guide content to reduce unsupported historical claims.
- **Model-ready 3D View:** The 3D viewer includes route overlays, hotspots, layers, lighting, seasons, quality settings, orientation tools, and challenge flow. A real optimized model should be supplied separately at `public/models/forbidden-city.glb`.

## Routes

- `/` - Main panoramic palace experience, onboarding, map, place views, Passport, Auto Tour, and selfie entry points.
- `/companion` - Full AI Palace Companion command center with chat, Passport summary, quizzes, Smart Tour controls, and Travel Diary tools.
- `/classroom` - Local-first teacher toolkit with route assignments, task sheets, progress reports, and achievement tracking.
- `/3d-view` - Model-ready Forbidden City 3D viewer with GLB fallback, hotspots, route overlays, layers, and challenge controls.
- `/explore` - Explore route entry point.
- `/selfie` - Selfie and postcard experience.
- `/tour` - Guided tour route.
- `/api/chat` - Server-side AI guide endpoint with DeepSeek support and local grounded fallback.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- React Three Fiber
- `@react-three/drei`
- Zustand
- Framer Motion

## Project Structure

```text
src/
  app/                 App Router pages, loading states, errors, and API routes
  components/
    layout/            Site shell, navigation, footer, and floating assistant
    preferences/       Theme, language, accessibility, and comfort controls
    ui/                Reusable status screens and presentational primitives
  data/                Palace routes, local guide content, knowledge base, and navigation data
  features/
    companion/         Full AI Palace Companion and shared assistant helpers
    classroom/         Classroom toolkit, assignments, worksheets, and reports
    explore/           Panoramic journey, map, place view, Passport, Auto Tour, and selfie entry
    selfie/            Postcard and souvenir studio
    three-d-view/      GLB-ready 3D viewer, procedural fallback, hotspots, overlays, and challenges
    tour/              Guided tour views
  lib/                 AI guide adapter, diary generation, achievements, constants, and utilities
  store/               Zustand local progress, Passport, classroom, achievements, and preferences
  types/               Shared TypeScript interfaces
```

## 3D Model Handoff

The 3D View is ready to load a real Forbidden City model, but the high-fidelity asset is not bundled in this repository. Add an optimized, licensed GLB file here:

```text
public/models/forbidden-city.glb
```

Recommended asset preparation:

- Use glTF/GLB format.
- Compress geometry with Draco or Meshopt.
- Use web-friendly textures such as KTX2 or WebP.
- Keep mobile polygon and texture budgets reasonable.
- Align model coordinates with the existing hotspot and route overlay configuration.

If the GLB is missing or fails to load, the procedural palace fallback remains available so routes, hotspots, controls, and challenge flow still work.

## AI Guide Configuration

The AI cultural guide uses a server-side route handler at `/api/chat`.

Create a local `.env.local` file if you want to enable DeepSeek:

```bash
DEEPSEEK_API_KEY=your_server_only_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

If `DEEPSEEK_API_KEY` is not set, the guide still works using a conservative local fallback grounded in the Palace Guide content.

## Development

Prerequisites:

- Node.js 22+
- npm 11+

Install dependencies:

```bash
npm install
```

PowerShell fallback:

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
