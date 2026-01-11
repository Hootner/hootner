# Pre-commit Validation System

This repository uses a comprehensive pre-commit validation system to ensure code quality and security before commits are accepted.

## Overview

The pre-commit validation system includes three main components:

1. **Secret Scanning** - Detects potential secrets, tokens, and passwords
2. **ESLint Syntax Checking** - Validates JavaScript/Node.js syntax
3. **Conventional Commits** - Enforces standardized commit message format

## Features

### 1. Secret Scanning 🔍

**Script:** `scripts/scan-secrets.js`

Scans all staged files for potential secrets including:
- API keys and tokens
- AWS credentials
- GitHub tokens
- Private keys (RSA, DSA, EC, PGP)
- JWT tokens
- Passwords
- Database connection strings
- Stripe keys
- Generic base64-encoded secrets

**How it works:**
- Runs automatically before every commit
- Scans only staged files (files you've added with `git add`)
- Exits with code 1 if secrets are detected, blocking the commit
- Provides detailed information about detected secrets (file, line number, type)

**False Positives:**
If the scanner detects something that isn't actually a secret (false positive), you can:
1. Add the pattern to `IGNORE_PATTERNS` in `scripts/scan-secrets.js`
2. Add the value to `SAFE_PLACEHOLDERS` if it's a common placeholder

### 2. ESLint Syntax Checking 🔧

**Configuration:** `.eslintrc.json`

Validates JavaScript syntax and code style for:
- All `.js`, `.jsx`, `.mjs`, `.cjs` files
- Only staged files are checked
- Zero warnings policy (`--max-warnings 0`)

**How it works:**
- Runs automatically before every commit
- Checks only files you're committing
- Exits with code 1 if syntax errors are found
- Provides error details and suggestions

**Auto-fix:**
Many ESLint issues can be auto-fixed:
```bash
npm run lint:fix
```

### 3. Conventional Commits 📝

**Tool:** commitlint
**Configuration:** `.commitlintrc.json`

Enforces the Conventional Commits format for commit messages.

**Format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Allowed types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples:**
```bash
✅ feat: add user authentication
✅ fix(api): resolve null pointer exception
✅ docs: update README with installation steps
✅ refactor(database): optimize query performance

❌ add authentication  # Missing type
❌ feat authentication # Missing colon
❌ Fix bug             # Type must be lowercase
```

## Workflow

### Pre-commit Hook (`.husky/pre-commit`)

When you run `git commit`, the following checks run in order:

1. **Secret Scanning**
   - Scans staged files for secrets
   - Blocks commit if secrets found
   
2. **ESLint Check**
   - Validates syntax of staged JS files
   - Blocks commit if errors found
   
3. **Code Review Agent**
   - Runs enhanced code review
   - Blocks commit if review fails

### Commit-msg Hook (`.husky/commit-msg`)

After you write your commit message, it validates:

1. **Conventional Commit Format**
   - Checks message follows conventional format
   - Blocks commit if format is invalid

## Exit Codes

All validation scripts follow standard exit code conventions:
- `0`: Success (validation passed)
- `1`: Failure (validation failed)

This ensures proper integration with CI/CD pipelines.

## Bypassing Validation

**⚠️ Not Recommended**

In rare cases where you need to bypass validation (e.g., emergency hotfix):

```bash
# Skip pre-commit hooks
git commit --no-verify -m "fix: emergency hotfix"

# Skip commit-msg validation
git commit --no-verify -m "emergency fix"
```

**Note:** Bypassing validation should only be done in exceptional circumstances and reviewed immediately.

## CI/CD Integration

The validation system is designed for CI/CD integration:

### GitHub Actions

```yaml
- name: Install dependencies
  run: npm ci

- name: Run pre-commit checks
  run: |
    npm run lint
    node scripts/scan-secrets.js
```

### Manual Testing

Test individual components:

```bash
# Test secret scanner
node scripts/scan-secrets.js

# Test ESLint
npm run lint

# Test commitlint
echo "feat: test message" | npx commitlint

# Test with invalid message
echo "invalid message" | npx commitlint
```

## Troubleshooting

### Secret Scanner False Positive

If the scanner detects a non-secret:
1. Check if it's in `.env.example` or test files
2. Add to `IGNORE_PATTERNS` or `SAFE_PLACEHOLDERS` in `scripts/scan-secrets.js`

### ESLint Errors

If ESLint reports errors:
1. Run `npm run lint:fix` to auto-fix
2. Manually fix remaining errors
3. Check `.eslintrc.json` for rules

### Commit Message Rejected

If your commit message is rejected:
1. Follow the format: `type(scope): subject`
2. Use lowercase for type
3. Keep subject under 50 characters
4. See examples above

## Dependencies

- `@commitlint/cli` - Commit message linting
- `@commitlint/config-conventional` - Conventional commit rules
- `eslint` - JavaScript linting
- `husky` - Git hooks management

## Maintenance

### Updating Secret Patterns

Edit `scripts/scan-secrets.js` to add new patterns:

```javascript
const SECRET_PATTERNS = [
  { pattern: /your-pattern/gi, name: 'Your Secret Type' },
  // ... existing patterns
];
```

### Updating ESLint Rules

Edit `.eslintrc.json` to modify linting rules:

```json
{
  "rules": {
    "your-rule": "error"
  }
}
```

### Updating Commit Types

Edit `.commitlintrc.json` to modify allowed types:

```json
{
  "rules": {
    "type-enum": [2, "always", ["feat", "fix", "your-type"]]
  }
}
```

## Benefits

✅ **Security**: Prevents accidental commit of secrets
✅ **Quality**: Ensures code follows syntax standards
✅ **Consistency**: Standardized commit messages
✅ **Automation**: Runs automatically on every commit
✅ **CI/CD Ready**: Proper exit codes for pipeline integration
✅ **Developer-Friendly**: Clear error messages and auto-fix options

## Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Commitlint Documentation](https://commitlint.js.org/)
