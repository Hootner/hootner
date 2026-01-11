# Updated Package.json Scripts for Framework Paths

Update your package.json scripts section to use the new framework paths:

```json
{
  "scripts": {
    "test": "vitest --config frameworks/testing/vitest/vitest.config.mjs",
    "test:unit": "vitest --config frameworks/testing/vitest/vitest.config.ts", 
    "test:e2e": "playwright test --config frameworks/testing/playwright/playwright.config.js",
    "test:e2e:cjs": "playwright test --config frameworks/testing/playwright/playwright.config.cjs",
    "lint": "eslint --config frameworks/frontend/linting/eslint.config.js .",
    "lint:security": "eslint --config frameworks/frontend/linting/eslint.security.config.js .",
    "lint:frontend": "eslint --config frameworks/frontend/linting/frontend-eslint.config.js apps/frontend/",
    "format": "prettier --config frameworks/frontend/prettier/.prettierrc --ignore-path frameworks/frontend/prettier/.prettierignore --write .",
    "format:check": "prettier --config frameworks/frontend/prettier/.prettierrc.json --check ."
  }
}
```

## Files Moved Successfully:

### Testing Frameworks
- ✅ `vitest.config.mjs` → `frameworks/testing/vitest/`
- ✅ `vitest.config.ts` → `frameworks/testing/vitest/`
- ✅ `playwright.config.js` → `frameworks/testing/playwright/`
- ✅ `playwright.config.cjs` → `frameworks/testing/playwright/`

### Linting Framework
- ✅ `eslint.config.js` → `frameworks/frontend/linting/`
- ✅ `eslint.security.config.js` → `frameworks/frontend/linting/`
- ✅ `frontend-eslint.config.js` → `frameworks/frontend/linting/`
- ✅ `.eslintignore` → `frameworks/frontend/linting/`
- ✅ `.eslintrc.json` → `frameworks/frontend/linting/`

### Prettier Framework
- ✅ `.prettierrc` → `frameworks/frontend/prettier/`
- ✅ `.prettierignore` → `frameworks/frontend/prettier/`
- ✅ `.prettierrc.json` → `frameworks/frontend/prettier/`

## Next Steps:
1. Update package.json scripts (copy from above)
2. Test that linting and formatting still work
3. Proceed to Phase 3: Backend Frameworks