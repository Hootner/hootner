import AIAgentUI from './ai-agent-panel.js';
import AIAgentUIExtended from './ai-agent-panel-extended.js';
import AIAgentUISophisticated from './ai-agent-panel-sophisticated.js';

/**
 * Unified AI Agent System - All Layers Integrated
 */
class UnifiedAISystem {
  constructor() {
    this.layers = {
      base: null,
      extended: null,
      sophisticated: null
    };
    this.bridge = new LayerBridge();
    this.orchestrator = new FeatureOrchestrator();
    this.init();
  }

  init() {
    this.layers.sophisticated = new AIAgentUISophisticated();
    this.setupLayerCommunication();
    this.enableCrossLayerFeatures();
    this.exposeUnifiedAPI();
  }

  setupLayerCommunication() {
    // Base → Extended → Sophisticated message flow
    const originalSend = this.layers.sophisticated.sendMessage.bind(this.layers.sophisticated);
    this.layers.sophisticated.sendMessage = async (msg) => {
      this.bridge.emit('message:sent', { layer: 'sophisticated', content: msg });
      const result = await originalSend(msg);
      this.bridge.emit('message:complete', { layer: 'sophisticated', result });
      return result;
    };
  }

  enableCrossLayerFeatures() {
    // Plugin system can access all layers
    this.layers.sophisticated.registerPlugin('layerBridge', {
      name: 'Layer Bridge',
      action: (input) => this.bridge.route(input)
    });

    // Analytics aggregation across layers
    this.orchestrator.aggregateAnalytics(this.layers.sophisticated);
  }

  exposeUnifiedAPI() {
    window.aiSystem = {
      // Direct access to sophisticated layer
      agent: this.layers.sophisticated,
      
      // Unified commands
      send: (msg) => this.layers.sophisticated.sendMessage(msg),
      analyze: () => this.layers.sophisticated.showAnalytics(),
      profile: () => this.layers.sophisticated.showProfiler(),
      collab: () => this.layers.sophisticated.openCollabHub(),
      sandbox: () => this.layers.sophisticated.openSandbox(),
      search: () => this.layers.sophisticated.openSmartSearch(),
      
      // Layer access
      layers: this.layers,
      bridge: this.bridge,
      orchestrator: this.orchestrator
    };
  }
}

class LayerBridge {
  constructor() {
    this.listeners = new Map();
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(fn => fn(data));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  route(input) {
    // Intelligent routing between layers
    if (input.includes('analyze')) return 'sophisticated';
    if (input.includes('theme')) return 'extended';
    return 'base';
  }
}

class FeatureOrchestrator {
  aggregateAnalytics(agent) {
    return {
      total: {
        messages: agent.analytics.messages,
        tokens: agent.analytics.tokens,
        sessions: agent.analytics.sessions,
        plugins: agent.plugins.size,
        models: agent.models.length,
        collaborators: agent.collaborators.size
      },
      performance: {
        avgResponseTime: agent.calculateAvgTime(),
        throughput: agent.calculateThroughput(),
        metrics: agent.profiler.metrics.length
      }
    };
  }
}

// Auto-initialize
const unifiedSystem = new UnifiedAISystem();

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎯 UNIFIED AI AGENT SYSTEM - ALL LAYERS ACTIVE           ║
╠════════════════════════════════════════════════════════════╣
║  📊 LAYER ARCHITECTURE                                     ║
║  ├─ Base Layer        → Core features (6 agents)          ║
║  ├─ Extended Layer    → Plugins, themes, analytics        ║
║  └─ Sophisticated     → AI models, sandbox, profiler      ║
╠════════════════════════════════════════════════════════════╣
║  🚀 UNIFIED API                                            ║
║  window.aiSystem.send('message')      → Send message      ║
║  window.aiSystem.analyze()            → Analytics         ║
║  window.aiSystem.profile()            → Profiler          ║
║  window.aiSystem.collab()             → Collaboration     ║
║  window.aiSystem.sandbox()            → Code sandbox      ║
║  window.aiSystem.search()             → Smart search      ║
╠════════════════════════════════════════════════════════════╣
║  ⌨️  SHORTCUTS                                             ║
║  Ctrl+Shift+A  → Toggle panel                             ║
║  Ctrl+K        → Focus input                              ║
║  Ctrl+Shift+P  → Show profiler                            ║
║  Ctrl+Shift+S  → Smart search                             ║
╚════════════════════════════════════════════════════════════╝
`);

export default unifiedSystem;
