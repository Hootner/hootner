# Task: Code Refactoring

## Goal
Improve code quality, maintainability, and structure without changing external behavior.

## Requirements / Constraints
- Must work with existing architecture: HOOTNER video streaming platform (hexarchy structure)
- Use only existing dependencies (no new packages)
- Keep changes focused: maximum 4–6 files per refactor session
- Preserve existing behavior and API contracts
- Add/update tests for all new/changed logic
- Follow project coding standards (see copilot-instructions.md)
- Use Plan Agent pattern for large refactors (see `docs/AI_AGENT_ORCHESTRATION.md`)

## Refactoring Types
Common refactoring patterns to consider:
- **Extract Function**: Break down large functions into smaller, reusable pieces
- **Rename Variable/Function**: Improve clarity and consistency
- **Remove Duplication**: DRY principle - extract common code
- **Simplify Conditionals**: Use early returns, guard clauses
- **ES Module Conversion**: Convert CommonJS to ES modules where appropriate
- **Error Handling**: Add proper try-catch blocks with specific error handling
- **Code Organization**: Move code to appropriate hexarchy layers
- **Performance**: Optimize loops, reduce unnecessary operations
- **Modern Syntax**: Use optional chaining (??), nullish coalescing (?.), async/await

## Context / Files to Consider
Primary files to refactor (uncomment and add specific files):
<!--
- #file:enhanced-agent-hub.js
- #file:orchestration/index.js
- #file:frameworks/ai/agents/[agent-name].js
- #file:hexarchy/[layer]/[module].js
-->

Related documentation:
- #file:.github/copilot-instructions.md
- #file:docs/AI_AGENT_ORCHESTRATION.md
- Hexarchy structure: `hexarchy/` directories (1-foundation through 8-operations)

## Acceptance Criteria
- [ ] Code passes lint + type check (`npm run lint:fix`)
- [ ] All tests pass (`npm test`)
- [ ] No behavioral changes (external APIs remain the same)
- [ ] Code coverage maintained or improved
- [ ] Commit messages follow Conventional Commits (`refactor(module): ...`)
- [ ] Documentation updated if public APIs changed
- [ ] Performance benchmarks maintained or improved (if applicable)

## Examples

### Example 1: Extract Function
**Before (monolithic):**
```javascript
export async function processUserData(userId) {
  const user = await db.findUser(userId);
  if (!user) throw new Error('User not found');
  
  const isValid = user.email && user.email.includes('@') && user.email.length > 5;
  if (!isValid) throw new Error('Invalid email');
  
  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetExpiry = Date.now() + 3600000;
  await user.save();
  
  return token;
}
```

**After (refactored):**
```javascript
function validateEmail(email) {
  return email && email.includes('@') && email.length > 5;
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setResetToken(user, token) {
  user.resetToken = token;
  user.resetExpiry = Date.now() + 3600000;
}

export async function processUserData(userId) {
  const user = await db.findUser(userId);
  if (!user) throw new Error('User not found');
  
  if (!validateEmail(user.email)) {
    throw new Error('Invalid email');
  }
  
  const token = generateResetToken();
  setResetToken(user, token);
  await user.save();
  
  return token;
}
```

### Example 2: Simplify Conditionals
**Before (nested):**
```javascript
function canAccessResource(user, resource) {
  if (user) {
    if (user.isActive) {
      if (user.role === 'admin') {
        return true;
      } else if (user.role === 'editor' && resource.type === 'document') {
        return true;
      }
    }
  }
  return false;
}
```

**After (guard clauses):**
```javascript
function canAccessResource(user, resource) {
  if (!user || !user.isActive) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'editor' && resource.type === 'document') return true;
  return false;
}
```

### Example 3: Modern Syntax
**Before (verbose):**
```javascript
function getUserName(user) {
  let name = 'Guest';
  if (user && user.profile && user.profile.name) {
    name = user.profile.name;
  }
  return name;
}
```

**After (modern):**
```javascript
function getUserName(user) {
  return user?.profile?.name ?? 'Guest';
}
```

## Steps to Execute
1. Identify the code that needs refactoring
2. Write/verify tests for current behavior
3. Make incremental refactoring changes
4. Run tests after each change: `npm test`
5. Run lint: `npm run lint:fix`
6. Verify no behavioral changes
7. Document changes in commit message

## For Large Refactors
If refactoring spans multiple modules or files:
1. Use the Plan Agent pattern (break into steps)
2. Use refactoring utilities in `scripts/refactoring/` if available
3. Create incremental commits (one logical change per commit)
4. Run full test suite between major steps
5. Consider creating a feature branch for review

---

Now implement this task following all instructions above.
If anything is unclear — ask me before proceeding.
