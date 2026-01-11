# Todo Tree Keyboard Shortcuts & Commands

## 🎯 Quick Access

### Open Todo Tree
- **Activity Bar**: Click Todo Tree icon (left sidebar)
- **Command Palette**: `Ctrl+Shift+P` → "Todo Tree: Focus on Todo Tree View"

## ⌨️ Essential Commands

### Tag Management
```
Ctrl+Shift+P → "Todo Tree: Add Tag"
Ctrl+Shift+P → "Todo Tree: Remove Tag"
```

### View Controls
```
Ctrl+Shift+P → "Todo Tree: Expand Tree"
Ctrl+Shift+P → "Todo Tree: Collapse Tree"
Ctrl+Shift+P → "Todo Tree: Refresh"
```

### Scope Switching
```
Ctrl+Shift+P → "Todo Tree: Switch Scope"
```
Choose from:
- Frontend
- Backend Services
- Infrastructure
- Security Only
- Documentation
- All

### Export & Reports
```
Ctrl+Shift+P → "Todo Tree: Export Tree"
```

### Filter
```
Ctrl+Shift+P → "Todo Tree: Filter Tree"
Ctrl+Shift+P → "Todo Tree: Clear Filter"
```

### Navigation
```
Ctrl+Shift+P → "Todo Tree: Go To Next"
Ctrl+Shift+P → "Todo Tree: Go To Previous"
```

## 🖱️ Tree View Actions

### Right-Click Menu
- Hide This Folder
- Only Show This Folder
- Only Show This Folder And Subfolders
- Reset Folder Filter
- Toggle Badges
- Toggle Compact Folders
- Toggle Item Counts
- Scan Open Files Only
- Scan Current File Only
- Scan Workspace And Open Files
- Scan Workspace Only
- Expand Tree / Collapse Tree
- Show Tree View / Show Flat View / Show Tags Only View
- Group by Tag / Ungroup by Tag
- Group by Sub Tag / Ungroup by Sub Tag
- Export Tree
- Reveal Current File in Tree

### Toolbar Buttons
- 🔄 Refresh
- 📤 Export
- 🔍 Filter
- 🏷️ Group by Tag
- 📁 View Style (Tree/Flat/Tags)
- 🔭 Reveal Current File
- 📊 Scan Mode

## 💻 Terminal Commands

### Scan Workspace
```bash
npm run todos:scan
```

### View Report
```bash
# Windows
type TODO_REPORT.md

# Unix/Mac
cat TODO_REPORT.md
```

### Open in Editor
```bash
code TODO_REPORT.md
```

## 🎨 Custom Keybindings (Optional)

Add to `keybindings.json` (File → Preferences → Keyboard Shortcuts → Open Keyboard Shortcuts JSON):

```json
[
  {
    "key": "ctrl+alt+t",
    "command": "todo-tree.focusTreeView"
  },
  {
    "key": "ctrl+alt+r",
    "command": "todo-tree.refresh"
  },
  {
    "key": "ctrl+alt+f",
    "command": "todo-tree.filterTree"
  },
  {
    "key": "ctrl+alt+e",
    "command": "todo-tree.exportTree"
  },
  {
    "key": "ctrl+alt+n",
    "command": "todo-tree.goToNext"
  },
  {
    "key": "ctrl+alt+p",
    "command": "todo-tree.goToPrevious"
  }
]
```

## 🔍 Search in Files

### Find All TODOs
```
Ctrl+Shift+F
Search: TODO|FIXME|BUG|SECURITY
```

### Find Specific Tag
```
Ctrl+Shift+F
Search: SECURITY:
```

### Find by Assignee
```
Ctrl+Shift+F
Search: TODO\(john\):
```

## 📝 Quick TODO Creation

### Add TODO Comment
```javascript
// TODO: Your task description
```

### Add with Assignee
```javascript
// FIXME(username): Description
```

### Add with Issue Link
```javascript
// BUG: Description - Issue #123
```

### Add with Priority
```javascript
// SECURITY: Critical security issue!
```

## 🎯 Workflow Shortcuts

### Daily Review
1. `Ctrl+Shift+P` → "Todo Tree: Focus on Todo Tree View"
2. Click "Group by Tag" button
3. Expand SECURITY and BUG sections
4. Review critical items

### Before Commit
1. `Ctrl+Shift+F` → Search for your name in TODOs
2. Review your assigned items
3. Update or complete before committing

### Sprint Planning
1. Run `npm run todos:scan`
2. Open `TODO_REPORT.md`
3. Review summary by tag
4. Create GitHub issues for major items

## 🚀 Pro Tips

### Quick Navigation
- Click any TODO in tree → Jumps to code
- `Alt+←` → Go back to previous location
- `Alt+→` → Go forward

### Multi-File Search
- `Ctrl+Shift+F` → Search across all files
- Use regex: `(TODO|FIXME|BUG):`
- Filter by file type: `*.js`

### Status Bar
- Click status bar count → Cycles through display modes
- Shows: Total / Per Tag / Top 3 / Current File

### Activity Bar Badge
- Shows total TODO count
- Updates in real-time
- Click to open Todo Tree

## 📊 Reporting Shortcuts

### Generate Report
```bash
npm run todos:scan
```

### View Statistics
```bash
# Windows
findstr /C:"Summary by Tag" TODO_REPORT.md

# Unix/Mac
grep -A 20 "Summary by Tag" TODO_REPORT.md
```

### Count by Tag
```bash
# Windows
findstr /C:"SECURITY:" TODO_REPORT.md | find /C ":"

# Unix/Mac
grep -c "SECURITY:" TODO_REPORT.md
```

## 🎨 Visual Customization

### Change Theme
```
Ctrl+K Ctrl+T → Select Color Theme
```
Choose a theme with good TODO visibility

### Adjust Font Size
```
Ctrl+= (Increase)
Ctrl+- (Decrease)
Ctrl+0 (Reset)
```

### Toggle Sidebar
```
Ctrl+B (Toggle sidebar)
```

## 🔧 Settings Shortcuts

### Open Settings
```
Ctrl+, (Settings UI)
Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
```

### Search Settings
```
Ctrl+, → Type "todo-tree"
```

### Reset Settings
```
Ctrl+Shift+P → "Todo Tree: Reset Configuration"
```

## 📚 Help & Documentation

### Extension Documentation
```
Ctrl+Shift+P → "Todo Tree: Show Documentation"
```

### View Extension Details
```
Ctrl+Shift+X → Search "Todo Tree" → Click extension
```

### Report Issues
```
Ctrl+Shift+P → "Todo Tree: Report Issue"
```

---

## 🎯 Most Used Commands (Top 10)

1. **Focus Tree**: `Ctrl+Shift+P` → "Todo Tree: Focus"
2. **Refresh**: Click refresh button or `Ctrl+Shift+P` → "Refresh"
3. **Filter**: Click filter button in toolbar
4. **Group by Tag**: Click tag button in toolbar
5. **Export**: Click export button or `Ctrl+Shift+P` → "Export"
6. **Switch Scope**: `Ctrl+Shift+P` → "Switch Scope"
7. **Scan**: `npm run todos:scan` in terminal
8. **Search**: `Ctrl+Shift+F` → "TODO|FIXME|BUG"
9. **Navigate**: Click TODO in tree
10. **Add Tag**: `Ctrl+Shift+P` → "Add Tag"

---

**Remember**: Customize these shortcuts to match your workflow!

🦉 **The Owl Never Sleeps** - Stay productive with keyboard shortcuts!
