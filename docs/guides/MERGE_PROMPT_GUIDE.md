# 🔀 Merge Commit Prompt - Quick Guide

## Usage

```bash
# Generate prompt
npm run commit:merge
# or
node copilot-merge-prompt.js
```

## Workflow

1. **Run the tool** → Analyzes commits & files
2. **Copy the output** → Structured prompt generated
3. **Paste to Copilot** → Press `Ctrl+Shift+I` in VS Code
4. **Get message** → Professional merge commit created
5. **Commit** → `git commit -m "message"`

## Example Output

```
Generate a merge commit message for merging feature/auth into main.

Summary of changes:
- abc1234 Add JWT authentication
- def5678 Implement user login
- ghi9012 Add password hashing

Files modified (8 total):
- api/auth.js
- middleware/jwt.js
- models/User.js

Format:
Merge: [Brief summary]
- Key change 1
- Key change 2
- Key change 3
```

## Integration

Works with existing `copilot-delegate.js` commands:

- `analyze` - Code review
- `security` - Security scan
- `validate` - Commit validation
- `merge` - This tool

## Requirements Met

✅ Conventional commit format (feat/fix/refactor/chore/docs)
✅ 1-2 line summary
✅ 3-5 bullet points
✅ Under 10 lines
✅ Professional enterprise tone
