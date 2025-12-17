# 🎨 Visual Designer & Debug Enhancements

**2025 UI Prototyping and Enhanced Debugging**

## Visual Designer

### Overview

Cursor-style visual mode for rapid UI prototyping with drag-and-drop interface.

### Features

- **Drag & Drop** - Add elements visually
- **Live Preview** - See changes in real-time
- **Export HTML** - Generate code from design
- **Element Types** - Div, Button, Input, and more

### Usage

**Command Palette**

```
Designer: Open Visual Designer
```

**Workflow**

1. Open visual designer
2. Add elements (Div, Button, Input)
3. Drag to position
4. Click to select and style
5. Export HTML to editor

### API

```javascript
// Open designer
window.visualDesigner.open();

// Add element
window.visualDesigner.addElement('div');

// Export code
window.visualDesigner.exportCode();
```

## Debug Enhancements

### AI Suggestion Snooze

**Snooze unwanted suggestions**

- Default: 1 hour
- Custom duration supported
- Auto-expires after timeout

### Integrated Breakpoints

**Terminal-integrated debugging**

- Add breakpoints by line number
- Track active breakpoints
- Session logging for compliance

### Usage

**Commands**

```
Debug: Add Breakpoint
Debug: Snooze Suggestion
Debug: Export Sessions
```

**API**

```javascript
// Add breakpoint
debugEnhancer.addBreakpoint('file.js', 42);

// Snooze suggestion
debugEnhancer.snoozeSuggestion('Use const instead of let', 3600000);

// Export debug sessions
const sessions = debugEnhancer.exportSessions();
```

### Compliance Integration

All debug sessions are logged:

- Breakpoint additions/removals
- Snoozed suggestions
- Timestamps for audit trail

## Benefits

✅ **Visual Prototyping** - Faster UI development  
✅ **AI Snooze** - Control suggestion noise  
✅ **Breakpoint Management** - Integrated debugging  
✅ **Compliance Logging** - Audit trail for debug sessions  
✅ **Export Sessions** - Debug history tracking
