# 🤖 HOOTNER Fix-It Agents

Automated agents to fix code quality issues detected by the advanced code scanner.

## Available Agents

### 🔴 Critical Priority

#### 1. fix-hardcoded-credentials.js
- **Purpose:** Replace hardcoded credentials with environment variables
- **Fixes:** Security vulnerabilities from hardcoded secrets
- **Usage:** `node scripts/agents/fix-hardcoded-credentials.js`

### 🟠 High Priority

#### 2. fix-console-logs.js
- **Purpose:** Remove console.log statements from production code
- **Fixes:** Debug statements left in code
- **Usage:** `node scripts/agents/fix-console-logs.js`

#### 3. fix-error-handling.js
- **Purpose:** Improve error handling patterns
- **Fixes:** Empty catch blocks, catch blocks that only log
- **Usage:** `node scripts/agents/fix-error-handling.js`

### 🟡 Medium Priority

#### 4. fix-magic-numbers.js
- **Purpose:** Replace magic numbers with named constants
- **Fixes:** Hardcoded numbers without context
- **Usage:** `node scripts/agents/fix-magic-numbers.js`

#### 5. fix-snake-case.js
- **Purpose:** Convert snake_case to camelCase
- **Fixes:** Naming convention inconsistencies
- **Usage:** `node scripts/agents/fix-snake-case.js`

### 🔵 Info Priority

#### 6. fix-complexity.js
- **Purpose:** Identify high complexity files for manual refactoring
- **Fixes:** Reports files with cyclomatic complexity >50
- **Usage:** `node scripts/agents/fix-complexity.js`

## Master Agent

Run all agents in priority order:

```bash
node scripts/agents/master-fix-agent.js
```

## Workflow

1. **Scan:** `node scripts/analysis/advanced-code-scanner.js`
2. **Fix:** `node scripts/agents/master-fix-agent.js`
3. **Verify:** `node scripts/analysis/advanced-code-scanner.js`
4. **Repeat** until errors/warnings are minimized

## Safety

- All agents create backups before modifying files
- Test thoroughly after running agents
- Review changes before committing
- Run in development environment first

## Integration

Add to package.json:

```json
{
  "scripts": {
    "scan": "node scripts/analysis/advanced-code-scanner.js",
    "fix": "node scripts/agents/master-fix-agent.js",
    "scan:fix": "npm run scan && npm run fix && npm run scan"
  }
}
```
