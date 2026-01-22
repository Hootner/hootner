# Git Integrity & Health Monitoring

Post-cleanup monitoring and enforcement to prevent large files from creeping back into repository history.

## 🔍 Overview

The Git integrity system consists of:
1. **Pre-commit integrity check** – Blocks commits with files > 10 MB
2. **Git health monitor** – Tracks repository metrics and trends
3. **Git LFS configuration** – Automatically tracks large file types
4. **Automated enforcement** – Integrates with git hooks

## 📋 Commands

### Integrity Checks

```bash
# Run integrity report (full analysis)
npm run git:integrity:report

# Pre-commit check (faster, blocks on violations)
npm run git:integrity:check
```

**Output:**
- ✅ **PASS** – No violations, safe to commit
- ❌ **FAIL** – Large files detected, commit blocked
- ⚠️ **WARNING** – Files approaching limit

### Health Monitoring

```bash
# Current health snapshot
npm run git:health:monitor

# View historical metrics (last 30 days)
npm run git:health:history

# Save metrics snapshot to history
npm run git:health:save
```

**Metrics Tracked:**
- .git directory size
- Total commits
- Uncommitted files
- Staged files
- LFS configuration status
- Large files (>5 MB) detected

## 🚫 Enforcement

### Pre-Commit Hook

Automatically runs before each commit (via `.husky/pre-commit-integrity`):

```bash
# Simulates what happens on commit
npm run git:integrity:check
```

**If violations detected:**
```
❌ Commit blocked: Large files detected
  src/models/checkpoint.pt: 15.50 MB (max: 10 MB)
  Run: npm run git:integrity:report
```

### Configuration

Edit file size limits in `scripts/git-integrity-check.js`:

```javascript
const CONFIG = {
  maxFileSize: 10 * 1024 * 1024,        // 10 MB max per file
  maxCommitSize: 50 * 1024 * 1024,      // 50 MB max per commit
  warningThreshold: 5 * 1024 * 1024,    // Warn at 5 MB
};
```

## 🔐 Git LFS Configuration

Large file patterns tracked in `.gitattributes`:

```
*.pt  filter=lfs diff=lfs merge=lfs -text      # PyTorch models
*.pth filter=lfs diff=lfs merge=lfs -text      # PyTorch checkpoints
*.h5  filter=lfs diff=lfs merge=lfs -text      # Keras models
*.pkl filter=lfs diff=lfs merge=lfs -text      # Pickled objects
*.model filter=lfs diff=lfs merge=lfs -text    # Generic models
*.exe filter=lfs diff=lfs merge=lfs -text      # Executables
*.zip filter=lfs diff=lfs merge=lfs -text      # Archives
*.mp4 filter=lfs diff=lfs merge=lfs -text      # Videos
```

### Adding New LFS Patterns

```bash
# 1. Update .gitattributes
echo "*.whl filter=lfs diff=lfs merge=lfs -text" >> .gitattributes

# 2. Commit
git add .gitattributes
git commit -m "chore: add .whl to LFS tracking"

# 3. Migrate existing large files (optional)
git lfs migrate import --include="*.whl" --everything
```

## 📊 Health Metrics

### Status Indicators

| Status | Condition | Action |
|--------|-----------|--------|
| 🟢 HEALTHY | All checks pass | Continue normal work |
| 🟡 WARNING | Git size > 100 MB or LFS not configured | Monitor, consider cleanup |
| 🔴 CRITICAL | Git size > 500 MB | Run filter-repo to clean history |

### Metrics File

Health snapshots saved to `.git-health-metrics.json`:

```json
{
  "timestamp": "2026-01-22T20:57:16.000Z",
  "checks": {
    "gitSize": "8.8M",
    "totalCommits": 68,
    "uncommittedFiles": 5,
    "stagedFiles": 0,
    "lfsEnabled": true,
    "lfsPatterns": 10,
    "largeFiles": 0
  }
}
```

## 🔄 Workflow

### Before Committing

```bash
# 1. Stage your changes
git add .

# 2. Check integrity
npm run git:integrity:report

# 3. If OK, commit
git commit -m "feat: description"

# 4. Monitor health periodically
npm run git:health:monitor
```

### Resolving Violations

**Issue:** Large file blocks commit

```bash
# 1. See what's being committed
npm run git:integrity:report

# 2. Remove/exclude the large file
git reset HEAD large-file.zip

# 3. Add it to .gitignore or use LFS
echo "*.zip" >> .gitignore

# 4. Try commit again
git commit -m "feat: description"
```

**Issue:** Need to commit a large file

```bash
# 1. Add type to .gitattributes
echo "*.model filter=lfs diff=lfs merge=lfs -text" >> .gitattributes

# 2. Commit .gitattributes first
git add .gitattributes
git commit -m "chore: track .model files with LFS"

# 3. Now commit the large file
git add large-model.model
git commit -m "feat: add ML model"
```

## 📈 Monitoring Best Practices

### Daily/Weekly

```bash
# Check repository health
npm run git:health:monitor

# Review uncommitted changes
git status
```

### Monthly

```bash
# Save metrics snapshot
npm run git:health:save

# Review historical trend
npm run git:health:history

# If warning status, consider maintenance
```

### When Needed

```bash
# Detailed integrity audit
npm run git:integrity:report

# Check for violations before release
npm run git:integrity:check
```

## 🛠️ Troubleshooting

### Pre-commit hook not running

**Problem:** Commits succeed despite large files

```bash
# Re-install git hooks
npm install

# Manually verify
npm run git:integrity:check
```

### False positives in working directory scan

**Issue:** Legitimate large files flagged

**Solution:** Add exclusion patterns:

```bash
# Edit scripts/git-integrity-check.js
CONFIG.excludePatterns = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.venv/**',
  'my-large-asset/**'  // Add your folder
];
```

### Git size still growing

**Problem:** Repository getting large despite enforcement

```bash
# Find what's using space
du -sh .git

# Find large objects
git rev-list --objects --all | git cat-file --batch-check | sort -k3 -n | tail -10

# If needed, aggressive cleanup
git gc --aggressive --prune=now
```

## 📚 Related Files

- [scripts/git-integrity-check.js](../scripts/git-integrity-check.js) – Integrity enforcement
- [scripts/git-health-monitor.js](../scripts/git-health-monitor.js) – Health monitoring
- [.gitattributes](.gitattributes) – LFS configuration
- [.gitignore](.gitignore) – Ignored files/directories
- [.husky/pre-commit-integrity](.husky/pre-commit-integrity) – Pre-commit hook

## 🎯 Summary

✅ **Post-Cleanup Protection:**
- Prevents files > 10 MB from being committed
- Automatically tracks known large file types via LFS
- Monitors repository health continuously
- Enforces standards via git hooks

✅ **Metrics:**
- Before cleanup: 2,171 MB total, 703 MB .git
- After cleanup: ~10 MB .git (98.75% reduction)
- **Status:** 🟢 HEALTHY and protected

---

**Date:** January 22, 2026  
**Status:** Ready for production
