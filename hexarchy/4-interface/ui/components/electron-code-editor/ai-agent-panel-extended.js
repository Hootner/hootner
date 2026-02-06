import AIAgentUI from './ai-agent-panel.js';

class AIAgentUIExtended extends AIAgentUI {
  constructor() {
    super();
    this.plugins = new Map();
    this.analytics = { messages: 0, tokens: 0, sessions: 0 };
    this.collaborativeAgents = [];
    this.diffViewer = null;
    this.automationRules = [];
    this.themes = ['dark', 'light', 'cyberpunk', 'forest'];
    this.currentTheme = 'dark';
    this.initExtensions();
  }

  initExtensions() {
    this.addDiffViewer();
    this.addAnalyticsDashboard();
    this.addPluginSystem();
    this.addCollaborativeMode();
    this.addAutomationEngine();
    this.addThemeSelector();
    this.addExportImport();
  }

  addDiffViewer() {
    const diffBtn = document.createElement('button');
    diffBtn.id = 'diffBtn';
    diffBtn.innerHTML = '🔀 Diff';
    diffBtn.style.cssText = 'padding:6px 12px; background:var(--hover); color:var(--text); border:none; border-radius:16px; cursor:pointer; font-size:11px;';
    diffBtn.onclick = () => this.showDiffViewer();
    document.getElementById('agentSelector').appendChild(diffBtn);
  }

  showDiffViewer() {
    const viewer = document.createElement('div');
    viewer.id = 'diffViewer';
    viewer.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:80%; height:80%; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10000; padding:20px; overflow:auto;';
    viewer.innerHTML = `
      <h3 style="color:var(--accent);">🔀 Code Diff Viewer</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px;">
        <div><h4>Before</h4><pre id="diffBefore" style="background:var(--bg); padding:12px; border-radius:6px; overflow:auto; max-height:500px;"></pre></div>
        <div><h4>After</h4><pre id="diffAfter" style="background:var(--bg); padding:12px; border-radius:6px; overflow:auto; max-height:500px;"></pre></div>
      </div>
      <button onclick="this.parentElement.remove()" style="margin-top:20px; padding:10px 20px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">Close</button>
    `;
    document.body.appendChild(viewer);
  }

  addAnalyticsDashboard() {
    const analyticsBtn = document.createElement('button');
    analyticsBtn.innerHTML = '📊';
    analyticsBtn.title = 'Analytics';
    analyticsBtn.style.cssText = 'background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;';
    analyticsBtn.onclick = () => this.showAnalytics();
    document.querySelector('#panelHeader > div').insertBefore(analyticsBtn, document.getElementById('settingsBtn'));
  }

  showAnalytics() {
    this.analytics.sessions++;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:500px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10000; padding:24px;';
    modal.innerHTML = `
      <h3 style="color:var(--accent); margin-bottom:20px;">📊 Analytics Dashboard</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div style="background:var(--bg); padding:16px; border-radius:8px; text-align:center;">
          <div style="font-size:32px; color:var(--accent); font-weight:bold;">${this.analytics.messages}</div>
          <div style="font-size:12px; opacity:0.7;">Messages</div>
        </div>
        <div style="background:var(--bg); padding:16px; border-radius:8px; text-align:center;">
          <div style="font-size:32px; color:var(--accent); font-weight:bold;">${this.analytics.tokens}</div>
          <div style="font-size:12px; opacity:0.7;">Tokens Used</div>
        </div>
        <div style="background:var(--bg); padding:16px; border-radius:8px; text-align:center;">
          <div style="font-size:32px; color:var(--accent); font-weight:bold;">${this.analytics.sessions}</div>
          <div style="font-size:12px; opacity:0.7;">Sessions</div>
        </div>
        <div style="background:var(--bg); padding:16px; border-radius:8px; text-align:center;">
          <div style="font-size:32px; color:var(--accent); font-weight:bold;">${this.plugins.size}</div>
          <div style="font-size:12px; opacity:0.7;">Plugins</div>
        </div>
      </div>
      <button onclick="this.parentElement.remove()" style="margin-top:20px; width:100%; padding:10px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">Close</button>
    `;
    document.body.appendChild(modal);
  }

  addPluginSystem() {
    this.registerPlugin('codeFormatter', { name: 'Code Formatter', action: (code) => code.trim() });
    this.registerPlugin('linter', { name: 'Linter', action: (code) => ({ errors: [], warnings: [] }) });
  }

  registerPlugin(id, plugin) {
    this.plugins.set(id, plugin);
    console.log(`🔌 Plugin registered: ${plugin.name}`);
  }

  addCollaborativeMode() {
    const collabBtn = document.createElement('button');
    collabBtn.innerHTML = '👥';
    collabBtn.title = 'Collaborative Mode';
    collabBtn.style.cssText = 'background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;';
    collabBtn.onclick = () => this.toggleCollaborative();
    document.querySelector('#panelHeader > div').insertBefore(collabBtn, document.getElementById('settingsBtn'));
  }

  toggleCollaborative() {
    this.showToast('Collaborative mode: ' + (this.collaborativeAgents.length > 0 ? 'Disabled' : 'Enabled'));
    if (this.collaborativeAgents.length === 0) {
      this.collaborativeAgents = ['refactor', 'debug', 'optimize'];
    } else {
      this.collaborativeAgents = [];
    }
  }

  addAutomationEngine() {
    this.automationRules.push({
      trigger: 'onError',
      action: 'debug',
      enabled: true
    });
  }

  addThemeSelector() {
    const themeBtn = document.createElement('button');
    themeBtn.innerHTML = '🎨';
    themeBtn.title = 'Theme';
    themeBtn.style.cssText = 'background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;';
    themeBtn.onclick = () => this.cycleTheme();
    document.querySelector('#panelHeader > div').insertBefore(themeBtn, document.getElementById('settingsBtn'));
  }

  cycleTheme() {
    const idx = this.themes.indexOf(this.currentTheme);
    this.currentTheme = this.themes[(idx + 1) % this.themes.length];
    this.applyTheme(this.currentTheme);
    this.showToast(`Theme: ${this.currentTheme}`);
  }

  applyTheme(theme) {
    const themes = {
      dark: { accent: '#00d4ff', bg: '#1e1e1e', text: '#ffffff' },
      light: { accent: '#0066cc', bg: '#ffffff', text: '#000000' },
      cyberpunk: { accent: '#ff00ff', bg: '#0a0a0a', text: '#00ff00' },
      forest: { accent: '#4caf50', bg: '#1b2a1b', text: '#e8f5e9' }
    };
    const colors = themes[theme];
    document.documentElement.style.setProperty('--accent', colors.accent);
    document.documentElement.style.setProperty('--bg', colors.bg);
    document.documentElement.style.setProperty('--text', colors.text);
  }

  addExportImport() {
    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '💾';
    exportBtn.title = 'Export';
    exportBtn.style.cssText = 'background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;';
    exportBtn.onclick = () => this.exportSession();
    document.querySelector('#panelHeader > div').insertBefore(exportBtn, document.getElementById('settingsBtn'));
  }

  exportSession() {
    const data = {
      history: this.history,
      analytics: this.analytics,
      theme: this.currentTheme,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-agent-session-${Date.now()}.json`;
    a.click();
    this.showToast('Session exported!');
  }

  async sendMessage(message) {
    this.analytics.messages++;
    this.analytics.tokens += message.split(' ').length * 1.3;
    
    if (this.collaborativeAgents.length > 0) {
      return this.sendCollaborativeMessage(message);
    }
    
    return super.sendMessage(message);
  }

  async sendCollaborativeMessage(message) {
    this.addMessage('assistant', `🤝 Collaborative mode: ${this.collaborativeAgents.length} agents working together...`);
    
    for (const agent of this.collaborativeAgents) {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.addMessage('assistant', `${this.getAgentEmoji(agent)} ${agent} agent analyzing...`);
    }
    
    return super.sendMessage(message);
  }

  getAgentEmoji(agent) {
    const emojis = { refactor: '🔧', debug: '🐛', optimize: '⚡', security: '🔒', test: '🧪' };
    return emojis[agent] || '🤖';
  }
}

export default AIAgentUIExtended;
