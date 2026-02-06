# HOOTNER HTML → Astro Migration Strategy

## Current State
- **46 HTML files** in `apps/frontend/html-pages/`
- **Bloated code** (dashboard.html = 126K lines)
- **No reusable components**
- **Duplicate code** across files

## Migration Plan

### Phase 1: Parallel Development (Week 1)
**Action:** Build Astro app alongside existing HTML

```bash
# Keep existing
apps/frontend/html-pages/          # OLD (keep running)

# Create new
apps/frontend/astro-app/           # NEW (build here)
```

**Steps:**
1. Run Spark prompt to generate Astro app
2. Test at `http://localhost:3000` (Astro)
3. Keep old HTML at `http://localhost:8080` (if needed)
4. Compare side-by-side

### Phase 2: Port Existing Features (Week 2)
**Action:** Extract working features from bloated HTML

**Priority Pages to Port:**
1. ✅ **dashboard.html** → Already have `dashboard-clean.html` (500 lines)
2. ✅ **upload-video.html** → Has drag-drop, progress bar
3. ✅ **my-videos.html** → Has video grid
4. ✅ **video-player.html** → Has HTML5 player
5. ⚠️ **cinema-player.html** → Special player (keep separate?)
6. ⚠️ **ultra-editor.html** → Complex editor (keep separate?)

**For Each Page:**
```bash
# 1. Read old HTML
cat apps/frontend/html-pages/dashboard.html

# 2. Extract key features (ignore bloat)
# - What API calls does it make?
# - What user interactions exist?
# - What data does it display?

# 3. Create minimal Astro version
# - Use Astro patterns from prompt
# - Reuse components (Nav, Footer, StatCard)
# - Add Alpine.js only for interactivity
```

### Phase 3: Update Routes (Week 3)
**Action:** Point all links to Astro app

**Update in:**
- `package.json` scripts
- `README.md` URLs
- Any backend redirects
- Nginx/proxy configs

```json
// package.json - BEFORE
{
  "scripts": {
    "start:frontend": "cd apps/frontend/html-pages && python -m http.server 8080"
  }
}

// package.json - AFTER
{
  "scripts": {
    "start:frontend": "cd apps/frontend/astro-app && npm run dev"
  }
}
```

### Phase 4: Archive Old HTML (Week 4)
**Action:** Move old files to archive

```bash
# Move old HTML to archive
mv apps/frontend/html-pages apps/frontend/_html-pages-archive

# Keep only these from old:
# - cinema-player.html (if special)
# - ultra-editor.html (if complex)
# - Any custom tools not in Astro yet
```

## File Mapping (Old → New)

| Old HTML | New Astro | Status | Notes |
|----------|-----------|--------|-------|
| dashboard.html | index.astro | ✅ Ready | Use dashboard-clean.html as reference |
| upload-video.html | upload-video.astro | ✅ Ready | Port drag-drop feature |
| my-videos.html | my-videos.astro | ✅ Ready | Port video grid |
| video-player.html | video-player.astro | ✅ Ready | Port HTML5 player |
| analytics.html | analytics.astro | ✅ Ready | Port Chart.js |
| profile.html | profile.astro | ✅ Ready | Port form |
| settings.html | settings.astro | ✅ Ready | Port tabs |
| marketplace.html | marketplace.astro | ✅ Ready | Port grid |
| messages.html | messages.astro | ✅ Ready | Port chat |
| live-stream.html | live-stream.astro | ✅ Ready | Port stream UI |
| collaboration.html | collaboration.astro | ✅ Ready | Port project list |
| ai-video.html | ai-video.astro | ✅ Ready | Port prompt form |
| auto-editor.html | auto-editor.astro | ✅ Ready | Port timeline |
| contact.html | contact.astro | ✅ Ready | Port form |
| login.html | login.astro | ✅ Ready | Port auth |
| cinema-player.html | cinema-player.astro | ⚠️ Later | Complex player |
| ultra-editor.html | ultra-editor.astro | ⚠️ Later | Complex editor |
| admin-session-manager.html | admin/sessions.astro | ⚠️ Later | Admin tool |
| devops-monitoring.html | admin/devops.astro | ⚠️ Later | Admin tool |
| security-command-center.html | admin/security.astro | ⚠️ Later | Admin tool |

## What to Keep from Old HTML

### Extract These Features:
1. **API endpoints** - What URLs are called?
2. **User flows** - What actions can users take?
3. **Data structures** - What JSON is expected?
4. **Interactive features** - Drag-drop, real-time updates, etc.

### Ignore This Bloat:
1. ❌ Inline styles (use Tailwind)
2. ❌ Mock data (fetch from API)
3. ❌ Duplicate code (use components)
4. ❌ Unused features (remove)

## Testing Strategy

### 1. Feature Parity Check
```bash
# For each page, verify:
✅ Loads without errors
✅ API calls work
✅ User interactions work
✅ Mobile responsive
✅ Accessible (ARIA)
```

### 2. Performance Check
```bash
# Old HTML
- dashboard.html: 126KB, 10s load time

# New Astro
- index.astro: 5KB, 0.5s load time
```

### 3. User Acceptance
- Show side-by-side to team
- Get feedback on missing features
- Fix critical issues

## Rollback Plan

If Astro fails:
```bash
# Restore old HTML
mv apps/frontend/_html-pages-archive apps/frontend/html-pages

# Update package.json
npm run start:frontend  # Points back to old HTML
```

## Success Criteria

✅ All 15 core pages working in Astro  
✅ 50x faster load times  
✅ <100 lines per page  
✅ Mobile responsive  
✅ No regressions in features  
✅ Team approves new UI  

## Timeline

- **Week 1:** Generate Astro app with Spark
- **Week 2:** Port features from old HTML
- **Week 3:** Update routes, test thoroughly
- **Week 4:** Archive old HTML, deploy Astro

## Next Steps

1. **Run Spark prompt** to generate Astro app
2. **Test locally** at http://localhost:3000
3. **Compare** with old HTML at http://localhost:8080
4. **Port features** one page at a time
5. **Archive old** when ready

## Commands

```bash
# Generate Astro app
# (Give SPARK_ASTRO_PAGES_PROMPT.md to Spark)

# Run both apps side-by-side
npm run start:frontend:old   # Old HTML on :8080
npm run start:frontend:new   # New Astro on :3000

# When ready, switch
npm run start:frontend       # Points to Astro
```
