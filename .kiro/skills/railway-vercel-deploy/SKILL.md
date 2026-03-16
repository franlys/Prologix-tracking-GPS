---
name: railway-vercel-deploy
description: Manages deployment configuration for this project — Railway for NestJS backend and Vercel for Expo PWA frontend. Use when working with environment variables, build commands, deploy config, nixpacks, vercel.json rewrites, Railway services, production URLs, or when user asks about "deploy", "production build", "env vars", "Railway config", "Vercel config", or "CI/CD".
metadata:
  author: Prologix GPS
  version: 1.0.0
---

# Railway + Vercel Deploy

## Project Structure

- Backend: NestJS → deployed on **Railway**
- Frontend: Expo PWA → deployed on **Vercel**

## Backend (Railway)

Config files: `backend/railway.json`, `backend/nixpacks.toml`

### Build & Start

```toml
# nixpacks.toml
[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node dist/main"
```

### Required Environment Variables

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
TRACCAR_URL=https://...
TRACCAR_USER=...
TRACCAR_PASSWORD=...
NODE_ENV=production
PORT=3000
```

### Production URL

`https://prologix-tracking-gps-production.up.railway.app`

## Frontend (Vercel)

Config file: `frontend/vercel.json`

### SPA Rewrite Rule

All routes must rewrite to `index.html` EXCEPT static assets:

```json
{
  "rewrites": [
    {
      "source": "/((?!manifest\\.json|sw\\.js|icon.*\\.png|favicon\\.png|splash-icon\\.png|adaptive-icon\\.png).*)",
      "destination": "/index.html"
    }
  ]
}
```

CRITICAL: `sw.js` MUST be excluded from the rewrite or the Service Worker will return `index.html` instead of the SW script, breaking PWA installability.

### Build Command

```bash
cd frontend && npm run build
# Runs: expo export -p web && node copy-public.js
```

### Required Environment Variables

```
EXPO_PUBLIC_API_URL=https://prologix-tracking-gps-production.up.railway.app
```

## Common Issues

**SW returns HTML instead of JS:** `sw.js` is missing from the Vercel rewrite exclusion list. Add `sw\\.js` to the negative lookahead.

**API calls fail in production:** Check `EXPO_PUBLIC_API_URL` is set in Vercel environment variables.

**Build fails on Railway:** Check `nixpacks.toml` build phase and ensure `dist/` is not in `.gitignore`.
