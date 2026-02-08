# 🚨 QUICK REFERENCE: Prevent Duplicates

## Before Creating ANY File:

### 1. Check if it exists:
```bash
git ls-files | grep "filename"
```

### 2. Use correct location:
- HTML pages → `apps/frontend/html-pages/`
- React → `apps/frontend/src/components/`
- API → `api/routes/`
- Scripts → `scripts/`

### 3. NEVER create in:
- ❌ `src/frontend/pages/`
- ❌ `heptagonal/4-interface/ui/pages/`
- ❌ `apps/frontend/public/*.html`

## Before Committing:

```bash
npm run check-duplicates
```

## If Duplicates Found:

```bash
node scripts/cleanup-duplicates.js
# Review output, consolidate, delete duplicates
```

## Architecture:

- ✅ Use `heptagonal/` (9 layers: 0-8)
- ❌ Never use `hexarchy/`

## Rules:

1. **One location per file type**
2. **Check before creating**
3. **No duplicates ever**
4. **AI needs oversight**

---

**Full Guide:** `docs/PREVENTION_GUIDE.md`  
**AI Rules:** `.amazonq/rules/file-organization.md`
