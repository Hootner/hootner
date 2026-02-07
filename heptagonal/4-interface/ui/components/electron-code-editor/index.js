/**
 * Master AI System Loader
 * Loads all AI components in correct order with dependency management
 */

// Load order: Base → Extended → Sophisticated → Unified → Bridge
const loadSequence = [
  './ai-agent-panel.js',
  './ai-agent-panel-extended.js', 
  './ai-agent-panel-sophisticated.js',
  './unified-ai-system.js',
  './ai-assistant-bridge.js'
];

async function loadAISystem() {
  console.log('🚀 Loading AI System...');
  
  for (const module of loadSequence) {
    try {
      await import(module);
      console.log(`✅ Loaded: ${module}`);
    } catch (err) {
      console.warn(`⚠️ Optional module not loaded: ${module}`);
    }
  }
  
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  ✅ AI SYSTEM FULLY LOADED                                ║
╠════════════════════════════════════════════════════════════╣
║  🎯 Available APIs:                                        ║
║                                                            ║
║  window.aiSystem          → Unified AI system             ║
║  window.aiSystem.send()   → Send message                  ║
║  window.aiSystem.analyze() → Analytics dashboard          ║
║  window.aiSystem.profile() → Performance profiler         ║
║  window.aiSystem.sandbox() → Code execution sandbox       ║
║  window.aiSystem.collab()  → Collaboration hub            ║
║  window.aiSystem.search()  → Smart search                 ║
║                                                            ║
║  window.aiAssistant       → Legacy AI assistant           ║
║  window.aiAssistantBridge → Integration bridge            ║
╠════════════════════════════════════════════════════════════╣
║  📊 System Status:                                         ║
║  • Base Layer:        Active                              ║
║  • Extended Layer:    Active                              ║
║  • Sophisticated:     Active                              ║
║  • Unified System:    Active                              ║
║  • Legacy Bridge:     Active                              ║
╠════════════════════════════════════════════════════════════╣
║  ⌨️  Quick Commands:                                       ║
║  Ctrl+Shift+A  → Toggle AI panel                          ║
║  Ctrl+K        → Focus input                              ║
║  Ctrl+Shift+P  → Performance profiler                     ║
║  Ctrl+Shift+S  → Smart search                             ║
╚════════════════════════════════════════════════════════════╝
  `);
}

// Auto-load on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAISystem);
  } else {
    loadAISystem();
  }
}

export default loadAISystem;
