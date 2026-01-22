# Copilot CLI - Enhanced Prompt Guide

> **GitHub Copilot Integration for HOOTNER** – Automate code quality, security, and documentation

## 🎯 Overview

The enhanced Copilot CLI provides a suite of commands for:
- **Task Delegation** – Route complex work to specialized agents
- **Code Analysis** – Automated security, performance, and quality checks
- **Refactoring** – Suggest and guide code improvements
- **Documentation** – Generate auto-docs and API references
- **Validation** – Ensure commits meet standards

## 📋 Command Reference

### **Task Delegation**

Delegate work to Copilot agents with automatic instruction generation.

```bash
# Delegate a new task
node copilot-delegate.js delegate "Add retry logic to API calls" src/api.js src/services.js

# Monitor active tasks
node copilot-delegate.js monitor

# Mark task as complete
node copilot-delegate.js complete 1234567890
```

**Use case:** Break down complex features into manageable tasks for Copilot to tackle incrementally.

---

### **Code Analysis & Review**

Run automated analysis on a file for security, performance, and quality issues.

```bash
node copilot-delegate.js analyze src/handlers/auth.js
```

**Output:**
- 🔴 Security issues (hardcoded credentials, injection risks)
- 🟡 Performance concerns (nested loops, inefficient patterns)
- 🔵 Style violations (line length, complexity)

**Use case:** Quick pre-commit review; integrated into GitHub Actions for PR checks.

---

### **Security Audit**

Scan the entire codebase (or a subset) for security vulnerabilities.

```bash
node copilot-delegate.js security
```

**Checks:**
- Hardcoded secrets (API keys, passwords, tokens)
- Command injection patterns (`exec()`, `spawn()`, shell templates)
- XSS/Template injection risks
- localStorage password storage

**Use case:** Run before release; flag high-risk patterns for human review.

---

### **Refactoring Suggestions**

Identify code patterns that benefit from refactoring.

```bash
node copilot-delegate.js refactor src/components/Player.js
```

**Suggestions:**
- Extract repeated patterns into utility functions
- Convert single-line functions to arrow functions
- Simplify complex conditional logic
- Remove dead code

**Use case:** Improve code maintainability; reduce technical debt.

---

### **Performance Optimization**

Suggest performance improvements based on common anti-patterns.

```bash
node copilot-delegate.js optimize src/algorithms/search.js
```

**Checks:**
- Nested loops and quadratic complexity
- Repeated JSON parsing/stringifying
- Chained array operations (`.map().filter().reduce()`)
- Unmanaged timers and memory leaks

**Use case:** Identify optimization targets before profiling.

---

### **Generate Documentation**

Auto-extract function signatures and suggest documentation improvements.

```bash
node copilot-delegate.js docs src/services/VideoPlayer.js
```

**Output:**
- List of exported functions
- JSDoc template suggestions
- Parameter and return type hints

**Use case:** Kickstart API documentation; ensure critical functions are documented.

---

### **Validate Commits**

Pre-commit validation enforcing conventions and security standards.

```bash
node copilot-delegate.js validate
```

**Checks:**
- Conventional commit format (`feat:`, `fix:`, `docs:`, etc.)
- No hardcoded secrets in staged files
- Message length and format compliance

**Use case:** Git hook integration; prevent non-compliant commits.

---

## 🔧 Integration Examples

### **GitHub Actions Workflow**

```yaml
name: Copilot Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node copilot-delegate.js security
      - run: node copilot-delegate.js analyze src/index.js
```

### **Pre-Commit Hook**

```bash
#!/bin/bash
# .git/hooks/pre-commit
node copilot-delegate.js validate
if [ $? -ne 0 ]; then
  echo "❌ Commit validation failed"
  exit 1
fi
```

### **Developer Workflow**

```bash
# 1. Work on a feature
git checkout -b feat/retry-logic

# 2. Get refactoring suggestions
node copilot-delegate.js refactor src/api.js

# 3. Check for security issues
node copilot-delegate.js analyze src/api.js

# 4. Optimize performance
node copilot-delegate.js optimize src/api.js

# 5. Stage and validate
git add src/api.js
node copilot-delegate.js validate

# 6. Commit
git commit -m "feat: add exponential backoff retry logic"
```

---

## 📝 Prompt Templates for Copilot

Use these prompts with Copilot Chat (Ctrl+I) to amplify the CLI tools:

### **After Running `analyze`:**

```
I ran `node copilot-delegate.js analyze <file>` which found [X] issues. 
The main concerns are: [list findings]. 
Using your code analysis capabilities, help me fix these issues step-by-step. 
Focus on security first, then performance.
```

### **After Running `refactor`:**

```
The refactoring tool suggests: [findings]. 
Can you help me extract common patterns and apply arrow function conversions? 
Keep backward compatibility and add comments for each change.
```

### **For Performance Optimization:**

```
The performance analyzer found: [issues]. 
Write optimized versions of the slow functions. 
Include before/after benchmarks in comments.
```

### **For Documentation Generation:**

```
I have these functions needing documentation: [list]. 
Generate comprehensive JSDoc comments with parameter types, return types, 
and usage examples. Follow TypeScript-style annotations.
```

---

## 🚀 Advanced Usage

### **Batch Analysis**

Analyze multiple files and generate a report:

```bash
for file in src/**/*.js; do
  echo "=== $file ===" >> report.txt
  node copilot-delegate.js analyze "$file" >> report.txt 2>&1
done
```

### **Delegate Multi-Step Tasks**

```bash
# Break down a large refactor
node copilot-delegate.js delegate "Phase 1: Extract utility functions" src/utils.js
node copilot-delegate.js delegate "Phase 2: Update imports across codebase" src/components/ src/services/
node copilot-delegate.js delegate "Phase 3: Add comprehensive tests" tests/
```

### **Security-First Development**

```bash
# Before pushing to main
node copilot-delegate.js security
node copilot-delegate.js analyze src/api.js
node copilot-delegate.js validate

# If all pass:
git push origin feat/my-feature
```

---

## 📊 Output Examples

### **Security Audit Result**
```
🔒 Running Security Audit...

  ❌ src/auth.js: Hardcoded crypto keys
  ❌ src/exec.js: Potential command injection
  ⚠️  src/forms.js: Template injection risk

✅ Audit complete: 3 potential issue(s) found
```

### **Refactoring Suggestions**
```
♻️  Refactoring suggestions for src/player.js...

  1. Extract common pattern ".filter(" into utility function (appears 5 times)
  2. Convert 3 single-line function(s) to arrow functions
  3. Consolidate 2 identical error handlers

💡 Tip: Use Copilot Chat (Ctrl+I) to apply these suggestions
```

### **Performance Analysis**
```
⚡ Performance analysis for src/search.js...

  1. Chain multiple .map() calls; consider reducing to single iteration
  2. Ensure timers are cleared in cleanup functions (useEffect return)
  3. Cache parsed JSON objects instead of parsing repeatedly

Run: node copilot-delegate.js delegate "Optimize search algorithm" src/search.js
```

---

## 🤝 Feedback Loop

1. **Run CLI tool** → `node copilot-delegate.js analyze src/file.js`
2. **Review findings** → Check console output
3. **Delegate to Copilot** → `node copilot-delegate.js delegate "Fix issues in src/file.js" src/file.js`
4. **Copilot works** → Edit files, create PRs
5. **Validate** → `node copilot-delegate.js validate`
6. **Iterate** → Re-run analysis; monitor progress with `monitor`

---

## 🎓 Best Practices

- **Security First:** Always run `security` audit before production pushes
- **Incremental Delegation:** Break large tasks into smaller, focused delegations
- **Validate Early:** Use `validate` before committing to catch issues early
- **Iterate:** Combine multiple tools (analyze → refactor → optimize → docs)
- **Document:** Use `docs` command to keep API documentation in sync
- **Review:** Run analysis on PRs to maintain code quality standards

---

## 🔗 Related Files

- [copilot-delegate.js](../copilot-delegate.js) – CLI implementation
- [commit-validator.js](../commit-validator.js) – Commit validation logic
- [enhanced-agent-hub.js](../enhanced-agent-hub.js) – Agent orchestration
- [docs/ai/AI_AGENT_ORCHESTRATION.md](ai/AI_AGENT_ORCHESTRATION.md) – Agent architecture

---

## 📞 Support

For issues or feature requests:
- Check [AI_AGENT_ORCHESTRATION.md](../docs/ai/AI_AGENT_ORCHESTRATION.md)
- Review [commit-validator.js](../commit-validator.js) for validation rules
- Run `node copilot-delegate.js` (no args) for quick help
