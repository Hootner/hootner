# API Security Scanner Agent

🔍 **Comprehensive security scanner for detecting API keys, database connections, and credentials in your codebase**

## Overview

The API Security Scanner Agent is a specialized CLI tool that scans your HTML pages, JavaScript files, and configuration files for:

- ✅ **API Key Exposure** - Hardcoded API keys, access tokens, bearer tokens
- ✅ **Database Connections** - MongoDB, PostgreSQL, MySQL, DynamoDB connection strings
- ✅ **Cloud Credentials** - AWS access keys, secret keys, IAM credentials
- ✅ **Third-party Keys** - Stripe, Firebase, Google API keys
- ✅ **Hardcoded Passwords** - Plain text passwords and secrets
- ✅ **Insecure API Calls** - HTTP instead of HTTPS requests
- ✅ **Direct Database Access** - Frontend code directly accessing databases
- ✅ **Environment Variables** - Improper exposure of sensitive config

## Quick Start

### Basic Scan (HTML Pages)
```bash
npm run security:scan:api
```

### Detailed Report with Fix Suggestions
```bash
npm run security:scan:api:detailed
```

### Scan Entire Project
```bash
npm run security:scan:api:all
```

### Custom Path Scan
```bash
node agents/api-security-scanner-agent.cjs --path src/components --detailed --fix
```

## Command Options

| Option | Description |
|--------|-------------|
| `--path <path>` | Scan specific directory (default: `apps/frontend/html-pages`) |
| `--json` | Output results in JSON format |
| `--detailed` | Include code snippets showing context around findings |
| `--fix` | Show security fix suggestions for each finding |
| `--help, -h` | Display help information |

## Usage Examples

### 1. Quick Security Check
```bash
node agents/api-security-scanner-agent.cjs
```
Fast scan of default HTML pages directory, outputs security findings by severity.

### 2. Deep Analysis with Recommendations
```bash
node agents/api-security-scanner-agent.cjs --detailed --fix
```
Includes code snippets and actionable fix suggestions.

### 3. Scan Specific Component
```bash
node agents/api-security-scanner-agent.cjs --path apps/frontend/src/components
```
Target specific directories for focused analysis.

### 4. Export JSON Report
```bash
node agents/api-security-scanner-agent.cjs --json > security-report.json
```
Generate machine-readable report for integration with other tools.

### 5. Pre-Commit Hook
```bash
node agents/api-security-scanner-agent.cjs --path src/
```
Add to your pre-commit hooks to catch issues before they're committed.

## Report Severity Levels

### 🔴 **CRITICAL** (Immediate Action Required)
- Exposed AWS access keys, secret keys
- Hardcoded database connection strings
- Private keys and authentication secrets
- Stripe secret keys (sk_live_*)
- Direct AWS SDK usage in frontend

**Action**: Revoke credentials immediately, rotate all keys

### 🟠 **HIGH** (High Priority)
- API tokens and bearer tokens
- Firebase API keys without restrictions
- Database endpoints in frontend code
- Authentication tokens in source code

**Action**: Move to environment variables, implement backend proxy

### 🟡 **MEDIUM** (Should Fix)
- Insecure HTTP requests (should be HTTPS)
- Environment variable references in frontend
- Development URLs in production code

**Action**: Update to use secure protocols and configuration

### 🟢 **LOW** (Review)
- Localhost URLs in code
- Vite environment variable references
- Development IP addresses

**Action**: Clean up for production builds

## Output Format

### Console Report
```
═══════════════════════════════════════════════════════════════
   🔍 API SECURITY SCANNER - COMPREHENSIVE REPORT
═══════════════════════════════════════════════════════════════

📊 Total Findings: 15
🔴 Critical: 3
🟠 High: 5
🟡 Medium: 4
🟢 Low: 3
ℹ️  Info: 0

🔴 CRITICAL SEVERITY (3)
─────────────────────────────────────────────────────────────

[1] AWS Access Key
    File: config/aws-config.js:23
    Category: awsCredentials
    Context: const accessKey = 'AKIAIOSFODNN7EXAMPLE'
    💡 Suggestion: Revoke immediately via AWS Console
```

### JSON Report (`api-security-report.json`)
```json
{
  "timestamp": "2026-01-24T10:30:00.000Z",
  "summary": {
    "total": 15,
    "critical": 3,
    "high": 5,
    "medium": 4,
    "low": 3,
    "info": 0
  },
  "findings": {
    "critical": [...],
    "high": [...],
    "medium": [...],
    "low": [...],
    "info": [...]
  }
}
```

## Security Patterns Detected

### API Keys & Tokens
- `api_key`, `apiKey`, `API_KEY` assignments
- `x-api-key` headers
- Bearer tokens (JWT format)
- Generic token assignments

### AWS/Cloud Credentials
- AWS access keys (`AKIA...`)
- AWS secret access keys
- AWS credential configurations

### Database Connections
- MongoDB connection strings (`mongodb://...`)
- PostgreSQL (`postgres://...`)
- MySQL (`mysql://...`)
- DynamoDB endpoints
- Generic connection strings

### Third-Party Services
- Stripe keys (`sk_live_*`, `pk_live_*`)
- Firebase API keys
- Google API keys (`AIza...`)

### Passwords & Secrets
- `password`, `passwd`, `pwd` assignments
- `secret_key`, `private_key` references

### Insecure Patterns
- HTTP requests (fetch, XMLHttpRequest, axios)
- Direct database operations in frontend
- AWS SDK usage in client-side code

## Best Practices Recommendations

### 1. Environment Variables
```javascript
// ❌ BAD
const apiKey = 'sk_live_abc123...';

// ✅ GOOD
const apiKey = process.env.STRIPE_API_KEY;
```

### 2. Backend API Proxy
```javascript
// ❌ BAD - Direct database access in frontend
const result = await dynamodb.getItem({ TableName: 'users' });

// ✅ GOOD - Use backend API
const result = await fetch('/api/users/profile');
```

### 3. HTTPS Only
```javascript
// ❌ BAD
fetch('http://api.example.com/data');

// ✅ GOOD
fetch('https://api.example.com/data');
```

### 4. Secrets Management
- Use AWS Secrets Manager for production credentials
- Store development keys in `.env` (add to `.gitignore`)
- Implement key rotation policies
- Use IAM roles instead of access keys when possible

## Integration with CI/CD

### GitHub Actions
```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run security scan
        run: npm run security:scan:api:all
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
node agents/api-security-scanner-agent.js --path src/

if [ $? -ne 0 ]; then
    echo "❌ Security scan failed! Fix issues before committing."
    exit 1
fi
```

## Comparison with Other Tools

| Feature | API Scanner | git-secrets | Snyk | GitGuardian |
|---------|-------------|-------------|------|-------------|
| API Keys | ✅ | ✅ | ✅ | ✅ |
| Database Strings | ✅ | ⚠️ | ⚠️ | ✅ |
| Frontend-specific | ✅ | ❌ | ❌ | ❌ |
| Fix Suggestions | ✅ | ❌ | ✅ | ✅ |
| Offline | ✅ | ✅ | ❌ | ❌ |
| Free | ✅ | ✅ | ⚠️ | ⚠️ |

## Exit Codes

- `0` - No critical issues found
- `1` - Critical security issues detected (blocks CI/CD)

## File Types Scanned

- `.html` - HTML pages only

## Performance

- **Speed**: ~100-200 files/second
- **Memory**: Low overhead (<50MB for most projects)
- **Caching**: Results cached in `api-security-report.json`

## Troubleshooting

### "Path not found" Error
```bash
# Ensure the path exists
node agents/api-security-scanner-agent.cjs --path apps/frontend/html-pages
```

### Too Many False Positives
```bash
# Use detailed mode to see context
node agents/api-security-scanner-agent.cjs --detailed
```

### JSON Export Not Working
```bash
# Use shell redirection for JSON
node agents/api-security-scanner-agent.cjs --json > report.json
```

## Related Tools

- **[security-audit.js](../security-audit.js)** - NPM dependency audit
- **[git-integrity-check.js](../scripts/git-integrity-check.js)** - Git repository integrity
- **[git-health-monitor.js](../scripts/git-health-monitor.js)** - Repository health monitoring

## Contributing

Suggestions for additional security patterns? Open an issue or submit a PR!

### Adding New Patterns
Edit `api-security-scanner-agent.cjs` and add to `this.patterns`:

```javascript
newCategory: [
  { 
    pattern: /your-regex-here/gi, 
    severity: 'critical', 
    type: 'Your Security Issue' 
  }
]
```

## License

MIT License - Part of the HOOTNER Enterprise Platform

---

**Made with 🦉 by the HOOTNER Security Team**

Need help? Check the [Documentation Index](../docs/DOCUMENTATION_INDEX.md) or [Security Guide](../docs/security/SECURITY.md)
