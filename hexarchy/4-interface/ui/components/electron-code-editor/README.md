# 🤖 AI Agent Panel

**Ultra-advanced AI agent interface with multi-agent orchestration, real-time streaming, analytics, and extensible plugin system.**

## 🚀 Quick Start

```javascript
// Import and auto-initialize
import './ai-agent-init.js';

// Use globally
window.aiAgentUI.sendMessage('Refactor this code');
```

## 📦 Installation

```bash
npm install dompurify
```

## 🎯 Features

### Core
- ✅ 6 specialized agents (All, Refactor, Debug, Optimize, Security, Test)
- ✅ Real-time streaming responses
- ✅ Voice input (speech-to-text)
- ✅ File attachments
- ✅ Persistent history (100 messages)
- ✅ WebSocket real-time updates
- ✅ Draggable & minimizable UI
- ✅ Keyboard shortcuts

### Extended
- ✅ Analytics dashboard
- ✅ Diff viewer (side-by-side)
- ✅ Plugin system
- ✅ Collaborative multi-agent mode
- ✅ 4 themes (Dark, Light, Cyberpunk, Forest)
- ✅ Export/Import sessions
- ✅ Automation engine

## 📁 Files

```
ai-agent-panel.js           → Base panel (core features)
ai-agent-panel-extended.js  → Extended features
ai-agent-init.js            → Bootstrap loader
AI_AGENT_PANEL_DOCS.md      → Full documentation
demo.html                   → Interactive demo
package.json                → Package config
```

## 🎮 Demo

```bash
npm run demo
```

Opens interactive demo at http://localhost:8080

## 📖 Documentation

See [AI_AGENT_PANEL_DOCS.md](./AI_AGENT_PANEL_DOCS.md) for complete API reference.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` | Toggle panel |
| `Ctrl+K` | Focus input |
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `↑` | Recall last message |

## 🔌 Plugin Example

```javascript
aiAgentUI.registerPlugin('uppercase', {
  name: 'Uppercase Converter',
  action: (text) => text.toUpperCase()
});
```

## 🎨 Theme Example

```javascript
// Cycle through themes
aiAgentUI.cycleTheme();

// Apply specific theme
aiAgentUI.applyTheme('cyberpunk');
```

## 📊 Analytics

```javascript
aiAgentUI.showAnalytics();
// Shows: messages, tokens, sessions, plugins
```

## 💾 Export Session

```javascript
aiAgentUI.exportSession();
// Downloads JSON with full history
```

## 🏗️ Architecture

```
AIAgentUI (Base)
  ├── Multi-agent system
  ├── Streaming responses
  ├── Session management
  └── WebSocket integration

AIAgentUIExtended (Extended)
  ├── Analytics dashboard
  ├── Diff viewer
  ├── Plugin system
  ├── Collaborative mode
  ├── Theme system
  └── Export/Import
```

## 🔧 Configuration

```javascript
// Disable WebSocket
aiAgentUI.ws = null;

// Disable auto-save
clearInterval(aiAgentUI.saveInterval);

// Custom theme
aiAgentUI.applyTheme('custom');
document.documentElement.style.setProperty('--accent', '#ff6b6b');
```

## 🐛 Troubleshooting

**Panel not showing?**
```javascript
document.getElementById('panelContainer').style.display = 'flex';
```

**WebSocket failed?**
- Falls back to polling automatically
- Check server on port 3000

**History not saving?**
```javascript
localStorage.removeItem('aiAgentHistory');
```

## 📈 Performance

- Memory: ~5MB (100 messages)
- CPU: <1% idle, ~5% streaming
- Network: WebSocket ~1KB/s

## 🔒 Security

- DOMPurify XSS protection
- CSP compatible
- Client-side only storage

## 📄 License

MIT - Part of HOOTNER Enterprise Platform

---

**Made with ❤️ by HOOTNER Team**
