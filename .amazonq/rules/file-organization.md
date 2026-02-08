# File Organization Rules for AI Agents

## 🚨 CRITICAL: Single Source of Truth

**ALL frontend HTML pages MUST go in ONE location:**
```
apps/frontend/html-pages/
```

**DO NOT create files in:**
- ❌ `src/frontend/pages/`
- ❌ `heptagonal/4-interface/ui/pages/`
- ❌ `apps/frontend/public/`
- ❌ Any other location

## 📁 File Location Rules

### Frontend Files
- **HTML pages:** `apps/frontend/html-pages/*.html`
- **React components:** `apps/frontend/src/components/`
- **Styles:** `apps/frontend/src/styles/`
- **Assets:** `apps/frontend/public/assets/`

### Backend Files
- **API routes:** `api/routes/`
- **GraphQL:** `api/graphql/`
- **Lambda:** `api/lambda/`
- **Services:** `services/`

### Architecture Files
- **Core logic:** `heptagonal/[0-8]-[layer]/`
- **AI agents:** `heptagonal/2-intelligence/ai-services/agents/`
- **Scripts:** `scripts/`

## ⚠️ Before Creating ANY File

1. **Check if it exists:** Search entire repo first
2. **Use correct location:** Follow rules above
3. **Don't duplicate:** If file exists, edit it instead
4. **Ask if unsure:** Better to ask than create duplicate

## 🔍 How to Check for Existing Files

```bash
# Search for file by name
git ls-files | grep "filename.html"

# Or use find
find . -name "filename.html" -not -path "*/node_modules/*"
```

## 🚫 NEVER Do This

```bash
# ❌ WRONG - Creating duplicate
cp apps/frontend/html-pages/dashboard.html src/frontend/pages/

# ❌ WRONG - Creating in wrong location
touch heptagonal/4-interface/ui/pages/new-page.html

# ❌ WRONG - Not checking if exists first
echo "content" > apps/frontend/html-pages/login.html
```

## ✅ ALWAYS Do This

```bash
# ✅ CORRECT - Check first
git ls-files | grep "dashboard.html"

# ✅ CORRECT - Create in right location
touch apps/frontend/html-pages/new-page.html

# ✅ CORRECT - Edit existing file
code apps/frontend/html-pages/dashboard.html
```

## 🎯 Architecture Decision

**Decision:** Use `heptagonal/` (NOT `hexarchy/`)
**Rationale:** 9 layers (0-8) = heptagonal architecture
**Status:** FINAL - DO NOT CHANGE

## 📋 Checklist Before Committing

- [ ] No duplicate files created
- [ ] Files in correct location per rules above
- [ ] Checked for existing files first
- [ ] Ran `npm run check-duplicates`
- [ ] Updated imports if moved files
- [ ] Deleted old files if refactoring

## 🤖 For AI Agents

**You MUST:**
1. Read this file before creating ANY file
2. Search for existing files before creating new ones
3. Follow location rules strictly
4. Ask human if location is unclear
5. Never create duplicates

**You MUST NOT:**
1. Create files in multiple locations
2. Copy files "for convenience"
3. Create backup copies
4. Ignore these rules
5. Assume file doesn't exist without checking
