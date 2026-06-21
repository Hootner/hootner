---
name: testing-unified-frontend
description: Test the unified Global Intelligence Platform frontend end-to-end. Use when verifying new routes, component integrations, or UI features in apps/frontend/.
---

# Testing the Unified Frontend

## Quick Start

```bash
cd apps/frontend
npm run dev  # starts at http://localhost:3002/
```

## Routes to Test

| Route | Module | Key Components |
|-------|--------|---------------|
| `/dashboard` | video-intelligence | Dashboard, HDRShowcase, VideoPlayer |
| `/social` | video-intelligence | SocialFeed (auto-populates ~50 posts) |
| `/generate` | standalone | AIGeneratorPage (Bedrock SDXL simulation) |
| `/3d` | 3d-visualization | HolographicCanvas (Three.js) |
| `/analytics` | video-intelligence | Analytics charts |
| `/admin` | video-intelligence | AdminPanel |
| `/heatmap-3d` | cross-module | 3D heatmap + spatial audio |

## Known Issues & Workarounds

- **No backend available**: All hooks (`usePlatformKV`, `useBedrockSDXL`, `useAgentAI`) have simulation/fallback modes. The frontend works fully offline with demo data.
- **usePlatformKV race condition** (fixed in commit 55abaa8): If posts don't appear on `/social`, check that the `catch` block in `usePlatformKV.ts` is NOT resetting state to `defaultValue` on network failure.
- **AI Generator uses placeholder images**: Without real Bedrock credentials, the SDXL hook simulates generation with a ~4s progress animation and returns an Unsplash placeholder.

## Testing Checklist

### Social Feed (`/social`)
1. Navigate to `/social` — posts should auto-populate (10+ visible)
2. Each post has: avatar, username, badges (Trending/AI/Verified), timestamp, content, hashtags
3. Like button: click heart → fills red, count increments by 1
4. Trending Topics sidebar shows 5 ranked topics with percentages
5. Suggested Creators panel with Follow buttons

### AI Generator (`/generate`)
1. Page shows "AI Video & Image Generator" heading + "Bedrock SDXL 1.0" badge
2. Form has: Prompt (required), Negative Prompt, Visual Style dropdown (8 styles), Resolution dropdown (6 presets)
3. Advanced Settings: Inference Steps slider (20-100, default 50), CFG Scale slider (1-20, default 7.5), Seed input
4. Generate button is disabled when prompt is empty, enabled when text entered
5. Click Generate → button shows "Generating with Bedrock SDXL...", progress bar animates, toast appears
6. After ~4s → "Generated Gallery" section appears, stats show "Generated 1"

## Build Verification

```bash
npx tsc --noEmit          # 0 errors expected
npm run lint              # 0 errors expected  
npx vite build            # builds in ~7s
```

## Devin Secrets Needed

None required for local testing (all hooks have offline fallbacks). For real Bedrock generation, AWS credentials would be needed but are not required for UI testing.
