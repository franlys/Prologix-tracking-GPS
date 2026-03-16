# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - PWA Installability Criteria Fails
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the two concrete failing cases: (a) `app.config.js` has `web: {}` empty, (b) `public/sw.js` does not exist
  - Inspect `frontend/app.config.js` and assert that `expo.web` contains required fields: `name`, `themeColor`, `display`, `startUrl` — this will FAIL because `web: {}` is empty
  - Inspect `frontend/public/sw.js` and assert the file exists with a `fetch` event listener — this will FAIL because the file does not exist
  - Inspect `frontend/app/+html.tsx` and assert it contains `serviceWorker.register` — this will FAIL because registration is missing
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: e.g., "`app.config.js` has `web: {}` empty", "`public/sw.js` does not exist", "`+html.tsx` has no SW registration"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Build Output and Routing Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `npm run build` produces `dist/` with `index.html`, `manifest.json`, and all existing assets on unfixed code
  - Observe: `frontend/vercel.json` rewrite rule currently redirects SPA routes to `index.html` (excluding known static files)
  - Observe: `frontend/app/+html.tsx` already contains `<link rel="manifest">`, `apple-touch-icon`, and `theme-color` meta tags
  - Write property-based test: for any build output, all files that existed before the fix must still exist in `dist/` after the fix
  - Write property-based test: for any URL whose hostname differs from the PWA origin, the SW fetch handler must NOT intercept the request (returns without calling `event.respondWith`)
  - Write property-based test: for any same-origin URL, the SW must attempt network-first and only fall back to cache on failure
  - Verify tests pass on UNFIXED code (the build output and routing are already correct, only installability is broken)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix PWA installability — complete web config, add Service Worker, update routing

  - [x] 3.1 Complete `web: {}` section in `frontend/app.config.js`
    - Replace the empty `web: {}` with the full configuration matching `app.json`
    - Set `name: "Prologix GPS"`, `shortName: "Prologix"`, `themeColor: "#1e3a8a"`, `backgroundColor: "#1e3a8a"`
    - Set `display: "standalone"`, `orientation: "portrait"`, `startUrl: "/"`, `scope: "/"`
    - Set `favicon: "./assets/icon.png"`, `bundler: "metro"`, `output: "single"`
    - Set `lang: "es"`, `description: "Sistema de rastreo GPS en tiempo real para vehículos"`
    - _Bug_Condition: isBugCondition(buildConfig) where buildConfig.expo.web IS_EMPTY_OBJECT_
    - _Expected_Behavior: Expo build generates HTML with correct manifest link, theme-color, and apple-touch-icon_
    - _Preservation: Build output must still produce dist/ with all existing assets_
    - _Requirements: 2.3, 2.4_

  - [x] 3.2 Create `frontend/public/sw.js` with network-first Service Worker
    - Create new file `frontend/public/sw.js`
    - Add `install` event listener that pre-caches `['/', '/index.html', '/manifest.json']` and calls `self.skipWaiting()`
    - Add `activate` event listener that deletes old caches and calls `self.clients.claim()`
    - Add `fetch` event listener with network-first strategy: attempt `fetch(event.request)`, fall back to `caches.match` on failure
    - In the fetch handler, skip interception for cross-origin requests (check `url.hostname !== self.location.hostname`) — this preserves API pass-through
    - _Bug_Condition: isBugCondition(buildConfig) where NOT fileExists('public/sw.js')_
    - _Expected_Behavior: Browser detects SW with fetch handler and considers PWA installable_
    - _Preservation: SW must NOT intercept requests to prologix-tracking-gps-production.up.railway.app_
    - _Requirements: 2.4, 3.3_

  - [x] 3.3 Register Service Worker in `frontend/app/+html.tsx`
    - Add a `<script>` tag inside `<head>` with `dangerouslySetInnerHTML` containing the SW registration snippet
    - Registration snippet: check `'serviceWorker' in navigator`, then on `window.load` call `navigator.serviceWorker.register('/sw.js')`
    - Add `.catch` handler to log registration failures silently (`console.warn`)
    - Place the script tag after the existing meta tags and before `{children}`
    - _Bug_Condition: isBugCondition(buildConfig) where NOT swRegisteredIn('+html.tsx')_
    - _Expected_Behavior: Browser registers sw.js on page load, enabling installability prompt_
    - _Preservation: Existing meta tags (apple-touch-icon, theme-color, manifest link) must remain unchanged_
    - _Requirements: 2.4, 3.2_

  - [x] 3.4 Update `frontend/vercel.json` to exclude `sw.js` from SPA rewrite
    - Locate the `rewrites` rule source pattern in `vercel.json`
    - Add `sw\\.js` to the negative lookahead exclusion list alongside `manifest\\.json`
    - Updated source: `"/((?!manifest\\.json|sw\\.js|icon.*\\.png|favicon\\.png|splash-icon\\.png|adaptive-icon\\.png).*)"`
    - This ensures Vercel serves `sw.js` directly from `dist/` without redirecting to `index.html`
    - _Bug_Condition: Vercel rewrites sw.js to index.html, breaking SW registration_
    - _Expected_Behavior: GET /sw.js returns the Service Worker file with correct Content-Type_
    - _Preservation: All other SPA routes must still rewrite to index.html as before_
    - _Requirements: 2.4, 3.5_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - PWA Installability Criteria Met
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms: `app.config.js` has complete `web` section, `public/sw.js` exists with fetch handler, `+html.tsx` contains SW registration
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.3, 2.4_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Build Output and Routing Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Confirm `dist/` still contains all pre-existing files plus the new `sw.js`
    - Confirm SW does not intercept cross-origin API requests
    - Confirm Vercel rewrite still handles SPA routes correctly
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Run `npm run build` inside `frontend/` and verify `dist/sw.js` exists
  - Verify `dist/index.html` contains `serviceWorker.register('/sw.js')`
  - Verify `dist/index.html` contains `<link rel="manifest">`, `theme-color`, and `apple-touch-icon`
  - Open Chrome DevTools > Application > Service Workers and confirm SW is registered
  - Open Chrome DevTools > Application > Manifest and confirm icons and name are correct
  - Run Lighthouse PWA audit and verify "Installable" category passes
  - Ensure all tests pass, ask the user if questions arise.
