import AIAgentUISophisticated from './ai-agent-panel-sophisticated.js';

// Global instance
let aiAgentUI;

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    aiAgentUI = new AIAgentUISophisticated();
    
    // Expose to global scope
    window.aiAgentUI = aiAgentUI;
    
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🤖 AI Agent Panel - Sophisticated Edition                ║
╠════════════════════════════════════════════════════════════╣
║  ⌨️  Ctrl+Shift+A  → Toggle panel                         ║
║  ⌨️  Ctrl+K        → Focus input                          ║
║  ⌨️  ↑             → Recall last message                  ║
╠════════════════════════════════════════════════════════════╣
║  🎨 Theme Cycling  → Click theme button                   ║
║  📊 Analytics      → View usage stats                     ║
║  🔀 Diff Viewer    → Compare code changes                 ║
║  👥 Collaborative  → Multi-agent mode                     ║
║  💾 Export/Import  → Save sessions                        ║
║  🔌 Plugins        → ${aiAgentUI.plugins.size} loaded                           ║
║  🤖 AI Models      → ${aiAgentUI.models.length} available                       ║
║  ▶️  Code Sandbox   → Execute & test code                 ║
║  🌍 Collaboration  → Real-time team coding                ║
║  🔍 Smart Search   → Find anything instantly              ║
║  📈 Profiler       → Performance metrics                  ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
}

export default aiAgentUI;
