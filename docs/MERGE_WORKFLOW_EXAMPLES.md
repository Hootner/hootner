# Merge Workflow Usage Examples

This document provides practical examples of using the merge workflow automation tools.

## Scenario 1: Standard PR Merge

You have a feature branch and want to merge it into main safely.

```bash
# 1. First, run the full workflow to check everything
npm run merge:workflow

# Expected output:
# ✅ Dry-run merge test
# ✅ Code validation
# ✅ Security checks
# ✅ Infrastructure check

# 2. If all checks pass, execute the merge
npm run merge:execute

# 3. Verify post-merge status
node check-infrastructure.js
npm run test:smoke
```

## Scenario 2: Quick Conflict Check

You just want to see if there are conflicts before starting other work.

```bash
# Run only the dry-run merge test
npm run merge:dry-run

# Output will show either:
# ✅ No merge conflicts detected
# or
# ⚠️ Potential merge conflicts detected with file list
```

## Scenario 3: Pre-Merge Validation Only

You want to validate your code without testing merge conflicts.

```bash
# Run validation and security checks
npm run merge:validate

# This runs:
# - ESLint linting
# - MCP validation
# - Dual-agent tests
# - Infrastructure check
# - Security audit
```

## Scenario 4: Merge Conflicts Detected

The workflow detected conflicts. Here's how to resolve them:

```bash
# 1. The workflow tells you about conflicts
npm run merge:dry-run
# Output: ⚠️ Conflicts in: src/app.js, package.json

# 2. Run issue-orchestrator to auto-fix common issues
node scripts/agents/issue-orchestrator.js

# 3. If conflicts remain, resolve manually
git merge origin/main
# Edit conflicting files
git add .
git commit -m "fix: resolve merge conflicts"

# 4. Verify the merge works now
npm run merge:dry-run
# Output: ✅ No merge conflicts detected

# 5. Complete the merge
npm run merge:execute
```

## Scenario 5: Generate Merge Commit Message

You need a well-formatted merge commit message.

```bash
# Generate a template based on your changes
npm run merge:generate-msg

# Copy the generated message and use it:
git commit -m "Merge: Add user authentication

- Implemented JWT authentication
- Added login/logout endpoints
- Updated user model
- Added authentication tests

Impact: Users can now securely authenticate
Testing: All auth tests passing"
```

## Scenario 6: CI/CD Integration

In your CI pipeline, add pre-merge validation:

```yaml
# In your CI configuration (e.g., .github/workflows/ci.yml)
- name: Pre-merge validation
  run: npm run merge:validate

- name: Test merge conflicts
  run: npm run merge:dry-run
```

## Scenario 7: Debugging Validation Failures

A validation check is failing. Debug it step by step:

```bash
# 1. Run full workflow to see all results
npm run merge:workflow

# 2. If linter fails, fix and re-run
npm run lint:fix
npm run merge:validate

# 3. If security check fails, review and fix
npm run security:audit
npm audit fix
npm run merge:validate

# 4. If infrastructure check fails, investigate
node check-infrastructure.js
# Fix any missing dependencies or structure issues
npm run merge:validate
```

## Scenario 8: Emergency Merge (Skip Some Checks)

In rare cases where you need to merge despite warnings:

```bash
# Run the workflow to see what's failing
npm run merge:workflow

# Review the specific failures
# If only optional checks are failing (MCP, dual-agent tests), you can proceed

# Check critical items manually:
npm run lint
node check-infrastructure.js
npm run test:unit

# If critical items pass, execute merge
npm run merge:execute

# Document why optional checks were skipped in commit message
```

## Scenario 9: Local vs CI Differences

The workflow passes locally but fails in CI:

```bash
# 1. Ensure you have latest from main
git fetch origin main

# 2. Run dry-run with explicit target
node scripts/agents/pr-merge-workflow.js dry-run main

# 3. If CI has network access but you don't, you might see:
# "⚠️ Could not fetch (continuing with local refs)"
# This is OK locally, but CI will fetch properly

# 4. Review CI logs to see which specific check failed
# Then reproduce that check locally:
npm run lint           # If linter failed
npm run test:unit      # If unit tests failed
npm run security:audit # If security failed
```

## Scenario 10: Multiple PRs Coordination

You're working on multiple related PRs:

```bash
# For each PR, run validation independently
cd pr-branch-1
npm run merge:dry-run
npm run merge:validate

cd ../pr-branch-2
npm run merge:dry-run
npm run merge:validate

# Merge them in dependency order
# PR 1 first (if PR 2 depends on it)
cd pr-branch-1
npm run merge:execute

# Then PR 2
cd ../pr-branch-2
git pull origin main  # Get PR 1 changes
npm run merge:dry-run # Re-check for conflicts
npm run merge:execute
```

## Tips and Best Practices

1. **Always run dry-run first**: Catch conflicts before starting merge
2. **Fix validation issues before merging**: Don't ignore linter/test failures
3. **Use the full workflow**: `npm run merge:workflow` covers all bases
4. **Check infrastructure after merge**: Ensure nothing broke
5. **Document conflict resolutions**: Explain why you chose a particular resolution
6. **Run locally before pushing**: CI time is precious, validate locally first

## Common Error Messages

### "Could not fetch (continuing with local refs)"
**Cause**: Git can't connect to remote (network/auth issue)  
**Solution**: In CI this is fine. Locally, check your git credentials or run `git fetch origin main` manually

### "Target branch main not found locally"
**Cause**: Local repository doesn't have main branch  
**Solution**: Run `git fetch origin main` or `git clone` with full history

### "Linter found issues"
**Cause**: ESLint found code style or quality issues  
**Solution**: Run `npm run lint:fix` to auto-fix, then commit

### "Security audit found issues"
**Cause**: npm audit found vulnerable dependencies  
**Solution**: Run `npm audit fix` or update specific packages

### "Unit tests failed"
**Cause**: Test suite has failures  
**Solution**: Fix the failing tests before merging. Run `npm run test:unit` to see details

## Advanced Usage

### Custom Target Branch

```bash
# Merge into develop instead of main
node scripts/agents/pr-merge-workflow.js dry-run develop
node scripts/agents/pr-merge-workflow.js merge develop
```

### Programmatic Usage

```javascript
// In your own scripts
import { execSync } from 'child_process';

// Run workflow and capture results
try {
  execSync('npm run merge:validate', { stdio: 'inherit' });
  console.log('✅ Validation passed');
} catch (error) {
  console.error('❌ Validation failed');
  process.exit(1);
}
```

### Integration with Git Hooks

```bash
# In .husky/pre-push
npm run merge:dry-run || {
  echo "⚠️ Merge conflicts detected. Fix before pushing."
  exit 1
}
```
