import './unified-ai-system.js';

/**
 * AI Assistant Bridge - Connects legacy ai-assistant.js with unified AI system
 */
class AIAssistantBridge {
  constructor() {
    this.unifiedSystem = window.aiSystem;
    this.legacyAssistant = window.aiAssistant;
    this.init();
  }

  init() {
    if (!this.unifiedSystem) {
      console.warn('Unified AI System not loaded');
      return;
    }
    this.enhanceLegacyAssistant();
    this.setupBidirectionalSync();
  }

  enhanceLegacyAssistant() {
    if (!this.legacyAssistant) return;

    // Enhance analyzeCode with unified system
    const originalAnalyze = this.legacyAssistant.analyzeCode.bind(this.legacyAssistant);
    this.legacyAssistant.analyzeCode = async function() {
      const code = editor?.getValue();
      if (window.aiSystem && code) {
        window.aiSystem.send(`Analyze this code:\n\`\`\`\n${code}\n\`\`\``);
      }
      return originalAnalyze();
    };

    // Enhance reviewCode
    const originalReview = this.legacyAssistant.reviewCode.bind(this.legacyAssistant);
    this.legacyAssistant.reviewCode = async function() {
      const code = editor?.getValue();
      if (window.aiSystem && code) {
        window.aiSystem.send(`Review this code:\n\`\`\`\n${code}\n\`\`\``);
      }
      return originalReview();
    };

    // Add unified system features to legacy UI
    this.addUnifiedFeaturesToLegacy();
  }

  addUnifiedFeaturesToLegacy() {
    // Inject unified system buttons into legacy panel
    const observer = new MutationObserver(() => {
      const panel = document.getElementById('output');
      if (panel && panel.innerHTML.includes('AI Assistant') && !panel.querySelector('#unifiedFeatures')) {
        this.injectUnifiedFeatures(panel);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  injectUnifiedFeatures(panel) {
    const unifiedSection = document.createElement('div');
    unifiedSection.id = 'unifiedFeatures';
    unifiedSection.innerHTML = `
      <div style="margin-top: 20px; padding: 16px; background: var(--hover); border-radius: 8px; border: 1px solid var(--accent);">
        <h4 style="color: var(--accent); margin-bottom: 12px;">🚀 Unified AI Features</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
          <button onclick="window.aiSystem.analyze()" class="ai-quick-btn">📊 Analytics</button>
          <button onclick="window.aiSystem.profile()" class="ai-quick-btn">📈 Profiler</button>
          <button onclick="window.aiSystem.sandbox()" class="ai-quick-btn">▶️ Sandbox</button>
          <button onclick="window.aiSystem.collab()" class="ai-quick-btn">🌍 Collaborate</button>
          <button onclick="window.aiSystem.search()" class="ai-quick-btn">🔍 Search</button>
          <button onclick="window.aiSystem.agent.showDiffViewer()" class="ai-quick-btn">🔀 Diff</button>
        </div>
      </div>
    `;
    panel.querySelector('div').appendChild(unifiedSection);
  }

  setupBidirectionalSync() {
    // Sync unified system messages to legacy output
    this.unifiedSystem.bridge.on('message:complete', (data) => {
      if (typeof addOutput === 'function') {
        addOutput(`🤖 AI: ${data.result?.content || 'Processing...'}`, 'info');
      }
    });

    // Sync legacy API key to unified system
    if (this.legacyAssistant?.apiKey) {
      this.unifiedSystem.agent.apiKey = this.legacyAssistant.apiKey;
    }
  }
}

// Auto-initialize bridge
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      window.aiAssistantBridge = new AIAssistantBridge();
      console.log('🌉 AI Assistant Bridge initialized');
    }, 100);
  });
}

export default AIAssistantBridge;
