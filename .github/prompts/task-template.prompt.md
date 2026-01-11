# Task: [brief one-line description of what you want]

## Goal
[Clearly state the desired end result in 1–2 sentences]

Example: Update the authentication middleware to support OAuth2 providers in addition to JWT tokens.

## Requirements / Constraints
- Must work with existing architecture: [briefly describe relevant parts, e.g. GraphQL resolvers, Express middleware, hexarchy structure, etc.]
- Use only existing dependencies (no new packages unless security-approved)
  - Currently available: express, cors, helmet, graphql, mongoose, pg, redis, bcrypt, jsonwebtoken, xss, express-rate-limit, stripe
- Keep changes focused: maximum 4–6 files
- Preserve existing behavior unless explicitly stated
- Add/update tests for all new/changed logic
- Follow project coding standards (see copilot-instructions.md)

## Context / Files to Consider
Primary files (add #file: references to specific files you want to review):
<!--
- #file:path/to/file1.js
- #file:path/to/file2.js
- #file:enhanced-agent-hub.js
- #file:orchestration/index.js
- #selection (if you highlighted specific code)
-->

Related documentation:
- #file:.github/copilot-instructions.md
- See also: docs/AI_AGENT_ORCHESTRATION.md, README.md

Architecture notes:
- Hexarchy structure: Code is organized in 8 layers (hexarchy/)
  - 1-foundation: Core infrastructure, containers
  - 2-intelligence: AI and ML services
  - 3-governance: Compliance, security, policies
  - 4-society: User management, social features
  - 5-economy: Business logic, commerce, payments
  - 6-culture: Content management, media
  - 7-data: Data storage, databases
  - 8-operations: Monitoring, deployment, DevOps
- ES modules are primary (import/export), some legacy CommonJS (.cjs)
- Agent pattern: agents in `frameworks/ai/agents/` expose initialize(), processRequest(), getStatus()

## Acceptance Criteria
- [ ] Code passes lint + type check (`npm run lint:fix`)
- [ ] `npm audit` shows 0 high/critical vulnerabilities
- [ ] All new code is covered by tests
- [ ] Commit messages follow Conventional Commits (feat/fix/docs/refactor/chore)
- [ ] No regressions in existing functionality (`npm test`)
- [ ] Changes are minimal and focused
- [ ] Documentation updated if needed

## Examples (if helpful)

### Before (current state):
```javascript
// Example of current code or API
export function oldImplementation() {
  // ...
}
```

### After (desired state):
```javascript
// Example of how you want it to look
export function newImplementation() {
  // Improved with...
}
```

## Additional Context
[Add any additional information that would help understand the task]
- Background: [Why is this needed?]
- Related issues: [Link to GitHub issues if applicable]
- Dependencies: [Other tasks that must be completed first]
- Risks: [Potential issues to watch out for]

## Steps to Execute
1. Review the context and understand current implementation
2. Identify files that need changes
3. Write or update tests first (if applicable)
4. Make incremental changes
5. Run tests after each change: `npm test`
6. Run lint: `npm run lint:fix`
7. Verify changes manually if applicable
8. Document changes in commit message

## Technical Notes
[Add any technical details, API endpoints, data structures, etc.]

---

## Quick Reference Commands
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run specific test file
npm test -- path/to/test.test.js

# Lint and auto-fix
npm run lint:fix

# Format code
npm run format

# Security audit
npm run security:audit

# Start development server
npm run dev

# Start all services
npm run start:all
```

---

Now implement this task following all instructions above.
If anything is unclear — ask me before proceeding.
