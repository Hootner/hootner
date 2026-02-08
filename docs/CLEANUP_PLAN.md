# HOOTNER Duplicate Cleanup Plan

**Status:** 🚨 CRITICAL - Multiple architecture conflicts and 3-5x file duplication detected

**Created:** 2026-02-07  
**Estimated Time:** 4-6 hours  
**Risk Level:** Medium (requires careful testing)

---

## 🔍 Issues Identified

### 1. Architecture Naming Conflict
- **Problem:** Documentation references `hexarchy/` but actual code is in `heptagonal/`
- **Impact:** Broken references in Copilot instructions, README, and 75+ agent orchestration
- **Files Affected:** 
  - `.github/copilot-instructions.md` (4 broken references)
  - `README.md`
  - `docs/` (multiple files)

### 2. Frontend Page Duplication (3-5x)
- **Problem:** Same HTML pages exist in 4 different locations
- **Impact:** Confusion about which version is canonical, wasted storage
- **Locations:**
  1. `apps/frontend/html-pages/` ✅ PRIMARY (40+ files)
  2. `apps/frontend/public/` ❌ DUPLICATE (7 files)
  3. `src/frontend/pages/` ❌ DUPLICATE (30+ files)
  4. `heptagonal/4-interface/ui/pages/` ❌ DUPLICATE (20+ files)
  5. `apps/frontend/html-pages/_archive/` ❌ OLD BACKUPS

**Duplicate Files:**
- dashboard.html (4 copies)
- login.html (5 copies)
- video-player.html (4 copies)
- marketplace.html (3 copies)
- settings.html (4 copies)
- And 30+ more...

### 3. AI Agent Duplication (2x)
- **Problem:** Dual-agent orchestrator exists in two places
- **Impact:** Unclear which version is active
- **Locations:**
  1. `heptagonal/2-intelligence/ai-services/agents/` ✅ PRIMARY
  2. `frameworks/ai/agents/` ❌ DUPLICATE

### 4. Event Bus Duplication (2x)
- **Problem:** Two event-bus.js files in same architecture
- **Locations:**
  1. `heptagonal/0-core/orchestration/event-bus.js` ✅ PRIMARY
  2. `heptagonal/0-core/realtime/event-bus.js` ❌ DUPLICATE (or different purpose?)

### 5. Broken Symlinks
- `_tooling/codegpt` ❌
- `_tooling/kiro` ❌
- `_tooling/pm2` ❌

### 6. Connection Code Duplication
- DynamoDB: 31 references in single file
- GraphQL: 98 references in single file
- S3: 43 references in single file

---

## 📋 Cleanup Phases

### Phase 1: Remove Archive Backups ⚡ SAFE
**Time:** 5 minutes  
**Risk:** Low (just old backups)

```bash
# Delete old backups
rm -rf apps/frontend/html-pages/_archive
```

**Expected Result:** ~500KB freed, no functional impact

---

### Phase 2: Consolidate Frontend Pages ⚠️ REQUIRES TESTING
**Time:** 2 hours  
**Risk:** Medium (need to verify which version is latest)

**Strategy:**
1. Compare file timestamps and content
2. Keep `apps/frontend/html-pages/` as PRIMARY
3. Move any unique files from other locations to PRIMARY
4. Delete duplicate directories
5. Update server.js references

**Steps:**
```bash
# 1. Analyze differences
node scripts/cleanup-duplicates.js

# 2. Manually review each duplicate
# 3. Copy any unique features to PRIMARY location
# 4. Delete duplicates:
rm -rf apps/frontend/public/*.html
rm -rf src/frontend/pages/*.html
rm -rf heptagonal/4-interface/ui/pages/*.html

# 5. Update references in:
# - scripts/servers/*.js
# - index.js
# - package.json scripts
```

**Files to Update:**
- `scripts/servers/serve-html.js`
- `scripts/servers/frontend-server.js`
- `index.js`

---

### Phase 3: Fix Architecture References 📝 DOCUMENTATION ONLY
**Time:** 1 hour  
**Risk:** Low (documentation only)

**Find and Replace:**
- `hexarchy/` → `heptagonal/` (in documentation only)
- Verify actual code uses correct paths

**Files to Update:**
1. `.github/copilot-instructions.md`
   - Line 7: `hexarchy/` → `heptagonal/`
   - Line 11: `hexarchy/2-intelligence/` → `heptagonal/2-intelligence/`
   - Line 12: `hexarchy/0-core/` → `heptagonal/0-core/`
   - Line 19: "Hexarchy Pattern" → "Heptagonal Pattern"
   - Line 40: `hexarchy/` → `heptagonal/`

2. `README.md`
   - Update architecture references
   - Fix layer count (9 layers, not 8)

3. `docs/` files
   - Search for "hexarchy" references
   - Update to "heptagonal"

---

### Phase 4: Consolidate AI Agents ⚠️ REQUIRES CODE REVIEW
**Time:** 1 hour  
**Risk:** Medium (active code)

**Strategy:**
1. Compare `frameworks/ai/agents/` vs `heptagonal/2-intelligence/ai-services/agents/`
2. Determine which is canonical (likely heptagonal)
3. Update imports across codebase
4. Delete duplicate

**Steps:**
```bash
# 1. Find all imports
grep -r "frameworks/ai/agents" . --exclude-dir=node_modules

# 2. Update imports to use heptagonal path
# 3. Delete frameworks/ai/agents/ (or keep as symlink?)
```

---

### Phase 5: Investigate Event Bus Duplication 🔍 NEEDS ANALYSIS
**Time:** 30 minutes  
**Risk:** Low (investigation only)

**Questions:**
- Are these two different event buses?
- Is `realtime/event-bus.js` for WebSocket events?
- Is `orchestration/event-bus.js` for service orchestration?

**Action:** Review both files to determine if they serve different purposes

---

### Phase 6: Remove Broken Symlinks ⚡ SAFE
**Time:** 5 minutes  
**Risk:** Low (already broken)

```bash
rm -rf _tooling/codegpt
rm -rf _tooling/kiro
rm -rf _tooling/pm2
```

---

### Phase 7: Refactor Connection Code 🔧 OPTIONAL
**Time:** 2 hours  
**Risk:** Medium (requires testing)

**Strategy:**
- Create shared connection utilities
- Replace duplicate connection code
- Consolidate into `heptagonal/0-core/aws/`

**Defer to future sprint** - not critical for immediate cleanup

---

## 🎯 Execution Order

### Immediate (Today)
1. ✅ Phase 1: Remove archives (5 min)
2. ✅ Phase 6: Remove broken symlinks (5 min)
3. ✅ Phase 3: Fix documentation (1 hour)

### Next Session (Tomorrow)
4. ⚠️ Phase 5: Investigate event bus (30 min)
5. ⚠️ Phase 2: Consolidate frontend (2 hours)
6. ⚠️ Phase 4: Consolidate agents (1 hour)

### Future Sprint
7. 🔧 Phase 7: Refactor connections (optional)

---

## ✅ Testing Checklist

After each phase:
- [ ] Run `npm test`
- [ ] Run `npm run lint:fix`
- [ ] Start platform: `npm run start:all`
- [ ] Verify frontend loads: http://localhost:3000
- [ ] Verify HTML pages: http://localhost:3001
- [ ] Check agent status: `npm run agents:status`
- [ ] Test dual-agent: `npm run dual-agent:status`
- [ ] Commit changes with descriptive message

---

## 📊 Expected Results

**Before Cleanup:**
- 1,531 source files
- 135 HTML files (many duplicated)
- 26 server.js files
- Broken documentation references
- Confusion about canonical architecture

**After Cleanup:**
- ~1,200 source files (300 fewer)
- ~50 unique HTML files (85 duplicates removed)
- Clear architecture (heptagonal only)
- Fixed documentation
- Single source of truth for each component

**Space Savings:** ~2-3 MB

---

## 🚨 Rollback Plan

If issues occur:
1. Git revert to previous commit
2. Restore from backup (if created)
3. Review specific phase that caused issue
4. Fix and retry

---

## 📝 Notes

- **DO NOT** delete `hexarchy/` directory yet - may contain unique code
- **DO** verify each duplicate before deletion
- **DO** update imports after moving files
- **DO** commit after each phase
- **DO** run tests after each phase

---

## 🔗 Related Files

- Cleanup script: `scripts/cleanup-duplicates.js`
- Duplicate finder: `tools/find-duplicates.js`
- Architecture docs: `docs/ARCHITECTURE.md`

---

**Next Steps:** Run `node scripts/cleanup-duplicates.js` to see detailed analysis
