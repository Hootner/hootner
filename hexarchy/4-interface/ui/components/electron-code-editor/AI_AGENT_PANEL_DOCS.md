# 🤖 AI Agent Panel - Complete Documentation

## 📦 Architecture

```
ai-agent-panel.js           → Base panel with core features
ai-agent-panel-extended.js  → Extended features & plugins
ai-agent-init.js            → Bootstrap & initialization
```

## 🚀 Quick Start

```javascript
// Import and initialize
import './ai-agent-init.js';

// Access global instance
window.aiAgentUI.sendMessage('Refactor this code');
```

## 🎯 Core Features (Base Panel)

### Multi-Agent System
- **6 Specialized Agents**: All, Refactor, Debug, Optimize, Security, Test
- Agent-specific routing and context
- Visual agent selection

### Communication
- **Streaming responses** - Real-time token display
- **Multi-line input** - Textarea with Shift+Enter
- **Voice input** - Speech-to-text (🎤)
- **File attachments** - Context files (📎)
- **Message actions** - Copy & Apply buttons

### Progress & Status
- **Progress bar** - Visual feedback
- **Connection status** - WebSocket health (🟢/🔴)
- **Active operations** - Live counter badge
- **Status animations** - Pulsing indicators

### Session Management
- **Persistent history** - LocalStorage (100 messages)
- **Auto-save** - Every 30 seconds
- **Session restoration** - Welcome back message
- **History viewer** - Quick access (📜)

### UI/UX
- **Draggable** - Reposition anywhere
- **Minimize/Maximize** - Collapse to header
- **Timestamps** - On every message
- **Custom scrollbar** - Styled
- **Toast notifications** - Non-intrusive
- **Code preview** - Collapsible panel

### Keyboard Shortcuts
- `Ctrl+Shift+A` - Toggle panel
- `Ctrl+K` - Focus input
- `Enter` - Send message
- `Shift+Enter` - New line
- `↑` - Recall last message

## 🔥 Extended Features

### 🔀 Diff Viewer
```javascript
aiAgentUI.showDiffViewer();
```
- Side-by-side comparison
- Before/After visualization
- Full-screen modal

### 📊 Analytics Dashboard
```javascript
aiAgentUI.showAnalytics();
```
- Messages count
- Tokens used
- Sessions tracked
- Plugin statistics

### 🔌 Plugin System
```javascript
aiAgentUI.registerPlugin('myPlugin', {
  name: 'My Plugin',
  action: (input) => processInput(input)
});
```
- Extensible architecture
- Built-in: Code Formatter, Linter
- Easy registration API

### 👥 Collaborative Mode
```javascript
aiAgentUI.toggleCollaborative();
```
- Multiple agents work together
- Sequential execution
- Visual progress per agent

### 🎨 Theme System
```javascript
aiAgentUI.cycleTheme();
// or
aiAgentUI.applyTheme('cyberpunk');
```
**Available Themes:**
- `dark` - Default dark theme
- `light` - Light mode
- `cyberpunk` - Neon purple/green
- `forest` - Nature-inspired green

### 💾 Export/Import
```javascript
aiAgentUI.exportSession();
```
Exports JSON with:
- Full history
- Analytics data
- Current theme
- Timestamp

### ⚙️ Automation Engine
```javascript
aiAgentUI.automationRules.push({
  trigger: 'onError',
  action: 'debug',
  enabled: true
});
```

## 📊 Analytics Tracking

```javascript
aiAgentUI.analytics = {
  messages: 0,      // Total messages sent
  tokens: 0,        // Estimated tokens used
  sessions: 0,      // Session count
}
```

## 🎨 Theming

### CSS Variables
```css
--accent: #00d4ff
--bg: #1e1e1e
--text: #ffffff
--sidebar-bg: rgba(30, 30, 30, 0.95)
--hover: rgba(255, 255, 255, 0.1)
--border: rgba(255, 255, 255, 0.2)
```

### Custom Theme
```javascript
aiAgentUI.applyTheme('custom');
document.documentElement.style.setProperty('--accent', '#ff6b6b');
```

## 🔌 Plugin Development

### Plugin Structure
```javascript
{
  name: 'Plugin Name',
  action: (input) => {
    // Process input
    return result;
  }
}
```

### Example Plugin
```javascript
aiAgentUI.registerPlugin('uppercase', {
  name: 'Uppercase Converter',
  action: (text) => text.toUpperCase()
});
```

## 🌐 WebSocket Integration

```javascript
// Auto-connects to ws://localhost:3000/ai-agent
// Handles:
// - Connection status updates
// - Real-time agent updates
// - Graceful fallback to polling
```

## 📱 Responsive Design

- **Width**: 450px (desktop)
- **Height**: 700px (expanded), 60px (minimized)
- **Position**: Draggable, default bottom-right
- **Z-index**: 9999 (panel), 10000 (modals)

## 🎯 API Reference

### Core Methods

```javascript
// Messaging
aiAgentUI.sendMessage(message)
aiAgentUI.addMessage(role, content)
aiAgentUI.updateMessage(msgId, content)
aiAgentUI.removeMessage(msgId)

// UI Control
aiAgentUI.toggle()
aiAgentUI.minimize()
aiAgentUI.showToast(message)

// Session
aiAgentUI.loadHistory()
aiAgentUI.saveHistory()
aiAgentUI.exportSession()

// Agents
aiAgentUI.selectAgent(agent, btn)
aiAgentUI.quickAction(action)

// Extended
aiAgentUI.showDiffViewer()
aiAgentUI.showAnalytics()
aiAgentUI.toggleCollaborative()
aiAgentUI.cycleTheme()
aiAgentUI.registerPlugin(id, plugin)
```

## 🔧 Configuration

### Disable Features
```javascript
// Disable WebSocket
aiAgentUI.ws = null;

// Disable auto-save
clearInterval(aiAgentUI.saveInterval);

// Disable collaborative mode
aiAgentUI.collaborativeAgents = [];
```

## 🐛 Troubleshooting

### Panel Not Showing
```javascript
document.getElementById('panelContainer').style.display = 'flex';
```

### WebSocket Connection Failed
- Check server running on port 3000
- Falls back to polling automatically

### History Not Saving
- Check localStorage quota
- Clear old data: `localStorage.removeItem('aiAgentHistory')`

## 📈 Performance

- **Memory**: ~5MB (with 100 messages)
- **CPU**: <1% idle, ~5% during streaming
- **Network**: WebSocket ~1KB/s, REST ~10KB/request

## 🔒 Security

- **DOMPurify** - XSS protection on all user input
- **CSP Compatible** - No inline scripts in messages
- **LocalStorage** - Client-side only, no server sync

## 🎓 Best Practices

1. **Always sanitize** user input before display
2. **Limit history** to prevent memory bloat
3. **Use plugins** for extensibility
4. **Theme consistently** across your app
5. **Monitor analytics** for usage patterns

## 📝 License

MIT - Part of HOOTNER Enterprise Platform

---

**Need help?** Open an issue or check the main README.md
