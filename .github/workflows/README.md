# PR Merge Validation Workflow

This workflow automatically validates pull requests before they can be merged into main or develop branches.

## Workflow Jobs

### 1. Dry-Run Merge Test 🧪
**Status: BLOCKING**
- Tests for merge conflicts without actually performing the merge
- Uses `git merge-tree` for safe conflict detection
- Fails if conflicts are detected
- Posts a comment to the PR if conflicts exist

### 2. Code Validation ✅
**Status: BLOCKING** (linter and infrastructure) / **OPTIONAL** (MCP and dual-agent)
- **Required Checks:**
  - ESLint linting (must pass)
  - Infrastructure status check (must pass)
- **Optional Checks:**
  - MCP protocol validation (continue on error)
  - Dual-agent connection tests (continue on error)

### 3. Security Scan 🔒
**Status: PARTIAL BLOCKING**
- npm audit (moderate or higher vulnerabilities fail)
- Security audit script (warnings allowed)
- TruffleHog secret scanning (warnings allowed)

### 4. Test Suite 🧪
**Status: BLOCKING** (unit tests) / **OPTIONAL** (integration and smoke)
- **Required:**
  - Unit tests must pass
- **Optional:**
  - Integration tests (continue on error)
  - Smoke tests (continue on error)

### 5. Merge Ready Check 📊
**Status: INFORMATIONAL**
- Aggregates results from all jobs
- Posts summary comment to PR
- Fails only if dry-run merge conflicts exist

### 6. Auto-Label 🏷️
**Status: INFORMATIONAL**
- Automatically adds labels based on validation results:
  - `merge-ready` - All required checks passed
  - `conflicts` - Merge conflicts detected
  - `security-review-needed` - Security issues found
  - `tests-failing` - Test failures detected

## Required vs Optional Checks

### BLOCKING (must pass to merge):
- ✅ No merge conflicts
- ✅ ESLint passes
- ✅ Infrastructure check passes
- ✅ Unit tests pass
- ✅ No high/critical npm audit vulnerabilities

### OPTIONAL (warnings only):
- ⚠️ MCP validation
- ⚠️ Dual-agent tests
- ⚠️ Integration tests
- ⚠️ Smoke tests
- ⚠️ TruffleHog secret scanning

## Manual Trigger

You can manually trigger this workflow with:
```bash
gh workflow run pr-merge-validation.yml
```

Or via the GitHub Actions UI with an optional PR number input.

## Local Testing

Before pushing, run these locally:
```bash
# Full workflow
npm run merge:workflow

# Just dry-run
npm run merge:dry-run

# Just validation
npm run merge:validate
```

## Configuration

Edit `.github/workflows/pr-merge-validation.yml` to:
- Change which checks are blocking vs optional
- Add or remove validation steps
- Modify trigger conditions
- Adjust auto-labeling logic
