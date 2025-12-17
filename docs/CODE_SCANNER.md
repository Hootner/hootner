# 🔍 Code Scanner Agent

Automated code scanning tools for the Hootner project that detect syntax errors, security vulnerabilities, and code quality issues.

## 📋 Overview

Two scanning agents are available:

1. **Basic Scanner** (`code-scanner.js`) - Fast, minimal syntax and common issue detection
2. **Advanced Scanner** (`advanced-code-scanner.js`) - Comprehensive security, quality, and syntax analysis

## 🚀 Quick Start

```bash
# Scan entire project
npm run scan:full

# Scan specific directory
npm run scan:advanced services/

# Basic scan
npm run scan:code apps/frontend/src/
```

## 🛠️ Basic Scanner

### Features

- ✅ JavaScript/TypeScript syntax validation
- ⚠️ Common anti-patterns detection
- 📝 Simple error reporting

### Usage

```bash
node scripts/code-scanner.js [directory]

# Examples
node scripts/code-scanner.js .
node scripts/code-scanner.js services/
```

### Checks Performed

- Syntax errors in `.js` and `.jsx` files
- `console.log` in production code
- `var` keyword usage (should use `const`/`let`)
- Loose equality (`==` instead of `===`)

### Output

Generates `error_report.txt` with all detected issues.

## 🔬 Advanced Scanner

### Features

- 🔒 Security vulnerability detection
- 📊 Code quality analysis
- 🐛 Syntax error checking
- 🔧 ESLint integration for JavaScript/TypeScript
- 🐍 Pylint integration for Python
- 🧪 Unit test validation
- 📈 Detailed statistics
- 🎨 Formatted console output

### Usage

```bash
node scripts/advanced-code-scanner.js [directory]

# Examples
node scripts/advanced-code-scanner.js .
node scripts/advanced-code-scanner.js api/graphql/
```

### Security Checks

- Hardcoded passwords
- Hardcoded API keys
- Dangerous `eval()` usage
- XSS vulnerabilities via `innerHTML`
- Dangerous `document.write()` usage

### Quality Checks

- `var` keyword usage
- Loose equality operators
- `console.log` statements
- `debugger` statements
- Unresolved TODO/FIXME comments

### Linting Integration

- **ESLint** for JavaScript/TypeScript files
- **Pylint** for Python files (requires `pip install pylint`)
- JSON output parsing for detailed errors

### Test Validation

- Detects test files (`.test.js`, `.spec.ts`, `test_*.py`)
- Validates test case presence
- Checks for assertions
- Warns about `.only` or `.skip` usage

## 🎯 Unified Scanner

### Features

- Combines ESLint + Pylint + Unit Tests
- Single command for complete validation
- CI/CD optimized

### Usage

```bash
npm run scan:unified
npm run scan:all  # Includes linting + tests
```

### Output

- Console output with emoji indicators
- `code-scan-report.txt` with full details
- Exit code 1 if errors found (CI/CD friendly)

## 📊 Report Format

### Basic Scanner Report

```
Errors Detected (3):

File: services/payment-service.js
Error: Warning: console.log found in production code
================================================================================

File: middleware/auth.js
Error: Syntax Error: Unexpected token
================================================================================
```

### Advanced Scanner Report

```
CODE SCAN REPORT
================================================================================
Timestamp: 2024-01-15T10:30:00.000Z
Directory: /path/to/hootner
Files Scanned: 156
Errors: 5
Warnings: 12
================================================================================

ERRORS (5):
--------------------------------------------------------------------------------
📛 services/payment-service.js
   Security: Hardcoded API key detected

📛 middleware/auth.js
   Syntax Error: Unexpected token '}'

WARNINGS (12):
--------------------------------------------------------------------------------
⚠️  lib/utils.js
   Use === instead of ==

⚠️  services/audit-service.js
   Remove console.log
```

## 🔧 Configuration

### Python Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Verify Pylint installation
pylint --version
```

### Ignored Directories

All scanners ignore:

- `node_modules/`
- `dist/`
- `build/`
- `.git/`
- `coverage/`
- `.next/`
- `__pycache__/`
- `.pytest_cache/`

### Supported File Extensions

- `.js` - JavaScript
- `.jsx` - React JSX
- `.ts` - TypeScript
- `.tsx` - React TypeScript
- `.json` - JSON (advanced scanner only)
- `.py` - Python

## 🎯 Integration

### CI/CD Pipeline

Add to `.github/workflows/code-scan.yml`:

```yaml
name: Code Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run scan:full
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: scan-report
          path: code-scan-report.txt
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run scan:advanced $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|tsx)$' | xargs dirname | sort -u)
```

## 📈 Best Practices

1. **Run regularly** - Include in CI/CD pipeline
2. **Fix errors first** - Prioritize errors over warnings
3. **Review warnings** - Address quality issues incrementally
4. **Scan before commit** - Catch issues early
5. **Track progress** - Monitor error/warning trends

## 🔄 Extending the Scanner

### Add Custom Checks

Edit `advanced-code-scanner.js`:

```javascript
checkCustom(filePath, content) {
  const customPatterns = [
    { pattern: /your-pattern/, msg: 'Your message' }
  ];

  customPatterns.forEach(({ pattern, msg }) => {
    if (pattern.test(content)) {
      this.addError(filePath, msg);
    }
  });
}
```

### Add New File Types

```javascript
const CONFIG = {
  extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'],
  // ...
};
```

## 🆘 Troubleshooting

### Scanner Not Finding Files

- Check directory path is correct
- Verify file extensions match configuration
- Ensure files aren't in ignored directories

### False Positives

- Review pattern matching logic
- Add exceptions for specific cases
- Adjust severity (error vs warning)

### Performance Issues

- Scan specific directories instead of entire project
- Exclude large generated files
- Run in parallel for large codebases

## 📚 Related Tools

- **ESLint** - Advanced linting (requires configuration)
- **Prettier** - Code formatting
- **SonarQube** - Enterprise code quality
- **Snyk** - Security vulnerability scanning

## 🔗 NPM Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run scan:code`     | Basic scanner on current directory       |
| `npm run scan:advanced` | Advanced scanner on current directory    |
| `npm run scan:full`     | Full project scan with advanced scanner  |
| `npm run scan:unified`  | Unified scanner with linting + tests     |
| `npm run scan:all`      | Complete validation (lint + scan + test) |

## 📝 Notes

- Scanners are lightweight and require no external dependencies
- Syntax checking uses Node.js built-in Function constructor
- Security patterns are regex-based (not AST analysis)
- For production, consider integrating ESLint + Snyk

---

**Made with 🦉 by the HOOTNER Team**
