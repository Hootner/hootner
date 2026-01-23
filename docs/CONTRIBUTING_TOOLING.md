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
