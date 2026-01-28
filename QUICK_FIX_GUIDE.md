# Quick Fix Guide for Code Scan Issues

This guide provides quick fixes for the most critical issues found in the code scan.

## Commands to Run

### 1. Fix Dependency Vulnerabilities (Immediate)
```bash
npm audit fix
```

### 2. Auto-fix ESLint Issues (Safe)
```bash
npm run lint:fix
```

### 3. Review Remaining Issues
```bash
npm run lint > lint-report.txt
```

---

## Critical Fixes Needed

### Fix 1: Syntax Error in auth.js

**File:** `api/graphql/utils/auth.js:44`

**Current (Broken):**
```javascript
async function generateToken(user) {
  const secret = await getSecret();
  return jwt.sign(
    {
      id: usePromise<string>} Refresh token  // ❌ Syntax error
```

**Fix:** Review the file and fix the malformed code. Likely should be:
```javascript
async function generateToken(user) {
  const secret = await getSecret();
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    secret,
    { expiresIn: '1h' }
  );
}

/**
 * Generate refresh token
 */
async function generateRefreshToken(user) {
  // ... rest of function
```

### Fix 2: Unterminated Regex

**File:** `scripts/agents/agent-hub-manager.js:788`

**Action:** Review line 788 and ensure regex is properly terminated with `/`

### Fix 3: Missing PRICING_TIERS Constant

**File:** `services/usage-pricing-service.js:397,456`

**Issue:** `PRICING_TIERS` is referenced but not defined

**Fix:** Add the constant definition at the top of the file:
```javascript
const PRICING_TIERS = {
  free: {
    name: 'Free',
    includedUsers: 1,
    includedVideos: 10,
    includedStorage: 1,
    price: 0
  },
  basic: {
    name: 'Basic',
    includedUsers: 5,
    includedVideos: 100,
    includedStorage: 10,
    price: 29
  },
  pro: {
    name: 'Pro',
    includedUsers: 20,
    includedVideos: 1000,
    includedStorage: 100,
    price: 99
  },
  enterprise: {
    name: 'Enterprise',
    includedUsers: -1, // unlimited
    includedVideos: -1,
    includedStorage: -1,
    price: 499
  }
};
```

### Fix 4: Unsafe Regex (ReDoS Risk)

**File:** `scripts/agents/copilot-delegate.js:177`

**Current (Unsafe):**
```javascript
const functions = content.match(/(?:export\s+)?function\s+(\w+)|const\s+(\w+)\s*=/g) || [];
```

**Fix (Safer):**
```javascript
// Use a simpler, more specific pattern
const functionPattern = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm;
const constPattern = /^const\s+(\w+)\s*=/gm;

const functions = [
  ...(content.match(functionPattern) || []),
  ...(content.match(constPattern) || [])
];
```

### Fix 5: Non-literal RegExp Constructors

**Files:**
- `scripts/add-dependencies.js:14`
- `update-cicd-paths.js:32`
- `update-import-paths.js:28`

**Pattern (Unsafe):**
```javascript
const pattern = new RegExp(userInput); // ❌ Injection risk
```

**Fix:**
```javascript
// Escape special regex characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const safeInput = escapeRegex(userInput);
const pattern = new RegExp(safeInput);
```

---

## Security Warning Fixes

### Object Injection Prevention

**Pattern (Unsafe):**
```javascript
function getValue(obj, key) {
  return obj[key]; // ❌ Can access __proto__, constructor, etc.
}
```

**Fix:**
```javascript
function getValue(obj, key) {
  // Use Map for dynamic keys
  if (obj instanceof Map) {
    return obj.get(key);
  }
  
  // Or check hasOwnProperty
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key];
  }
  
  return undefined;
}
```

### File System Path Validation

**Pattern (Unsafe):**
```javascript
const content = fs.readFileSync(userProvidedPath, 'utf8'); // ❌ Path traversal risk
```

**Fix:**
```javascript
const path = require('path');

function readSafeFile(userPath, allowedDir) {
  // Resolve to absolute path
  const absolutePath = path.resolve(userPath);
  const allowedAbsPath = path.resolve(allowedDir);
  
  // Ensure file is within allowed directory
  if (!absolutePath.startsWith(allowedAbsPath)) {
    throw new Error('Access denied: Path outside allowed directory');
  }
  
  // Check for suspicious patterns
  if (absolutePath.includes('..')) {
    throw new Error('Access denied: Path contains directory traversal');
  }
  
  return fs.readFileSync(absolutePath, 'utf8');
}
```

---

## Infinite Loop Fixes

### Fix: Constant Conditions

**Files:**
- `scripts/delete-workflow-runs.js:25`
- `services/sqs-video-processor.js:159`

**Pattern (Unsafe):**
```javascript
while (true) {
  // No break condition
  processItem();
}
```

**Fix:**
```javascript
let maxIterations = 1000;
let iteration = 0;

while (iteration < maxIterations && hasMoreItems()) {
  processItem();
  iteration++;
}

if (iteration >= maxIterations) {
  console.warn('Max iterations reached');
}
```

---

## Empty Error Handlers

**Files:**
- `scripts/memory-recovery.js:81,85`
- `scripts/agents/multi-agent-orchestrator.js:143`

**Pattern (Bad):**
```javascript
try {
  riskyOperation();
} catch (err) {
  // Empty - error is silently swallowed
}
```

**Fix:**
```javascript
try {
  riskyOperation();
} catch (err) {
  // At minimum, log the error
  console.error('Error in riskyOperation:', err.message);
  
  // Or rethrow if it can't be handled
  throw err;
  
  // Or handle gracefully
  return fallbackValue;
}
```

---

## Testing Your Fixes

After making changes:

```bash
# 1. Lint check
npm run lint

# 2. Run tests
npm test

# 3. Check security
npm audit

# 4. Try to start the application
npm start
```

---

## Preventive Measures

### 1. Set up Pre-commit Hooks

Ensure hooks are executable:
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### 2. Add CI/CD Checks

Add to your CI pipeline:
```yaml
- name: Lint
  run: npm run lint
  
- name: Security Audit
  run: npm audit --audit-level=moderate
  
- name: Type Check
  run: npm run type-check
```

### 3. Configure Editor

Add to VS Code settings:
```json
{
  "eslint.autoFixOnSave": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Summary Checklist

- [ ] Run `npm audit fix` for dependencies
- [ ] Fix syntax error in `api/graphql/utils/auth.js`
- [ ] Fix regex in `scripts/agents/agent-hub-manager.js`
- [ ] Add `PRICING_TIERS` to `services/usage-pricing-service.js`
- [ ] Fix unsafe regex in `scripts/agents/copilot-delegate.js`
- [ ] Fix non-literal RegExp in 3 files
- [ ] Fix infinite loops in 2 files
- [ ] Add error handling to empty catch blocks
- [ ] Review and fix top object injection warnings
- [ ] Review and fix file system path warnings
- [ ] Enable pre-commit hooks
- [ ] Add security checks to CI/CD

---

**Priority Order:**
1. Critical errors (will break the app)
2. Security vulnerabilities (can be exploited)
3. Code quality warnings (technical debt)
4. Style issues (consistency)

Good luck! 🚀
