---
name: testing-unified-frontend
description: Test the unified Global Intelligence Platform frontend end-to-end. Use when verifying frontend route rendering, component integration, or UI changes in apps/frontend/.
---

# Testing the Unified Frontend

## Quick Start

```bash
cd apps/frontend
npm ci
npx vite --host
```

The dev server typically starts on port 5173 (or next available port if occupied). Check console output for the actual port.

## No Auth Required

The app uses a demo user fallback when no auth backend is connected:
- `DashboardPage.tsx` creates a demo user with role "admin"
- No login flow needed for testing

## Routes to Test

| Route | Module | Key Components |
|-------|--------|---------------|
| `/dashboard` | video-intelligence | Dashboard, HDRShowcase, DolbyAtmosExperience |
| `/3d` | 3d-visualization | HolographicCanvas (Three.js), Visualization3DModule |
| `/admin` | video-intelligence | AdminPanel, Billing |
| `/analytics` | video-intelligence | Analytics |
| `/heatmap-3d` | cross-module | CrossModulePage (heatmap/spatial toggle) |

## What to Verify

1. **App Shell**: Sidebar renders "HOOTNER" branding, 5 nav items, "v2.0.0 · Hexarchy" footer
2. **Redirect**: Root `/` redirects to `/dashboard`
3. **Active State**: Clicking nav item highlights it with purple/blue background
4. **Tab Switching**: Dashboard has 4 tabs, Admin has 3, Analytics has 3
5. **3D Canvas**: `/3d` route lazy-loads Three.js and renders a rotating 3D object with particles
6. **Cross-Module Toggle**: `/heatmap-3d` switches between "3D Engagement Heatmap" and "Unified Dolby Atmos Experience"

## Build Verification

```bash
npm run typecheck  # Should report 0 errors
npm run lint       # Should report 0 errors (warnings OK)
npm run build      # Should produce dist/ in ~6-7s
```

## Known Quirks

- Ports 3000/3001 might be occupied; Vite auto-picks the next available port
- The 3D visualization page (`/3d`) uses `React.lazy()` — there's a brief "Loading 3D Visualization..." flash
- Some components use `// @ts-nocheck` due to Three.js type narrowing and ported code from external repos
- The `usePlatformKV` hook will log GraphQL errors to console since no backend is running — this is expected in local dev

## Devin Secrets Needed

None required for local frontend testing. The app works without a backend connection (falls back to demo data and localStorage).
