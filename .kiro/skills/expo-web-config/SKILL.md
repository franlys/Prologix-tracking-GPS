---
name: expo-web-config
description: Manages Expo web configuration for PWA projects using app.config.js and app.json. Use when working with Expo Router, PWA setup, web manifest, Service Workers, metro bundler config, app.config.js web section, expo export, or when user asks about "PWA not installing", "expo web build", "manifest.json", "app.config web", or "expo web output".
metadata:
  author: Prologix GPS
  version: 1.0.0
---

# Expo Web Config

## Key Concepts

- `app.config.js` takes full precedence over `app.json` when both exist. Expo ignores `app.json` entirely.
- The `web: {}` section in `app.config.js` MUST be fully populated — an empty object causes Expo to skip PWA metadata generation.
- `+html.tsx` (in `app/`) controls the HTML `head` template for Expo Router web builds.
- `public/` directory contents are copied to `dist/` during `expo export -p web`.

## Required `web` Fields for PWA Installability

```js
web: {
  favicon: "./assets/icon.png",
  bundler: "metro",
  output: "single",
  name: "App Name",
  shortName: "Short",
  description: "App description",
  lang: "es",
  themeColor: "#1e3a8a",
  backgroundColor: "#1e3a8a",
  display: "standalone",
  orientation: "portrait",
  startUrl: "/",
  scope: "/"
}
```

## Service Worker Registration in `+html.tsx`

Add inside `<head>` before `{children}`:

```tsx
<script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .catch(function(err) { console.warn('SW registration failed:', err); });
    });
  }
`}} />
```

## PWA Installability Checklist

1. `app.config.js` has complete `web` section (not empty)
2. `public/sw.js` exists with `fetch` event handler
3. SW is registered in `+html.tsx`
4. `vercel.json` excludes `sw.js` from SPA rewrites
5. App is served over HTTPS

## Build & Deploy

```bash
# Build
cd frontend && npm run build
# Produces: dist/ with index.html, manifest.json, sw.js

# Verify
ls dist/sw.js          # must exist
grep "serviceWorker" dist/index.html  # must be present
```

## Common Issues

**SW not registering:** Check that `vercel.json` rewrite source excludes `sw\\.js` in the negative lookahead.

**Icons not showing:** Verify `web.favicon` path in `app.config.js` points to an existing asset. Icons must be 192x192 and 512x512 for full PWA compliance.

**`web: {}` empty:** This is the most common bug — Expo silently skips PWA metadata. Always populate all fields.
