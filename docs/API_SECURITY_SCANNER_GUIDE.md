# 🔍 API Security Scanner - Quick Reference

**Scan for API keys, database connections, and hardcoded credentials in your codebase**

## Quick Commands

```bash
# Scan HTML pages (default)
npm run security:scan:api

# Detailed report with fix suggestions
npm run security:scan:api:detailed

# Scan entire project
npm run security:scan:api:all

# Custom path
node agents/api-security-scanner-agent.cjs --path src/ --detailed --fix
```

## What It Detects

| Category | Examples | Severity |
|----------|----------|----------|
| **API Keys** | `api_key`, `apiKey`, `x-api-key` | 🔴 Critical |
| **AWS Credentials** | `AKIA...`, `aws_secret_access_key` | 🔴 Critical |
| **Database Strings** | `mongodb://`, `postgres://`, `mysql://` | 🔴 Critical |
| **Secrets** | `secret_key`, `private_key`, Bearer tokens | 🔴 Critical |
| **Passwords** | `password =`, `passwd =` | 🔴 Critical |
| **Stripe Keys** | `sk_live_*`, `pk_live_*` | 🔴 Critical |
| **Firebase Keys** | `firebase_api_key`, `AIza...` | 🟠 High |
| **HTTP Calls** | `fetch('http://...)` | 🟡 Medium |
| **Localhost URLs** | `localhost:3000`, `127.0.0.1` | 🟢 Low |

## Output Example

```
═══════════════════════════════════════════════════════════════
   🔍 API SECURITY SCANNER - COMPREHENSIVE REPORT
═══════════════════════════════════════════════════════════════

📊 Total Findings: 15
🔴 Critical: 3
🟠 High: 5
🟡 Medium: 4
🟢 Low: 3

🔴 CRITICAL SEVERITY (3)
─────────────────────────────────────────────────────────────

[1] AWS Access Key
    File: config/aws.js:23
    💡 Suggestion: Revoke immediately via AWS Console
```

## Quick Fixes

### 1. Move to Environment Variables
```javascript
// ❌ BAD
const apiKey = 'sk_live_abc123';

// ✅ GOOD
const apiKey = process.env.STRIPE_API_KEY;
```

### 2. Use Backend Proxy
```javascript
// ❌ BAD - Direct DB in frontend
const data = await dynamodb.getItem(...);

// ✅ GOOD - Backend API
const data = await fetch('/api/users');
```

### 3. HTTPS Only
```javascript
// ❌ BAD
fetch('http://api.example.com');

// ✅ GOOD
fetch('https://api.example.com');
```

## Integration

### Pre-commit Hook
```bash
#!/bin/sh
node agents/api-security-scanner-agent.cjs
```

### GitHub Actions
```yaml
- name: Security Scan
  run: npm run security:scan:api:all
```

## Options

| Flag | Description |
|------|-------------|
| `--path <path>` | Scan specific directory |
| `--json` | JSON output |
| `--detailed` | Include code snippets |
| `--fix` | Show fix suggestions |
| `--help` | Help message |

## Exit Codes

- **0** = Safe (no critical issues)
- **1** = Critical issues found (blocks CI/CD)

## Files Scanned

`.html` - HTML pages only

## Report Location

Saved automatically to: **`api-security-report.json`**

---

📚 **Full Documentation**: [agents/README_API_SCANNER.md](agents/README_API_SCANNER.md)

🔒 **Security Guide**: [docs/security/SECURITY.md](docs/security/SECURITY.md)

🦉 **HOOTNER Platform** - *The Owl Never Sleeps*
