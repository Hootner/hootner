# Branch Merge Guide

This guide provides instructions and tools for merging all feature branches into the main branch.

## Quick Start

### Option 1: Automated GitHub Workflow

The easiest way to merge all branches is through the GitHub Actions workflow:

1. Go to **Actions** tab in GitHub
2. Select **"Merge All Branches into Main"** workflow
3. Click **"Run workflow"**
4. Choose options:
   - **Dry Run**: Select `true` to simulate merges without actually merging
   - **Actual Merge**: Select `false` to perform the actual merges
5. Click **"Run workflow"**

The workflow will:
- ✅ Automatically merge all branches that have no conflicts
- ⚠️ Create issues for branches with merge conflicts
- 📊 Provide a summary of all merge operations

### Option 2: Local Script

You can also merge branches locally using the provided script:

```bash
# Install dependencies if needed
npm install

# Dry run - see what would happen without actually merging
npm run git:merge:dry-run

# Merge all branches
npm run git:merge:all

# Merge a specific branch
npm run git:merge:branch -- --branch=copilot/feature-name
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run git:merge:all` | Merge all feature branches into main |
| `npm run git:merge:dry-run` | Simulate merges without actually performing them |
| `npm run git:merge:branch -- --branch=<name>` | Merge a specific branch only |

## Script Options

The merge script (`scripts/merge-all-branches.js`) supports several options:

```bash
node scripts/merge-all-branches.js [options]

Options:
  --dry-run            Simulate merges without actually performing them
  --branch=<name>      Merge only a specific branch
  --skip-merged        Skip branches that are already merged (default)
  --no-skip-merged     Include already merged branches
  --help, -h           Show help message
```

### Examples

```bash
# Dry run to test all merges
node scripts/merge-all-branches.js --dry-run

# Merge a specific branch
node scripts/merge-all-branches.js --branch=copilot/enhance-copilot-cli

# Merge all branches including already merged ones
node scripts/merge-all-branches.js --no-skip-merged
```

## Branches to Merge

The following branches have been identified for merging into main:

1. `chore/github-automation` - GitHub automation improvements
2. `copilot/configure-github-copilot-settings` - Copilot configuration
3. `copilot/create-copilot-instructions` - Copilot documentation
4. `copilot/enhance-copilot-cli` - CLI enhancements
5. `copilot/fix-conflicts-and-merge-branches` - Conflict resolution fixes
6. `copilot/fix-content-security-policy-issues` - CSP fixes
7. `copilot/fix-critical-bugs-security` - Security bug fixes
8. `copilot/fix-eslint-errors-tooling-checks` - Linting fixes
9. `copilot/fix-github-security-issues` - GitHub security improvements
10. `copilot/merge-hootner-enhancements` - Platform enhancements
11. `copilot/merge-prep-for-production` - Production preparation
12. `copilot/outdoor-egret` - Feature development
13. `copilot/scan-log-fix-issues` - Logging improvements
14. `copilot/secure-repo` - Repository security
15. `copilot/start-workflows` - Workflow initialization
16. `copilot/update-api-configuration` - API configuration updates
17. `copilot/update-project-documentation` - Documentation updates
18. `copilot/validate-conventional-commits` - Commit validation

## Merge Strategy

The merge process follows these steps:

### 1. Preparation
- Ensure you're on the `main` branch
- Pull the latest changes from `origin/main`
- Fetch all remote branches

### 2. Branch Analysis
For each branch, the script:
- Checks if the branch exists
- Determines if it's already merged
- Counts commits ahead of main
- Shows the last commit message

### 3. Merge Execution
- Attempts a no-fast-forward merge (`--no-ff`)
- Creates a merge commit with descriptive message
- If conflicts occur:
  - Aborts the merge
  - Records the conflict for manual resolution
  - Continues with other branches

### 4. Conflict Resolution
If a branch has merge conflicts:

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Attempt merge
git merge <branch-name>

# Resolve conflicts in your editor
# Files with conflicts will be marked

# After resolving conflicts
git add .
git commit
git push origin main
```

## GitHub Workflow Features

The GitHub Actions workflow (`.github/workflows/merge-all-branches.yml`) provides:

### Automated Merging
- Processes all branches sequentially
- Handles each branch independently
- Continues even if individual merges fail

### Conflict Management
- Automatically creates issues for conflicting branches
- Issues include:
  - Branch name
  - Detailed resolution instructions
  - Appropriate labels (`merge-conflict`, `needs-attention`)

### Dry Run Mode
- Test merges without making changes
- Identifies potential conflicts beforehand
- Helps plan manual interventions

### Comprehensive Reporting
- Shows successful merges
- Lists already-merged branches
- Reports conflicts and skipped branches

## Best Practices

### Before Merging

1. **Review Branch Status**
   ```bash
   npm run git:merge:dry-run
   ```

2. **Check for Active Development**
   - Ensure no one is actively working on branches being merged
   - Communicate with team members

3. **Backup Current State**
   ```bash
   git branch backup-main main
   ```

### During Merging

1. **Start with Dry Run**
   - Always test first with `--dry-run`
   - Identify problematic branches

2. **Handle Conflicts Promptly**
   - Address conflicts as they arise
   - Don't let conflict resolution pile up

3. **Test After Each Merge**
   - Run tests after merging related branches
   - Ensure functionality isn't broken

### After Merging

1. **Verify Main Branch**
   ```bash
   git checkout main
   npm test
   npm run lint
   ```

2. **Delete Merged Branches** (Optional)
   ```bash
   git branch -d <branch-name>
   git push origin --delete <branch-name>
   ```

3. **Update Documentation**
   - Document any breaking changes
   - Update CHANGELOG if applicable

## Troubleshooting

### Authentication Issues

If you encounter git authentication errors:

```bash
# Check git configuration
git config --list | grep credential

# Ensure GITHUB_TOKEN is set
echo $GITHUB_TOKEN

# Re-configure if needed
git config credential.helper store
```

### Merge Conflicts

Common conflict scenarios:

1. **Package.json Conflicts**
   - Usually in dependencies or scripts
   - Merge both sets of changes when possible
   - Test after resolution

2. **Configuration File Conflicts**
   - Review both versions carefully
   - Keep the most recent/complete configuration
   - Validate after merge

3. **Code Conflicts**
   - Understand both changes
   - Integrate functionality from both branches
   - Run tests to verify

### Failed Merges

If a merge fails unexpectedly:

```bash
# Abort the current merge
git merge --abort

# Check repository status
git status

# Verify branch state
git log --oneline -5

# Try again with more information
git merge <branch> --verbose
```

## Advanced Usage

### Custom Merge Messages

```bash
git merge <branch> -m "Custom merge message

Detailed description of what was merged and why."
```

### Merge Specific Commits

```bash
# Cherry-pick specific commits instead of full merge
git cherry-pick <commit-sha>
```

### Squash Merge

```bash
# Merge and squash all commits into one
git merge --squash <branch>
git commit -m "Squashed merge of <branch>"
```

## Monitoring and Logs

### View Merge History

```bash
# See all merges
git log --merges --oneline

# Detailed merge information
git log --merges --first-parent main
```

### Check Branch Status

```bash
# See which branches are merged
git branch --merged main

# See which branches are not merged
git branch --no-merged main
```

## Support

For issues or questions:

1. Check this guide first
2. Review GitHub Actions logs
3. Examine script output for errors
4. Create an issue with:
   - Branch name
   - Error messages
   - Steps to reproduce

## Related Files

- `.github/workflows/merge-all-branches.yml` - GitHub Actions workflow
- `scripts/merge-all-branches.js` - Local merge script
- `scripts/agents/copilot-merge-prompt.js` - Merge message generator
- `.husky/post-merge` - Post-merge hooks

## Workflow Diagram

```
Start
  ↓
Fetch all branches
  ↓
For each branch:
  ├─→ Already merged? → Skip
  ├─→ Conflicts? → Create issue
  └─→ Clean merge? → Merge and push
  ↓
Generate summary
  ↓
End
```

## Security Considerations

- All merges require write permissions
- Workflow uses `GITHUB_TOKEN` for authentication
- Protected branches may require additional approvals
- Always review security-related changes manually

## Performance

- Merges are processed sequentially (one at a time)
- Large branches may take longer to merge
- Parallel processing is disabled to prevent conflicts
- Expected time: ~2-5 minutes per branch

---

**Last Updated**: 2026-02-02
**Version**: 1.0.0
**Maintainer**: HOOTNER Development Team
