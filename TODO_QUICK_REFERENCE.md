# Todo Tree Quick Reference

## 🚀 Quick Start

1. **Install Extension**: Search "Todo Tree" in VS Code Extensions
2. **View TODOs**: Click Todo Tree icon in Activity Bar (left sidebar)
3. **Navigate**: Click any TODO to jump to code

## 🏷️ HOOTNER Tags

| Tag | Priority | Icon | Use Case |
|-----|----------|------|----------|
| **SECURITY** | Critical | 🛡️ | Security vulnerabilities |
| **BUG** | Critical | 🐛 | Confirmed bugs |
| **FIXME** | Critical | 🔧 | Broken code |
| **PERFORMANCE** | High | ⚡ | Performance issues |
| **REFACTOR** | High | 📝 | Code restructuring |
| **DEPRECATED** | High | ❌ | Code to remove |
| **TODO** | Medium | ✅ | General tasks |
| **OPTIMIZE** | Medium | 🚀 | Improvements |
| **REVIEW** | Medium | 👁️ | Needs review |
| **HACK** | Low | ⚠️ | Temporary workaround |
| **CLEANUP** | Low | 🗑️ | Code cleanup |
| **NOTE** | Low | 📌 | Important info |
| **DOCS** | Low | 📚 | Documentation |
| **TEST** | Low | 🧪 | Tests needed |

## 📝 Syntax

```javascript
// TODO: Add error handling
// SECURITY: Validate user input
// BUG(john): Memory leak - Issue #123
// FIXME: API returns 500
// PERFORMANCE: Cache this query
```

```markdown
- [ ] Incomplete task
- [x] Completed task
```

## ⌨️ Keyboard Shortcuts

- `Ctrl+Shift+P` → "Todo Tree: Add Tag"
- `Ctrl+Shift+P` → "Todo Tree: Switch Scope"
- `Ctrl+Shift+P` → "Todo Tree: Export Tree"

## 🎯 Scopes

Switch between filtered views:

- **Frontend** - React/UI code
- **Backend Services** - Microservices
- **Infrastructure** - K8s/Docker
- **Security Only** - Critical items
- **Documentation** - Docs/markdown
- **All** - Everything

## 🔍 Filters

Right-click in tree:
- Hide This Folder
- Only Show This Folder
- Reset Folder Filter
- Toggle Badges
- Toggle Item Counts

## 📊 Status Bar

Shows total count or per-tag counts. Click to cycle views.

## 🛠️ Commands

```bash
# Scan and generate report
npm run todos:scan

# View report
cat TODO_REPORT.md
```

## 📈 Current Stats

- **Total**: 368 items
- **SECURITY**: 110 (Critical!)
- **TEST**: 144
- **PERFORMANCE**: 31
- **REVIEW**: 14
- **CLEANUP**: 14
- **TODO**: 14
- **REFACTOR**: 12
- **OPTIMIZE**: 12

## 🎨 Color Coding

- 🔴 Red - SECURITY, BUG
- 🟠 Orange - FIXME, HACK
- 🟡 Yellow - TODO, REVIEW
- 🟢 Green - PERFORMANCE, TEST
- 🔵 Blue - NOTE, DOCS
- 🟣 Purple - REFACTOR
- 🟤 Brown - DEPRECATED
- ⚫ Gray - CLEANUP

## 💡 Tips

1. **Group by Tag** - Click tag icon in toolbar
2. **Expand All** - Click expand icon
3. **Export** - Click export icon for report
4. **Filter** - Click filter icon to search
5. **Scan Mode** - Toggle workspace/open files/current file

## 🔗 Links

- [Full Guidelines](docs/TODO_GUIDELINES.md)
- [TODO Report](TODO_REPORT.md)
- [Extension Docs](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)

---

**Pro Tip**: Use `Ctrl+K Ctrl+T` to change color theme for better TODO visibility!
