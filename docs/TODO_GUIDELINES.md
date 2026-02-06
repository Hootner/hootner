# HOOTNER TODO Guidelines

## Overview

This document defines the TODO comment standards for the HOOTNER project.

## Supported Tags

### Critical Priority

- **SECURITY** - Security vulnerabilities or concerns

  ```javascript
  // SECURITY: Validate user input to prevent XSS
  ```

- **BUG** - Confirmed bugs that need fixing

  ```javascript
  // BUG: Memory leak in video player cleanup
  ```

- **FIXME** - Broken code that needs immediate attention
  ```javascript
  // FIXME: API endpoint returns 500 on invalid token
  ```

### High Priority

- **PERFORMANCE** - Performance optimization needed

  ```javascript
  // PERFORMANCE: Cache database queries
  ```

- **REFACTOR** - Code needs restructuring

  ```javascript
  // REFACTOR: Extract duplicate logic to shared utility
  ```

- **DEPRECATED** - Code scheduled for removal
  ```javascript
  // DEPRECATED: Use newFunction() instead (remove in v2.0)
  ```

### Medium Priority

- **TODO** - General tasks to complete

  ```javascript
  // TODO: Add error handling for edge cases
  ```

- **OPTIMIZE** - Code works but can be improved

  ```javascript
  // OPTIMIZE: Reduce bundle size by lazy loading
  ```

- **REVIEW** - Needs code review or validation
  ```javascript
  // REVIEW: Check if this approach is correct
  ```

### Low Priority

- **HACK** - Temporary workaround

  ```javascript
  // HACK: Temporary fix until library is updated
  ```

- **CLEANUP** - Code cleanup needed

  ```javascript
  // CLEANUP: Remove unused imports
  ```

- **NOTE** - Important information

  ```javascript
  // NOTE: This function is called by external service
  ```

- **DOCS** - Documentation needed

  ```javascript
  // DOCS: Add JSDoc comments
  ```

- **TEST** - Tests needed
  ```javascript
  // TEST: Add unit tests for error scenarios
  ```

## Format

```
// TAG: Description
// TAG(assignee): Description
// TAG: Description - Issue #123
```

## Examples

```javascript
// SECURITY: Sanitize user input before database query
// BUG(john): Race condition in payment processing - Issue #456
// TODO: Implement retry logic with exponential backoff
// PERFORMANCE: Add Redis caching layer
// REFACTOR: Split this 500-line file into modules
// DEPRECATED: Remove legacy API v1 endpoints by Q2 2025
```

## Markdown Tasks

```markdown
- [ ] Implement user authentication
- [x] Set up CI/CD pipeline
- [ ] Write API documentation
```

## Best Practices

1. **Be Specific** - Describe what needs to be done
2. **Add Context** - Link to issues, PRs, or documentation
3. **Assign Owner** - Use (name) for accountability
4. **Set Deadlines** - Add dates for time-sensitive items
5. **Update Status** - Remove or update completed TODOs

## Viewing TODOs

### VS Code Todo Tree Extension

1. Install "Todo Tree" extension
2. View in Activity Bar (left sidebar)
3. Click items to navigate to code
4. Use filters and scopes for focused views

### Command Line

```bash
# Scan and generate report
node scripts/scan-todos.js

# View report
cat TODO_REPORT.md
```

### NPM Scripts

```bash
# Scan workspace
npm run todos:scan

# Export to file
npm run todos:export
```

## Integration

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
node scripts/scan-todos.js
git add TODO_REPORT.md
```

### CI/CD

Add to GitHub Actions workflow:

```yaml
- name: Scan TODOs
  run: node scripts/scan-todos.js

- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: todo-report
    path: TODO_REPORT.md
```

## Scopes

Use Todo Tree scopes to filter by area:

- **Frontend** - React/UI components
- **Backend Services** - Microservices
- **Infrastructure** - K8s/Docker configs
- **Security Only** - Security-related items
- **Documentation** - Docs and markdown files

Switch scopes: `Ctrl+Shift+P` → "Todo Tree: Switch Scope"

## Maintenance

- Review TODOs weekly in team meetings
- Archive completed items
- Prioritize SECURITY and BUG tags
- Convert long-standing TODOs to GitHub Issues

---

**Remember**: TODOs are temporary. Convert important items to tracked issues!
