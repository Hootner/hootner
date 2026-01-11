# GitHub Copilot Prompt Templates

This directory contains reusable prompt templates for common development tasks in the HOOTNER repository.

## Purpose

These templates provide structured, consistent prompts for GitHub Copilot to deliver high-quality results while:
- Reducing hallucinations
- Preventing scope creep
- Maintaining coding standards
- Ensuring security best practices
- Following conventional commits

## Available Templates

### 1. `task-template.prompt.md`
**General-purpose template** for any development task.

**Use when**: You have a custom task that doesn't fit other categories.

**Example usage in Copilot Chat**:
```
Use the task template.
Task: Add pagination to the video listing API
Goal: Support pagination with limit/offset parameters in GraphQL query
```

### 2. `fix-security.prompt.md`
**Security vulnerability fixes** with OWASP best practices.

**Use when**: Fixing security issues, CVEs, or improving security posture.

**Example usage in Copilot Chat**:
```
Use the security-fix template.
Task: Fix SQL injection vulnerability in user search
Files: #file:api/graphql/resolvers/user.js
```

### 3. `refactor.prompt.md`
**Code refactoring** without changing behavior.

**Use when**: Improving code quality, structure, or maintainability.

**Example usage in Copilot Chat**:
```
Use the refactor template.
Task: Extract duplicate validation logic from user and admin resolvers
Files: #file:api/graphql/resolvers/user.js #file:api/graphql/resolvers/admin.js
```

### 4. `add-feature.prompt.md`
**New feature implementation** with TDD approach.

**Use when**: Adding new functionality to the platform.

**Example usage in Copilot Chat**:
```
Use the add-feature template.
Task: Add rate limiting to GraphQL endpoint
Goal: Prevent abuse by limiting unauthenticated queries to 30/min per IP
Requirements: Use express-rate-limit, different limits for auth vs unauth
```

## How to Use

### Method 1: Direct Reference (Recommended)
Copy the template content into your Copilot Chat, then fill in the specific details:

```
[Paste template content]

Task: Your specific task here
Goal: What you want to achieve
Context: #file:specific/files.js
```

### Method 2: In Chat Reference
GitHub Copilot automatically includes `.github/copilot-instructions.md` in context. You can reference these templates:

```
Following the security-fix template in .github/prompts/, fix the XSS vulnerability in #file:api/middleware/sanitizer.js
```

### Method 3: VSCode/Editor
Drag the `.prompt.md` file into your Copilot Chat to include it as context, then specify your task.

## Best Practices

### 1. Be Specific with Context
Always include relevant files using `#file:path/to/file.js` or `#selection` for highlighted code:
```
Task: Fix authentication bug
Context: #file:api/middleware/auth.js #file:services/authentication/jwt-service.js
```

### 2. Use Acceptance Criteria
The templates include acceptance criteria checkboxes. Use them to verify completeness:
- [ ] Tests pass
- [ ] Lint checks pass
- [ ] No security vulnerabilities
- [ ] Documentation updated

### 3. Follow Conventional Commits
All templates enforce conventional commit format:
- `feat(module): add new feature`
- `fix(module): fix bug`
- `refactor(module): improve code`
- `docs(module): update documentation`
- `chore(module): maintenance task`

### 4. Keep Changes Focused
Maximum 4–6 files per task to maintain code review quality and reduce merge conflicts.

### 5. Test First
Write or update tests before or alongside implementation (TDD approach when applicable).

## Template Customization

You can customize these templates for your specific needs:

1. **Add project-specific requirements**: Edit templates to include your team's conventions
2. **Add new templates**: Create new `.prompt.md` files for recurring tasks
3. **Update examples**: Add examples from your actual codebase

## Related Files

- **`.github/copilot-instructions.md`**: Main Copilot instructions (automatically included in all chats)
- **`.github/copilot-settings.yml`**: Copilot configuration
- **`.github/copilot-agent.md`**: Custom agent configuration
- **`docs/AI_AGENT_ORCHESTRATION.md`**: Multi-agent system documentation

## Quick Commands Reference

```bash
# Run tests
npm test

# Lint and fix
npm run lint:fix

# Security audit
npm run security:audit

# Format code
npm run format

# Start development
npm run dev

# Start all services
npm run start:all
```

## Support

For questions or suggestions about these templates:
1. Review `.github/copilot-instructions.md` for coding standards
2. Check `docs/AI_AGENT_ORCHESTRATION.md` for architecture guidance
3. Create an issue in the repository

---

**Pro Tip**: Keep your prompts focused and iterative. It's better to make small, tested changes than large, risky ones.
