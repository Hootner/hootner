import AIAgentUIExtended from './ai-agent-panel-extended.js';

class AIAgentUISophisticated extends AIAgentUIExtended {
  constructor() {
    super();
    this.models = ['gpt-4', 'claude-3', 'gemini-pro', 'llama-3'];
    this.currentModel = 'gpt-4';
    this.sandbox = null;
    this.collaborators = new Map();
    this.searchIndex = new Map();
    this.suggestions = [];
    this.profiler = { start: 0, metrics: [] };
    this.initSophistication();
  }

  initSophistication() {
    this.addModelSelector();
    this.addCodeSandbox();
    this.addCollaborationHub();
    this.addSmartSearch();
    this.addAISuggestions();
    this.addPerformanceProfiler();
    this.addAdvancedSettings();
    this.addMacroRecorder();
  }

  addModelSelector() {
    const selector = document.createElement('select');
    selector.id = 'modelSelector';
    selector.style.cssText = 'background:var(--bg); color:var(--text); border:1px solid var(--border); border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;';
    this.models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      selector.appendChild(opt);
    });
    selector.onchange = (e) => this.switchModel(e.target.value);
    document.getElementById('agentSelector').appendChild(selector);
  }

  switchModel(model) {
    this.currentModel = model;
    this.showToast(`Switched to ${model}`);
    this.addMessage('assistant', `🔄 Now using ${model} model`);
  }

  addCodeSandbox() {
    const sandboxBtn = document.createElement('button');
    sandboxBtn.innerHTML = '▶️';
    sandboxBtn.title = 'Code Sandbox';
    sandboxBtn.style.cssText = 'background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;';
    sandboxBtn.onclick = () => this.openSandbox();
    document.querySelector('#panelHeader > div').insertBefore(sandboxBtn, document.getElementById('settingsBtn'));
  }

  openSandbox() {
    const sandbox = document.createElement('div');
    sandbox.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:90%; height:90%; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10001; display:flex; flex-direction:column; padding:20px;';
    sandbox.innerHTML = `
      <h3 style="color:var(--accent); margin-bottom:15px;">▶️ Code Execution Sandbox</h3>
      <textarea id="sandboxCode" style="flex:1; background:var(--bg); color:var(--text); border:1px solid var(--border); border-radius:6px; padding:12px; font-family:monospace; resize:none;" placeholder="// Write code here..."></textarea>
      <div style="margin-top:15px; display:flex; gap:10px;">
        <button onclick="window.aiAgentUI.executeSandbox()" style="padding:10px 20px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">▶️ Execute</button>
        <button onclick="this.parentElement.parentElement.remove()" style="padding:10px 20px; background:var(--hover); color:var(--text); border:none; border-radius:6px; cursor:pointer;">Close</button>
      </div>
      <div id="sandboxOutput" style="margin-top:15px; padding:12px; background:var(--bg); border-radius:6px; max-height:200px; overflow-y:auto; font-family:monospace; font-size:12px;"></div>
    `;
    document.body.appendChild(sandbox);
  }

  executeSandbox() {
    const code = document.getElementById('sandboxCode').value;
    const output = document.getElementById('sandboxOutput');
    try {
      const result = eval(code);
      output.innerHTML = `<span style="color:#4caf50;">✓ Output:</span><br>${JSON.stringify(result, null, 2)}`;
    } catch (err) {
      output.innerHTML = `<span style="color:#f44336;">✗ Error:</span><br>${err.message}`;
    }
  }

  addCollaborationHub() {
    const collabBtn = document.createElement('button');
    collabBtn.innerHTML = '🌍';
    collabBtn.title = 'Collaboration Hub';
    collabBtn.style.cssText = 'background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;';
    collabBtn.onclick = () => this.openCollabHub();
    document.querySelector('#panelHeader > div').insertBefore(collabBtn, document.getElementById('settingsBtn'));
  }

  openCollabHub() {
    const hub = document.createElement('div');
    hub.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:600px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10001; padding:24px;';
    hub.innerHTML = `
      <h3 style="color:var(--accent); margin-bottom:20px;">🌍 Collaboration Hub</h3>
      <div style="margin-bottom:20px;">
        <input id="collabName" placeholder="Your name" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); border-radius:6px; color:var(--text); margin-bottom:10px;">
        <button onclick="window.aiAgentUI.joinCollab()" style="width:100%; padding:10px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">Join Session</button>
      </div>
      <div id="collabList" style="max-height:300px; overflow-y:auto;">
        <p style="opacity:0.7; text-align:center;">No active collaborators</p>
      </div>
      <button onclick="this.parentElement.remove()" style="margin-top:20px; width:100%; padding:10px; background:var(--hover); color:var(--text); border:none; border-radius:6px; cursor:pointer;">Close</button>
    `;
    document.body.appendChild(hub);
  }

  joinCollab() {
    const name = document.getElementById('collabName').value;
    if (name) {
      const id = Math.random().toString(36).substr(2, 9);
      this.collaborators.set(id, { name, joined: Date.now() });
      this.updateCollabList();
      this.showToast(`${name} joined!`);
    }
  }

  updateCollabList() {
    const list = document.getElementById('collabList');
    if (list && this.collaborators.size > 0) {
      list.innerHTML = Array.from(this.collaborators.entries()).map(([id, c]) => 
        `<div style="padding:10px; background:var(--bg); border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between;">
          <span>👤 ${c.name}</span>
          <span style="opacity:0.6; font-size:11px;">${new Date(c.joined).toLocaleTimeString()}</span>
        </div>`
      ).join('');
    }
  }

  addSmartSearch() {
    const searchBtn = document.createElement('button');
    searchBtn.innerHTML = '🔍';
    searchBtn.title = 'Smart Search';
    searchBtn.style.cssText = 'background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;';
    searchBtn.onclick = () => this.openSmartSearch();
    document.querySelector('#panelHeader > div').insertBefore(searchBtn, document.getElementById('settingsBtn'));
  }

  openSmartSearch() {
    const search = document.createElement('div');
    search.style.cssText = 'position:fixed; top:20%; left:50%; transform:translateX(-50%); width:600px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10001; padding:20px;';
    search.innerHTML = `
      <input id="smartSearchInput" placeholder="🔍 Search messages, code, context..." style="width:100%; padding:12px; background:var(--bg); border:1px solid var(--border); border-radius:6px; color:var(--text); font-size:14px;">
      <div id="searchResults" style="margin-top:15px; max-height:400px; overflow-y:auto;"></div>
      <button onclick="this.parentElement.remove()" style="margin-top:15px; width:100%; padding:10px; background:var(--hover); color:var(--text); border:none; border-radius:6px; cursor:pointer;">Close</button>
    `;
    document.body.appendChild(search);
    
    document.getElementById('smartSearchInput').oninput = (e) => this.performSearch(e.target.value);
    document.getElementById('smartSearchInput').focus();
  }

  performSearch(query) {
    if (!query) return;
    const results = this.history.filter(h => 
      h.content.toLowerCase().includes(query.toLowerCase())
    );
    const resultsDiv = document.getElementById('searchResults');
    if (resultsDiv) {
      resultsDiv.innerHTML = results.length > 0 
        ? results.map(r => `<div style="padding:10px; background:var(--bg); border-radius:6px; margin-bottom:8px; border-left:3px solid var(--accent);"><strong>${r.role}:</strong> ${r.content.substring(0, 100)}...</div>`).join('')
        : '<p style="opacity:0.7; text-align:center;">No results found</p>';
    }
  }

  addAISuggestions() {
    setInterval(() => this.generateSuggestions(), 10000);
  }

  generateSuggestions() {
    const lastMsg = this.history[this.history.length - 1];
    if (lastMsg?.role === 'user') {
      this.suggestions = [
        'Add error handling',
        'Optimize performance',
        'Add unit tests',
        'Improve documentation'
      ];
      this.showSuggestionBadge();
    }
  }

  showSuggestionBadge() {
    const badge = document.getElementById('agentBadge');
    if (badge && this.suggestions.length > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = this.suggestions.length;
      badge.title = 'AI Suggestions available';
    }
  }

  addPerformanceProfiler() {
    const profilerBtn = document.createElement('button');
    profilerBtn.innerHTML = '📈';
    profilerBtn.title = 'Performance Profiler';
    profilerBtn.style.cssText = 'background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;';
    profilerBtn.onclick = () => this.showProfiler();
    document.querySelector('#panelHeader > div').insertBefore(profilerBtn, document.getElementById('settingsBtn'));
  }

  showProfiler() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:700px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10001; padding:24px;';
    modal.innerHTML = `
      <h3 style="color:var(--accent); margin-bottom:20px;">📈 Performance Profiler</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; margin-bottom:20px;">
        <div style="background:var(--bg); padding:15px; border-radius:8px; text-align:center;">
          <div style="font-size:24px; color:var(--accent);">${this.profiler.metrics.length}</div>
          <div style="font-size:11px; opacity:0.7;">Operations</div>
        </div>
        <div style="background:var(--bg); padding:15px; border-radius:8px; text-align:center;">
          <div style="font-size:24px; color:var(--accent);">${this.calculateAvgTime()}ms</div>
          <div style="font-size:11px; opacity:0.7;">Avg Response</div>
        </div>
        <div style="background:var(--bg); padding:15px; border-radius:8px; text-align:center;">
          <div style="font-size:24px; color:var(--accent);">${this.calculateThroughput()}</div>
          <div style="font-size:11px; opacity:0.7;">Msg/min</div>
        </div>
      </div>
      <canvas id="profilerChart" width="650" height="200" style="background:var(--bg); border-radius:8px;"></canvas>
      <button onclick="this.parentElement.remove()" style="margin-top:20px; width:100%; padding:10px; background:var(--hover); color:var(--text); border:none; border-radius:6px; cursor:pointer;">Close</button>
    `;
    document.body.appendChild(modal);
    this.drawProfilerChart();
  }

  calculateAvgTime() {
    if (this.profiler.metrics.length === 0) return 0;
    const sum = this.profiler.metrics.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.profiler.metrics.length);
  }

  calculateThroughput() {
    return Math.round(this.analytics.messages / (Date.now() / 60000));
  }

  drawProfilerChart() {
    const canvas = document.getElementById('profilerChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.profiler.metrics.forEach((m, i) => {
      const x = (i / this.profiler.metrics.length) * 650;
      const y = 200 - (m / Math.max(...this.profiler.metrics)) * 180;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  addAdvancedSettings() {
    this.settings = {
      autoSave: true,
      notifications: true,
      soundEffects: false,
      darkMode: true,
      fontSize: 13,
      maxHistory: 100
    };
  }

  addMacroRecorder() {
    this.macros = [];
    this.recording = false;
  }

  startMacroRecording() {
    this.recording = true;
    this.macros = [];
    this.showToast('🔴 Recording macro...');
  }

  stopMacroRecording() {
    this.recording = false;
    this.showToast(`✅ Macro saved (${this.macros.length} actions)`);
  }

  async sendMessage(message) {
    this.profiler.start = Date.now();
    
    if (this.recording) {
      this.macros.push({ type: 'message', content: message, timestamp: Date.now() });
    }
    
    const result = await super.sendMessage(message);
    
    this.profiler.metrics.push(Date.now() - this.profiler.start);
    if (this.profiler.metrics.length > 50) this.profiler.metrics.shift();
    
    return result;
  }
}

export default AIAgentUISophisticated;
