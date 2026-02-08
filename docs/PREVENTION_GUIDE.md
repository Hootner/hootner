# How to Prevent Duplication Going Forward

## ✅ What We've Implemented

### 1. AI Agent Rules (`.amazonq/rules/file-organization.md`)
- Clear rules for where files go
- Single source of truth defined
- Checked by Amazon Q before every action

### 2. Pre-Commit Hook (`.husky/check-duplicates`)
- Runs automatically before every commit
- Blocks commits with duplicates
- Checks file locations

### 3. CI/CD Check (`.github/workflows/check-duplicates.yml`)
- Runs on every PR and push
- Prevents merging code with duplicates
- Automated enforcement

### 4. NPM Script
```bash
npm run check-duplicates  # Run manually anytime
```

---

## 🎯 Rules for Developers

### Rule 1: Single Source of Truth
**ALL HTML pages go in ONE place:**
```
apps/frontend/html-pages/
```

### Rule 2: Check Before Creating
```bash
# Before creating any file, search first:
git ls-files | grep "filename.html"
```

### Rule 3: Use Heptagonal (Not Hexarchy)
- Architecture is `heptagonal/` (9 layers: 0-8)
- Never create `hexarchy/` directory
- This is FINAL

### Rule 4: One AI Agent at a Time
- Use GitHub Copilot OR Amazon Q
- Not both simultaneously
- Prevents coordination issues

### Rule 5: Review AI Code
- Don't blindly accept AI suggestions
- Check for duplicates
- Verify file locations

---

## 🤖 For AI Agents (Copilot, Amazon Q)

### Before Creating ANY File:

1. **Read:** `.amazonq/rules/file-organization.md`
2. **Search:** Check if file already exists
3. **Verify:** Correct location per rules
4. **Ask:** If unsure, ask human first
5. **Never:** Create duplicates

### File Location Quick Reference:

```
HTML pages     → apps/frontend/html-pages/
React components → apps/frontend/src/components/
API routes     → api/routes/
Services       → services/
Scripts        → scripts/
Architecture   → heptagonal/[0-8]-[layer]/
```

### Forbidden Actions:

- ❌ Creating files in `src/frontend/pages/`
- ❌ Creating files in `heptagonal/4-interface/ui/pages/`
- ❌ Creating files in `apps/frontend/public/*.html`
- ❌ Copying files "for convenience"
- ❌ Creating backup copies in repo
- ❌ Renaming architecture directories

---

## 📋 Daily Workflow

### Morning Checklist:
```bash
# Pull latest
git pull

# Check for duplicates
npm run check-duplicates

# If found, run cleanup
node scripts/cleanup-duplicates.js
```

### Before Committing:
```bash
# Pre-commit hook runs automatically, but you can run manually:
node .husky/check-duplicates

# If it fails, fix duplicates before committing
```

### Weekly Maintenance:
```bash
# Run full duplicate scan
node scripts/cleanup-duplicates.js

# Review and consolidate any found
```

---

## 🚨 What to Do If Duplicates Are Found

### Step 1: Identify
```bash
node scripts/cleanup-duplicates.js
```

### Step 2: Compare
```bash
# Compare file sizes and dates
ls -lh apps/frontend/html-pages/file.html
ls -lh src/frontend/pages/file.html
```

### Step 3: Merge
- Keep the version with MORE features
- Usually the NEWEST file
- Copy unique features to primary location

### Step 4: Delete
```bash
# Delete duplicates (keep only apps/frontend/html-pages/)
rm src/frontend/pages/file.html
rm heptagonal/4-interface/ui/pages/file.html
```

### Step 5: Commit
```bash
git add -A
git commit -m "chore: remove duplicate file.html"
```

---

## 🔧 Automated Prevention

### Pre-Commit Hook
- **Location:** `.husky/check-duplicates`
- **Runs:** Before every commit
- **Action:** Blocks commit if duplicates found

### CI/CD Workflow
- **Location:** `.github/workflows/check-duplicates.yml`
- **Runs:** On every PR and push
- **Action:** Fails build if duplicates found

### NPM Scripts
```json
{
  "check-duplicates": "node scripts/cleanup-duplicates.js",
  "fix-duplicates": "node scripts/cleanup-duplicates.js --execute"
}
```

---

## 📊 Monitoring

### Weekly Report
```bash
# Generate duplicate report
node scripts/cleanup-duplicates.js > duplicate-report.txt

# Review and address
```

### Metrics to Track
- Number of duplicate files
- Files in wrong locations
- AI-generated commits with duplicates
- Time spent on cleanup

---

## 🎓 Training for New Developers

### Onboarding Checklist:
- [ ] Read `.amazonq/rules/file-organization.md`
- [ ] Understand single source of truth
- [ ] Know how to check for duplicates
- [ ] Practice with `npm run check-duplicates`
- [ ] Review this prevention guide

### Key Concepts:
1. **One location per file type**
2. **Check before creating**
3. **AI needs oversight**
4. **Automated checks are your friend**

---

## 🔮 Future Improvements

### Phase 1 (Immediate):
- ✅ AI agent rules
- ✅ Pre-commit hook
- ✅ CI/CD check
- ✅ Documentation

### Phase 2 (Next Sprint):
- [ ] Architecture tests
- [ ] Automated file mover
- [ ] VSCode extension for warnings
- [ ] Dashboard for duplicate tracking

### Phase 3 (Future):
- [ ] AI coordination layer
- [ ] Automatic duplicate resolution
- [ ] File location linter
- [ ] Real-time duplicate detection

---

## 📞 Getting Help

### If You're Unsure:
1. Check `.amazonq/rules/file-organization.md`
2. Run `npm run check-duplicates`
3. Ask in team chat
4. Review this guide

### If Duplicates Are Found:
1. Don't panic - it's fixable
2. Run `node scripts/cleanup-duplicates.js`
3. Follow the consolidation plan
4. Commit the cleanup

### If Rules Are Unclear:
1. Open an issue
2. Propose clarification
3. Update documentation
4. Share with team

---

## ✅ Success Criteria

**You're doing it right when:**
- ✅ No duplicate files in repo
- ✅ All files in correct locations
- ✅ Pre-commit hook passes
- ✅ CI/CD checks pass
- ✅ AI agents follow rules
- ✅ Weekly scans show zero duplicates

**Red flags:**
- ❌ Same filename in multiple directories
- ❌ Pre-commit hook failing
- ❌ CI/CD failing on duplicates
- ❌ AI creating files in wrong locations
- ❌ Manual file copying

---

## 📝 Summary

**Prevention = Automation + Rules + Oversight**

1. **Automation:** Pre-commit hooks, CI/CD checks
2. **Rules:** Clear file organization guidelines
3. **Oversight:** Human review of AI code

**The key:** Make it HARDER to create duplicates than to do it right!

---

**Last Updated:** 2026-02-08  
**Status:** Active  
**Owner:** Michael Mastrian
