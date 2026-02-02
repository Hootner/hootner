# Tooling & Formatting Guide

This document describes the unified tooling for JavaScript/TypeScript and Python in this repository.

Quick commands

- JavaScript/TypeScript lint: `npm run lint`
- JavaScript/TypeScript format: `npm run format`
- Python lint (ruff): `python -m ruff .` or `npm run tools:python:lint` if configured
- Python format (black): `python -m black .` or `npm run tools:python:format`

Editors

- VSCode settings included in `.vscode/settings.json` prefer `ms-python.black-formatter` for Python.
- Use the repository `.editorconfig` and `.prettierrc` for consistent formatting.

CI

- CI will run ESLint/Prettier and Ruff/Black (not yet wired; see `.github/workflows` for planned updates).

- AWS CLI: workflows install AWS CLI v2 where needed; prefer `aws --version` to verify. If you use AWS locally, install AWS CLI v2.

Pre-commit hooks

- Husky is already configured for JS hooks. We recommend adding `pre-commit` for Python in a future step.

Why these choices

- `printWidth = 88` to match `black` and reduce disagreements between formatters.
- `skip-string-normalization = true` in Black to avoid quote clashes with Prettier.

Install and enable hooks locally (run these in PowerShell / CMD):

```bash
# Install Python pre-commit tool (recommended in a venv)
python -m pip install --user pre-commit

# Install pre-commit git hooks (optional, for Python pre-commit framework)
python -m pre_commit install

# Or run directly to check all files once
python -m pre_commit run --all-files

# Ensure Husky hooks are installed for npm (modern Husky usage)
npm install
npx husky install

# To test lint-staged + Husky pre-commit flow, stage a file and run:
git add path/to/file.py
git commit -m "test hooks"
```

Husky v8+ usage

- We removed the old `husky` JSON config and now use `.husky/` hook scripts.
- After cloning, run:

```bash
npm install
npx husky install
```

This creates the husky infrastructure and ensures the `.husky/pre-commit` runs `lint-staged` on commit.

## Merge Workflow & Conflict Resolution

The repository includes automated tools for safe PR merging with dry-run testing and conflict resolution.

### Quick Start - Merge Workflow Commands

```bash
# Run complete pre-merge validation (recommended before merging)
npm run merge:workflow

# Test for merge conflicts without making changes
npm run merge:dry-run

# Run all validation checks (linting, security, infrastructure)
npm run merge:validate

# Execute actual merge (after validation passes)
npm run merge:execute

# Generate merge commit message template
npm run merge:generate-msg
```

### Merge Workflow Steps

The recommended merge workflow is automated through `pr-merge-workflow.js`:

1. **Dry-Run Testing** - Detects potential merge conflicts before attempting merge
   - Uses `git merge-tree` for safe conflict detection
   - Lists conflicting files if any exist
   - No changes made to working directory

2. **Pre-Merge Validation** - Runs comprehensive checks
   - Linting with ESLint
   - MCP protocol validation
   - Dual-agent system tests
   - Infrastructure status check

3. **Security Scanning** - Validates security posture
   - npm audit for dependency vulnerabilities
   - Security audit script execution
   - Automated security checks

4. **Merge Execution** - Performs the actual merge
   - Runs issue-orchestrator to fix common problems
   - Executes `git merge` with no-fast-forward
   - Provides clear guidance if conflicts occur

5. **Post-Merge Validation** - Ensures system integrity
   - Infrastructure health check
   - Smoke tests if available
   - Reports any post-merge issues

### Conflict Resolution Strategies

When conflicts are detected:

1. **Automated Resolution** (preferred)
   ```bash
   # Run issue-orchestrator to fix common conflicts
   node scripts/agents/issue-orchestrator.js
   ```

2. **Manual Resolution**
   - Edit conflicting files marked with `<<<<<<<`, `=======`, `>>>>>>>` markers
   - Stage resolved files: `git add <file>`
   - Complete merge: `git commit`

3. **Using Merge Tools**
   ```bash
   # Launch configured merge tool
   git mergetool
   ```

4. **Abort and Retry**
   ```bash
   # Abort current merge attempt
   git merge --abort
   
   # Fix issues in your branch first
   # Then retry the workflow
   npm run merge:workflow
   ```

### GitHub Actions Integration

The `.github/workflows/pr-merge-validation.yml` workflow automatically runs on all PRs:

- ✅ Dry-run merge testing
- ✅ Code quality validation  
- ✅ Security scanning
- ✅ Test suite execution
- ✅ Auto-labeling (merge-ready, conflicts, etc.)
- ✅ Status comments on PR

### Best Practices

1. **Always run dry-run first**: `npm run merge:dry-run` before attempting merge
2. **Address validation issues**: Fix linting and security issues before merging
3. **Use conventional commits**: Follow the established commit message format
4. **Resolve conflicts early**: Don't let them accumulate
5. **Check post-merge**: Verify infrastructure and run smoke tests after merge

### Troubleshooting

**Merge conflicts persist after resolution:**
- Ensure all conflict markers are removed
- Run `git status` to verify all files are staged
- Check for binary file conflicts

**Validation failures:**
- Review specific check that failed in workflow output
- Fix issues locally and push updates
- Re-run validation: `npm run merge:validate`

**Security scan blocks merge:**
- Review npm audit output
- Update vulnerable dependencies: `npm run security:fix`
- Re-run security check

**Infrastructure check fails:**
- Run `node check-infrastructure.js` locally
- Verify all required directories and files exist
- Check for missing dependencies
