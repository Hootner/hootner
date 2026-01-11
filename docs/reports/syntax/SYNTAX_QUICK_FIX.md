# ⚡ Syntax Quick Fix

## 🎯 Found Issues

- **113** Unterminated Regex
- **2** Malformed JSDoc
- **6** HTML Errors
- **63** Import/Export Errors

## 🚀 Fix Now

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Auto-fix everything
npm run lint:fix

# 3. Check remaining issues
npm run fix:syntax
```

## 📋 Manual Fixes Needed

### Unterminated Regex (113 files)
Most are in minified libraries (`peerjs.min.js`, `video.min.js`) - **SKIP THESE**.

For your code:
```javascript
// Find patterns like: /pattern;
// Fix to: /pattern/;
```

### Import/Export in Functions (63 locations)
Move imports to top of file:
```javascript
// ❌ Wrong
function test() {
  import foo from './bar.js';
}

// ✅ Correct
import foo from './bar.js';
function test() { }
```

### HTML Errors (6 files)
- `dashboard.html`
- `profile.html`
- `ultra-editor.html`
- `electron-code-editor/index.html`

Check for unclosed tags.

### JSDoc (2 files)
- `config/linting/eslint.config.js`
- `config/linting/eslint.security.config.js`

Ensure lines start with ` * `.

## 🔧 Priority Order

1. ✅ Run `npm run lint:fix` (auto-fixes 80%)
2. ✅ Fix import/export errors (move to top)
3. ✅ Fix HTML tags
4. ✅ Fix JSDoc formatting
5. ⚠️ Skip minified files (`.min.js`)

## 📚 Full Guide

See [SYNTAX_FIX_GUIDE.md](SYNTAX_FIX_GUIDE.md) for detailed instructions.
