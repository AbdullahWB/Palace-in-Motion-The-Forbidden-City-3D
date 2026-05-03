# 3. Feedback and Recommended Improvements

The current version of **Palace in Motion** already performs strongly as a digital heritage learning platform. It combines panoramic exploration, guided routes, Passport progress, AI-assisted explanations, preservation notes, classroom activities, accessibility tools, and a model-ready 3D viewer. The README also clearly positions the project around education, accessibility, preservation awareness, and engagement, which are strong competition-focused categories.

To make the platform more complete, scalable, and production-ready, the next stage should focus on improving the 3D experience, cleaning up large components, strengthening accessibility, expanding classroom tools, deepening gamification, and adding stronger deployment safeguards.

## 3.1 Complete the 3D View

The 3D View is one of the most promising parts of the project because it can turn the Forbidden City experience from a flat visual tour into an immersive spatial learning environment. At the moment, the project is already prepared for a real model, but the high-fidelity GLB file is not bundled. The README specifically says that the optimized model should be placed at `public/models/forbidden-city.glb`, and that the current procedural fallback keeps routes, hotspots, controls, and challenge flow working when the model is missing.

### Add a Real GLB Model

The first major improvement should be to add a properly licensed, optimized Forbidden City GLB model. This model should not just be visually attractive; it should be technically prepared for web performance. The model should use compressed geometry through Draco or Meshopt, and textures should be converted to lightweight formats such as WebP or KTX2. This will help the 3D view load faster, especially on mobile devices and lower-end laptops.

The model should also be aligned with the existing hotspot and route overlay system. This is important because the current 3D viewer already includes route overlays, hotspots, layers, lighting modes, seasonal settings, quality controls, camera presets, and challenge flow. The `three-d-view-shell.tsx` file shows that the viewer is already built around a configurable model, camera presets, route overlays, hotspots, lighting modes, season modes, quality modes, and challenge completion logic.

A strong implementation plan would include:

1. Add the optimized file as `public/models/forbidden-city.glb`.
2. Test the model in low, medium, and high quality modes.
3. Check that the model scale matches the existing route lines and hotspot positions.
4. Confirm that fallback mode still works if the model fails to load.
5. Add a loading progress indicator and model error message for users on slow networks.
6. Document the model source, license, polygon count, texture sizes, and compression method.

This improvement will make the 3D view feel like a finished feature rather than a model-ready placeholder.

### Add Hotspot Calibration Tools

A developer calibration mode would make the 3D viewer easier to maintain. At the moment, hotspot positions and route overlay points likely need to be adjusted manually in code. Instead, a calibration mode could allow the developer to click on the 3D scene, capture coordinates, and export updated hotspot positions.

This tool could include:

- A developer mode toggle hidden behind a query parameter such as `?debug3d=true`.
- Click-to-place hotspot coordinates.
- Live display of `x`, `y`, and `z` values.
- Buttons to copy the selected coordinate.
- A preview of label placement.
- A route-line editing mode for adjusting path points.

This would make future improvements much faster because hotspots would not need to be guessed by trial and error.

### Add Animated Fly-Through Routes

The 3D View should also include animated fly-through paths. Instead of only jumping from one hotspot to another, the camera could smoothly move along the selected route. For example, the Ceremonial Axis route could begin with a wide overview, move through major gates, pause at important halls, and end with a short reflection.

The fly-through system should include:

- Start, pause, resume, skip, and restart controls.
- Speed options such as slow, normal, and fast.
- Route-specific camera paths.
- Short narration or captions at each stop.
- A progress indicator showing the current stop.
- Reduced-motion fallback for accessibility.

This would make the 3D section more cinematic and educational. It would also connect well with the existing Auto Tour and AI Companion features.

## 3.2 Refactor Large Components

The project currently has a strong feature set, but some parts of the codebase appear to be handling too many responsibilities in one place. The README already separates the intended structure into feature areas such as `explore`, `companion`, `classroom`, `selfie`, `three-d-view`, `tour`, `store`, and `lib`, which is a good foundation for modular design.

### Split `panorama-experience.tsx`

The `panorama-experience.tsx` file is responsible for many important features: the welcome screen, palace map, route selection, place view, Passport drawer, Auto Tour, scene frames, selfie modal, travel diary, accessibility behavior, query-state navigation, and progress updates. This makes the file powerful, but also difficult to maintain and test.

A better structure would be to split it into smaller feature components:

- `WelcomePanel.tsx` handles the landing page, onboarding cards, language/theme buttons, and entry buttons.
- `PalaceMapView.tsx` handles map rendering, marker clicks, zooming, route highlighting, and route selection.
- `PlaceView.tsx` handles active place display, image background, scene frames, active frame, and preservation notes.
- `PlaceInfoPanel.tsx` should stay focused on place text, preservation notes, and source labels.
- `AutoTourControls.tsx` handles narration state, pause/resume, back/next, voice toggle, and exit.
- `PassportDrawer.tsx` handles visited places, route seals, quiz stamps, challenge badges, and reset actions.
- `TravelDiaryPanel.tsx` handles diary text generation, copy, print, regenerate, and export behavior.
- `SelfieEntryModal.tsx` handles opening the selfie/postcard feature from the place view.

This refactor would make the code easier to understand. It would also make testing easier because each feature can be tested independently.

### Centralize Route Helpers

The project has several connected routes: `/`, `/companion`, `/classroom`, `/3d-view`, `/explore`, `/selfie`, `/tour`, and `/api/chat`. The README documents these routes clearly.

To reduce navigation bugs, route paths and query parameters should be managed from one shared helper file, such as:

```text
src/lib/app-routes.ts
```

This file should define all route paths, query keys, and helper functions for generating URLs. For example, instead of manually writing different query strings across the app, the project could use functions like:

```ts
getPlaceUrl(placeSlug, photoId, routeId)
getMapUrl(routeId)
getCompanionUrl(promptMode)
getClassroomUrl(routeId)
getThreeDRouteUrl(routeId)
```

This would prevent inconsistent navigation between the map, Companion, Classroom, and 3D pages.

## 3.3 Extend Accessibility and Multi-Language Support

Accessibility is already one of the strongest parts of the project. The README says the platform includes a persistent Accessibility and Comfort panel with larger text, high contrast, reduced motion, simplified content, keyboard focus, and local preference persistence.

The next improvement should be to make accessibility more complete across every feature.

### Improve Global Accessibility Behavior

Comfort settings should work consistently on all major pages:

- Main Explore page
- Palace Map
- Passport drawer
- Place view
- Selfie modal
- AI Companion
- Classroom Mode
- 3D View

Important improvements include:

- Add proper ARIA labels to all icon-only buttons.
- Add `aria-live` regions for Auto Tour narration and loading states.
- Add focus traps inside modals such as Passport, Selfie, and 3D challenge dialogs.
- Make `Escape` close all major overlays.
- Ensure keyboard users can access map markers, route cards, scene frames, and 3D hotspots.
- Ensure focus does not disappear behind overlays.
- Make reduced-motion mode disable camera fly-through animation, large background movement, and unnecessary transitions.
- Add captions or transcript text for all voice narration.

These improvements would make the project more inclusive and competition-ready.

### Expand Multi-Language Support

The current English and Chinese support is already appropriate for a Forbidden City project. The next step would be to build a scalable translation system so that more languages can be added without rewriting components.

Possible additions include:

- Arabic
- Urdu
- French
- Spanish
- Japanese
- Korean

Each language should cover:

- Navigation labels
- Place descriptions
- Preservation notes
- AI Companion prompt modes
- Passport labels
- Classroom worksheets
- 3D hotspot annotations
- Auto Tour narration captions

For accessibility, the project could also add sign-language video summaries for major routes or at least captioned narration for every Auto Tour stop. This would make the platform more useful for museums, classrooms, and international audiences.

## 3.4 Teacher and Classroom Enhancements

Classroom Mode is already a strong feature because it turns the project into an educational toolkit. The README states that teachers can assign routes, generate task sheets, review progress, save reports, and print classroom materials. It also says that Classroom Mode includes route goals, quiz prompts, preservation reflection tasks, diary submission guidance, and completion tracking.

The next stage should make Classroom Mode more practical for real teachers.

### Add Downloadable Resources

Teachers should be able to download materials in simple formats. At minimum, the platform should support:

- Download worksheet as `.txt`
- Download worksheet as `.pdf`
- Download class report as `.txt`
- Download class report as `.pdf`
- Download answer key
- Download student checklist

A strong classroom export package could include:

1. Student task sheet
2. Route overview
3. Learning goals
4. Stop-by-stop questions
5. Preservation reflection prompt
6. Travel Diary submission instructions
7. Teacher answer key
8. Progress report template

This would make the platform easier to use in real lessons because teachers could print or share the materials with students directly.

### Add Offline and Backup Options

The project is local-first, so it should also support offline-friendly classroom use. Teachers should be able to export the current classroom state and import it later.

Useful backup features include:

- Export classroom assignment as JSON.
- Export student progress as JSON.
- Import saved classroom session.
- Reset only classroom data without resetting all visitor progress.
- Save multiple assignments locally.
- Add a demo classroom data option for presentations.

This would be helpful when teachers use the platform in classrooms where internet access is unstable.

## 3.5 Gamification and Badges

Gamification is already present through Passport stamps, route seals, achievement missions, challenge badges, quizzes, Travel Diary generation, and 3D challenges. The README identifies this as one of the platform's main engagement strengths.

The next improvement should make the badge system feel deeper and more meaningful.

### Expand Mission Variety

New missions could be grouped into several categories.

**Exploration missions**

- Visit all 10 palace places.
- Complete one route.
- Complete all routes.
- View every scene frame in one route.
- Return to a previously visited place and compare frames.

**Preservation missions**

- Read five preservation notes.
- Write one visitor-care action in the Travel Diary.
- Identify one preservation risk, such as visitor flow or painted-surface wear.
- Complete a low-impact tourism reflection.

**Quiz missions**

- Answer one quiz correctly.
- Answer five quiz questions correctly.
- Earn all 10 quiz stamps.
- Complete a route quiz without mistakes.

**3D missions**

- Select three roof hotspots.
- Follow one route overlay in the 3D view.
- Complete the 3D challenge.
- Compare the map route with the 3D route.

**Classroom missions**

- Complete a student task sheet.
- Submit a Travel Diary.
- Finish a classroom assignment.
- Unlock a teacher-reviewed badge.

### Add Hidden Easter Eggs

The platform could include small hidden discoveries to make exploration more exciting. For example:

- A hidden Roof Detail Finder badge.
- A Quiet Garden Observer badge.
- A Threshold Explorer badge for visiting several gates.
- A Preservation Guardian badge after reading conservation notes.
- A Scholar of the Axis badge after completing the Ceremonial Axis route and quiz.

These additions would encourage users to explore more deeply instead of rushing through the route.

### Add Leaderboard or Class Progress Board

For classroom or competition use, a local leaderboard could show:

- Total places visited
- Quiz score
- Badges earned
- Routes completed
- Diary submitted or not submitted
- 3D challenge completed or pending

This should remain local-first and privacy-friendly. It does not need accounts or a database. A teacher could export the results as a local report.

## 3.6 Security and CI Improvements

The project already includes useful quality scripts. `package.json` defines commands for development, build, linting, type checking, Vitest tests, Playwright E2E tests, bundle analysis, and a full `check` command that runs lint, typecheck, tests, and build together.

The next step is to connect these checks to deployment and strengthen the production configuration.

### Add HTTP Security Headers and Caching

The current `next.config.ts` is very small and mainly configures remote image loading from `images.pexels.com`. This is a good starting point, but production deployment should add security headers and caching rules.

Recommended headers include:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` to restrict camera, microphone, geolocation, and other browser permissions
- `Content-Security-Policy` to control allowed scripts, images, fonts, models, and API connections
- `Strict-Transport-Security` for HTTPS-only behavior

Because the project uses a selfie/camera feature, the `Permissions-Policy` should be carefully designed. Camera access should be allowed only when needed and should not be broadly enabled for third-party origins.

Static assets such as images, GLB models, thumbnails, and textures should also have caching rules. For example:

- Long cache lifetime for versioned static assets.
- Separate caching rules for large 3D models.
- Optimized delivery for image and video assets.
- Proper fallback behavior if the GLB fails to load.

### Configure Continuous Integration

A GitHub Actions workflow should run automatically on every push and pull request. The CI workflow should run:

1. `npm install`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`
6. `npm run e2e`

Since the project already has these scripts defined, CI can be added without major code changes.

A strong CI setup would catch:

- TypeScript errors
- Broken imports
- Failing unit tests
- Broken route navigation
- Build failures
- Playwright E2E regressions
- Accessibility issues in important pages

This will make the project safer to update, especially as more features are added.

## Overall Priority Order

The recommended improvements should be handled in this order:

1. **Complete the 3D model integration** because it will create the biggest visual and competition impact.
2. **Refactor large components** so the project becomes easier to maintain.
3. **Improve accessibility and keyboard support** because the project already promotes accessibility as a core strength.
4. **Expand classroom exports and reports** so the education use case becomes more practical.
5. **Add more badges and missions** to increase engagement.
6. **Add production security headers and CI** to make the project safer and more professional.

Together, these improvements would make **Palace in Motion** feel like a polished, production-ready digital heritage platform rather than only a student demo.
