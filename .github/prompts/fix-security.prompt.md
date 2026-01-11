# Task: Security Vulnerability Fix

## Goal
Identify and fix security vulnerabilities in the codebase while maintaining existing functionality.

## Requirements / Constraints
- Must work with existing architecture: Node.js 18+, Express, GraphQL, MongoDB/PostgreSQL
- Use only existing dependencies (no new packages unless security-approved)
  - Already available: `helmet`, `xss`, `express-rate-limit`, `bcrypt`, `jsonwebtoken`
- Keep changes focused: maximum 4–6 files
- Preserve existing behavior unless explicitly stated
- Add/update tests for all new/changed logic
- Follow project coding standards (see copilot-instructions.md)
- Run `npm audit` before and after changes

## Security Focus Areas
Common vulnerability types to check for:
- **Injection attacks**: SQL injection, NoSQL injection, command injection
- **XSS (Cross-Site Scripting)**: Sanitize all user input using `xss` package
- **Authentication/Authorization**: Validate JWT tokens properly, check user permissions
- **Rate limiting**: Use `express-rate-limit` for API endpoints
- **Secrets management**: Never commit secrets, use environment variables
- **Dependencies**: Update vulnerable packages, check `npm audit`
- **Input validation**: Validate and sanitize all external input
- **HTTPS/TLS**: Ensure secure connections in production
- **Security headers**: Use `helmet` middleware for Express apps

## Context / Files to Consider
Primary files to review (uncomment and add specific files):
<!-- 
- #file:api/graphql/resolvers/user.js
- #file:api/middleware/auth.js
- #file:services/authentication/jwt-service.js
- #file:hexarchy/7-data/storage/database-manager.js
-->

Related configuration:
- #file:.github/copilot-instructions.md
- Environment variables: `.env.example` (never modify `.env`)

## Acceptance Criteria
- [ ] Code passes lint + type check (`npm run lint:fix`)
- [ ] `npm audit` shows 0 high/critical vulnerabilities
- [ ] All new code is covered by tests
- [ ] Security vulnerability is documented in PR description
- [ ] Commit messages follow Conventional Commits (`fix(security): ...`)
- [ ] No regressions in existing functionality (`npm test`)
- [ ] Changes reviewed for common OWASP Top 10 vulnerabilities

## Examples

### Example 1: SQL Injection Fix
**Before (vulnerable):**
```javascript
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
db.query(query);
```

**After (secure):**
```javascript
const query = 'SELECT * FROM users WHERE email = $1';
db.query(query, [userEmail]);
```

### Example 2: XSS Protection
**Before (vulnerable):**
```javascript
res.send(`<h1>Welcome ${username}</h1>`);
```

**After (secure):**
```javascript
import xss from 'xss';
const cleanUsername = xss(username);
res.send(`<h1>Welcome ${cleanUsername}</h1>`);
```

### Example 3: Rate Limiting
**Before (no protection):**
```javascript
app.post('/api/login', loginHandler);
```

**After (rate limited):**
```javascript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

app.post('/api/login', loginLimiter, loginHandler);
```

## Steps to Execute
1. Run `npm audit` to identify current vulnerabilities
2. Review the code for security issues (check files listed in Context section)
3. Implement fixes following the examples above
4. Run tests: `npm test`
5. Run security audit again: `npm audit`
6. Document the vulnerability and fix in commit message

---

Now implement this task following all instructions above.
If anything is unclear — ask me before proceeding.
