# TODO Extensions Setup - HOOTNER

## 📦 Two Extensions Configured

### 1. Todo Tree
- **Purpose**: Tree view in sidebar showing all TODOs
- **Features**: Navigation, filtering, scopes, export
- **Install**: Search "Todo Tree" by Gruntfuggly

### 2. TODO Highlight  
- **Purpose**: Inline highlighting in code editor
- **Features**: Color-coded tags, overview ruler markers
- **Install**: Search "TODO Highlight" by Wayou

## 🚀 Quick Install

### Option 1: Automatic (Recommended)
VS Code will prompt you to install recommended extensions when you open the workspace.

### Option 2: Manual
1. Press `Ctrl+Shift+X`
2. Search "Todo Tree" → Install
3. Search "TODO Highlight" → Install
4. Reload VS Code

### Option 3: Command Line
```bash
code --install-extension gruntfuggly.todo-tree
code --install-extension wayou.vscode-todo-highlight
```

## 🎨 Color Scheme (Matching)

Both extensions use the same colors:

| Tag | Color | Background |
|-----|-------|------------|
| SECURITY | White | Red (#d32f2f) |
| BUG | White | Red (#f44336) |
| FIXME | White | Orange (#ff9800) |
| TODO | Black | Yellow (#ffeb3b) |
| PERFORMANCE | Black | Green (#4caf50) |
| REFACTOR | White | Purple (#9c27b0) |
| OPTIMIZE | Black | Cyan (#00bcd4) |
| REVIEW | Black | Amber (#ffc107) |
| DEPRECATED | White | Brown (#795548) |
| CLEANUP | White | Gray (#607d8b) |
| TEST | Black | Light Green (#8bc34a) |
| DOCS | White | Indigo (#3f51b5) |
| HACK | Black | Deep Orange (#ff5722) |
| NOTE | Black | Light Blue (#03a9f4) |

## 🎯 Usage

### Todo Tree (Sidebar)
- Click icon in Activity Bar
- Browse all TODOs
- Click to navigate
- Filter and export

### TODO Highlight (Editor)
- Open any file
- TODOs automatically highlighted
- Hover for details
- Overview ruler shows locations

### Commands
```
Ctrl+Shift+P → "Todo Tree: Focus"
Ctrl+Shift+P → "TODO Highlight: Toggle"
Ctrl+Shift+P → "TODO Highlight: List"
```

## 📊 Current Stats

- Total TODOs: 368
- SECURITY: 110 (Critical!)
- TEST: 144
- PERFORMANCE: 31

## 🔧 Configuration Files

- `.vscode/settings.json` - Both extensions configured
- `.vscode/extensions.json` - Recommended extensions
- `scripts/scan-todos.js` - Scanner script
- `docs/TODO_GUIDELINES.md` - Team standards

## ✅ Next Steps

1. Install both extensions
2. Reload VS Code
3. Open any file → See inline highlights
4. Click Todo Tree icon → See tree view
5. Run `npm run todos:scan` → Generate report

---

**Both extensions work together perfectly!**
- Todo Tree = Navigation & Overview
- TODO Highlight = Inline Visibility

🦉 **The Owl Never Sleeps**
