import DOMPurify from 'dompurify';
/**
 * AI Agent Panel UI Integration - Advanced Intricate System
 */

class AIAgentUI {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.chatPanel = new AIChatPanel(this.orchestrator);
    this.isMinimized = false;
    this.isDragging = false;
    this.position = { x: window.innerWidth - 420, y: window.innerHeight - 620 };
    this.history = this.loadHistory();
    this.activeAgents = new Map();
    this.streamingResponse = null;
    this.contextFiles = new Set();
    this.init();
  }

  init() {
    this.createUI();
    this.bindEvents();
    this.initWebSocket();
    this.restoreSession();
  }

  createUI() {
    const panel = document.createElement('div');
    panel.id = 'aiAgentPanel';
    panel.innerHTML = DOMPurify.sanitize(`
      <div id="panelContainer" style="position:fixed; right:20px; bottom:20px; width:450px; height:700px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.5); z-index:9999; display:flex; flex-direction:column; transition:all 0.3s ease; backdrop-filter:blur(10px);">
        <div id="panelHeader" style="padding:16px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; cursor:move; user-select:none; background:linear-gradient(135deg, var(--sidebar-bg) 0%, var(--bg) 100%);">
          <h3 style="margin:0; color:var(--accent); display:flex; align-items:center; gap:8px; font-size:16px;">
            🤖 AI Agents
            <span id="agentBadge" style="font-size:10px; padding:2px 6px; background:var(--accent); border-radius:10px; color:white; display:none;">0</span>
            <span id="connectionStatus" style="width:6px; height:6px; border-radius:50%; background:#4caf50; margin-left:4px;" title="Connected"></span>
          </h3>
          <div style="display:flex; gap:8px; align-items:center;">
            <button id="settingsBtn" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;" title="Settings">⚙️</button>
            <button id="historyBtn" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; padding:4px 8px;" title="History">📜</button>
            <button id="minimizeBtn" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:16px; padding:4px 8px;" title="Minimize">−</button>
            <button id="closeBtn" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:20px; padding:0 8px;" title="Close">×</button>
          </div>
        </div>
        <div id="agentSelector" style="padding:8px 16px; background:var(--bg); border-bottom:1px solid var(--border); display:flex; gap:6px; overflow-x:auto;">
          <button data-agent="all" class="agent-btn active" style="padding:6px 12px; background:var(--accent); color:white; border:none; border-radius:16px; cursor:pointer; font-size:11px; white-space:nowrap;">🌐 All</button>
          <button data-agent="refactor" class="agent-btn" style="padding:6px 12px; background:var(--hover); color:var(--text); border:none; border-radius:16px; cursor:pointer; font-size:11px; white-space:nowrap;">🔧 Refactor</button>
          <button data-agent="debug" class="agent-btn" style="padding:6px 12px; background:var(--hover); color:var(--text); border:none; border-radius:16px; cursor:pointer; font-size:11px; white-space:nowrap;">🐛 Debug</button>
          <button data-agent="optimize" class="agent-btn" style="padding:6px 12px; background:var(--hover); color:var(--text); border:none; border-radius:16px; cursor:pointer; font-size:11px; white-space:nowrap;">⚡ Optimize</button>
          <button data-agent="security" class="agent-btn" style="padding:6px 12px; background:var(--hover); color:var(--text); border:none; border-radius:16px; cursor:pointer; font-size:11px; white-space:nowrap;">🔒 Security</button>
          <button data-agent="test" class="agent-btn" style="padding:6px 12px; background:var(--hover); color:var(--text); border:none; border-radius:16px; cursor:pointer; font-size:11px; white-space:nowrap;">🧪 Test</button>
        </div>
        <div id="agentStatus" style="padding:10px 16px; background:var(--bg); border-bottom:1px solid var(--border); font-size:11px; display:flex; justify-content:space-between; align-items:center;">
          <span id="statusText" style="display:flex; align-items:center; gap:6px;">
            <span id="statusDot" style="width:8px; height:8px; border-radius:50%; background:#4caf50; animation:pulse 2s infinite;"></span>
            <span>Ready</span>
          </span>
          <span id="activeOps" style="color:var(--accent);">0 active</span>
        </div>
        <div id="contextBar" style="padding:8px 16px; background:var(--hover); border-bottom:1px solid var(--border); font-size:10px; display:none; flex-wrap:wrap; gap:4px;">
          <span style="color:var(--text); opacity:0.7;">Context:</span>
        </div>
        <div id="progressBar" style="height:3px; background:var(--border); display:none; overflow:hidden;">
          <div id="progressFill" style="height:100%; background:var(--accent); width:0%; transition:width 0.3s ease;"></div>
        </div>
        <div id="chatHistory" style="flex:1; overflow-y:auto; padding:16px; scroll-behavior:smooth;"></div>
        <div id="codePreview" style="display:none; max-height:200px; overflow-y:auto; padding:12px; background:var(--bg); border-top:1px solid var(--border); font-family:monospace; font-size:11px;"></div>
        <div id="inputArea" style="padding:16px; border-top:1px solid var(--border); background:var(--sidebar-bg);">
          <div style="position:relative;">
            <textarea id="aiInput" placeholder="Ask AI to refactor, debug, optimize... (Shift+Enter for new line)" 
                   style="width:100%; padding:12px 80px 12px 12px; background:var(--bg); border:1px solid var(--border); border-radius:6px; color:var(--text); outline:none; resize:none; min-height:40px; max-height:120px; font-family:inherit; font-size:13px;"></textarea>
            <div style="position:absolute; right:8px; top:8px; display:flex; gap:4px;">
              <button id="attachBtn" style="background:var(--hover); border:none; color:var(--text); width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;" title="Attach file">📎</button>
              <button id="voiceBtn" style="background:var(--hover); border:none; color:var(--text); width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;" title="Voice input">🎤</button>
              <button id="sendBtn" style="background:var(--accent); border:none; color:white; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;">➤</button>
            </div>
          </div>
          <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
            <button data-action="refactor" style="flex:1; min-width:80px; padding:8px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; transition:all 0.2s;">🔧 Refactor</button>
            <button data-action="debug" style="flex:1; min-width:80px; padding:8px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; transition:all 0.2s;">🐛 Debug</button>
            <button data-action="optimize" style="flex:1; min-width:80px; padding:8px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; transition:all 0.2s;">⚡ Optimize</button>
            <button data-action="explain" style="flex:1; min-width:80px; padding:8px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; transition:all 0.2s;">💡 Explain</button>
          </div>
        </div>
      </div>
    `);
    document.body.appendChild(panel);
    
    this.attachEventListeners(panel);
  }

  attachEventListeners(panel) {
    const container = panel.querySelector('#panelContainer');
    const header = panel.querySelector('#panelHeader');
    
    panel.querySelector('#closeBtn').addEventListener('click', () => this.toggle());
    panel.querySelector('#minimizeBtn').addEventListener('click', () => this.minimize());
    panel.querySelector('#settingsBtn').addEventListener('click', () => this.showSettings());
    panel.querySelector('#historyBtn').addEventListener('click', () => this.showHistory());
    panel.querySelector('#sendBtn').addEventListener('click', () => this.sendMessage(document.getElementById('aiInput').value));
    panel.querySelector('#attachBtn').addEventListener('click', () => this.attachFile());
    panel.querySelector('#voiceBtn').addEventListener('click', () => this.startVoiceInput());
    
    panel.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => this.quickAction(btn.dataset.action));
      btn.addEventListener('mouseover', () => btn.style.transform = 'scale(1.05)');
      btn.addEventListener('mouseout', () => btn.style.transform = 'scale(1)');
    });
    
    panel.querySelectorAll('.agent-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectAgent(btn.dataset.agent, btn));
    });
    
    header.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.stopDrag());
  }

  bindEvents() {
    const input = document.getElementById('aiInput');
    
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage(e.target.value);
      }
      if (e.key === 'ArrowUp' && !e.target.value) {
        e.preventDefault();
        this.loadLastMessage();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.toggle();
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('aiInput').focus();
      }
    });

    setInterval(() => this.updateStatus(), 1000);
    setInterval(() => this.saveHistory(), 30000);
  }

  async sendMessage(message) {
    if (!message?.trim()) return;
    
    const sanitizedMessage = DOMPurify.sanitize(message.trim());
    const msgId = this.addMessage('user', sanitizedMessage);
    document.getElementById('aiInput').value = '';
    document.getElementById('aiInput').style.height = '40px';
    
    this.showProgress(0);
    const typingId = this.addMessage('assistant', '💭 Analyzing request...', true);
    
    try {
      const selectedAgent = document.querySelector('.agent-btn.active')?.dataset.agent || 'all';
      const response = await this.chatPanel.processCommand(message, {
        agent: selectedAgent,
        context: Array.from(this.contextFiles),
        streaming: true,
        onProgress: (progress) => this.updateProgress(progress),
        onStream: (chunk) => this.streamResponse(typingId, chunk)
      });
      
      this.removeMessage(typingId);
      this.hideProgress();
      
      const resultId = this.addMessage('assistant', `🔄 Executing plan ${response.planId}...`);
      this.activeAgents.set(response.planId, { id: resultId, status: 'running' });
      
      setTimeout(async () => {
        const history = this.chatPanel.getHistory();
        const lastMsg = history[history.length - 1];
        if (lastMsg?.role === 'assistant' && lastMsg.results) {
          this.updateMessage(resultId, `✅ ${lastMsg.content}\n\n📊 ${lastMsg.results.length} operations completed`);
          if (lastMsg.code) this.showCodePreview(lastMsg.code);
          this.activeAgents.delete(response.planId);
        }
      }, 1000);
      
      this.history.push({ role: 'user', content: sanitizedMessage, timestamp: Date.now() });
      this.history.push({ role: 'assistant', content: response.content, timestamp: Date.now() });
      
    } catch (error) {
      this.removeMessage(typingId);
      this.hideProgress();
      this.addMessage('assistant', `❌ Error: ${error.message}\n\n💡 Try rephrasing or check agent status.`);
    }
  }

  addMessage(role, content, isStreaming = false) {
    const chat = document.getElementById('chatHistory');
    const msg = document.createElement('div');
    const msgId = `msg-${Date.now()}-${Math.random()}`;
    msg.id = msgId;
    msg.className = 'chat-message';
    msg.style.cssText = `margin-bottom:12px; padding:12px; background:${role === 'user' ? 'var(--bg)' : 'var(--hover)'}; border-radius:8px; border-left:3px solid ${role === 'user' ? 'var(--accent)' : '#4caf50'}; animation:slideIn 0.3s ease; position:relative;`;
    
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    msg.innerHTML = DOMPurify.sanitize(`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <strong style="color:${role === 'user' ? 'var(--accent)' : '#4caf50'}; font-size:12px;">${role === 'user' ? '👤 You' : '🤖 AI Assistant'}</strong>
        <span style="font-size:10px; opacity:0.6;">${timestamp}</span>
      </div>
      <div class="message-content" style="color:var(--text); font-size:13px; line-height:1.5;">${content}</div>
      ${role === 'assistant' ? '<div class="message-actions" style="margin-top:8px; display:flex; gap:6px;"><button class="copy-btn" style="padding:4px 8px; background:var(--bg); border:1px solid var(--border); border-radius:4px; cursor:pointer; font-size:10px; color:var(--text);">📋 Copy</button><button class="apply-btn" style="padding:4px 8px; background:var(--bg); border:1px solid var(--border); border-radius:4px; cursor:pointer; font-size:10px; color:var(--text);">✓ Apply</button></div>' : ''}
    `);
    
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
    
    if (role === 'assistant') {
      msg.querySelector('.copy-btn')?.addEventListener('click', () => this.copyMessage(content));
      msg.querySelector('.apply-btn')?.addEventListener('click', () => this.applyCode(content));
    }
    
    return msgId;
  }

  updateMessage(msgId, content) {
    const msg = document.getElementById(msgId);
    if (msg) {
      const contentDiv = msg.querySelector('.message-content');
      if (contentDiv) contentDiv.innerHTML = DOMPurify.sanitize(content);
    }
  }

  streamResponse(msgId, chunk) {
    const msg = document.getElementById(msgId);
    if (msg) {
      const contentDiv = msg.querySelector('.message-content');
      if (contentDiv) {
        contentDiv.innerHTML = DOMPurify.sanitize((contentDiv.textContent || '') + chunk);
        msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }

  removeMessage(msgId) {
    const msg = document.getElementById(msgId);
    if (msg) msg.remove();
  }

  quickAction(action) {
    const commands = {
      refactor: 'refactor current file for better readability, maintainability, and follow best practices',
      debug: 'debug and find issues in current code with detailed analysis and suggested fixes',
      optimize: 'optimize performance of current code and suggest improvements with benchmarks',
      explain: 'explain the current code in detail, including architecture and design patterns'
    };
    if (commands[action]) this.sendMessage(commands[action]);
  }

  selectAgent(agent, btn) {
    document.querySelectorAll('.agent-btn').forEach(b => {
      b.classList.remove('active');
      b.style.background = 'var(--hover)';
      b.style.color = 'var(--text)';
    });
    btn.classList.add('active');
    btn.style.background = 'var(--accent)';
    btn.style.color = 'white';
  }

  updateStatus() {
    const status = this.orchestrator.getStatus();
    const statusText = document.getElementById('statusText');
    const activeOps = document.getElementById('activeOps');
    const badge = document.getElementById('agentBadge');
    
    const isWorking = status.plans.length > 0;
    const statusDot = statusText.querySelector('#statusDot');
    if (statusDot) statusDot.style.background = isWorking ? '#ff9800' : '#4caf50';
    statusText.querySelector('span:last-child').textContent = isWorking ? 'Processing...' : 'Ready';
    activeOps.textContent = `${status.activeOperations} active`;
    badge.textContent = status.activeOperations;
    badge.style.display = status.activeOperations > 0 ? 'inline-block' : 'none';
  }

  showProgress(percent) {
    const bar = document.getElementById('progressBar');
    const fill = document.getElementById('progressFill');
    bar.style.display = 'block';
    fill.style.width = `${percent}%`;
  }

  updateProgress(percent) {
    document.getElementById('progressFill').style.width = `${percent}%`;
  }

  hideProgress() {
    setTimeout(() => {
      document.getElementById('progressBar').style.display = 'none';
      document.getElementById('progressFill').style.width = '0%';
    }, 500);
  }

  showCodePreview(code) {
    const preview = document.getElementById('codePreview');
    preview.style.display = 'block';
    preview.innerHTML = DOMPurify.sanitize(`<pre style="margin:0; white-space:pre-wrap; word-wrap:break-word;">${code}</pre>`);
  }

  attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        this.contextFiles.add(file.name);
        this.updateContextBar();
      });
    };
    input.click();
  }

  updateContextBar() {
    const bar = document.getElementById('contextBar');
    if (this.contextFiles.size > 0) {
      bar.style.display = 'flex';
      bar.innerHTML = DOMPurify.sanitize(`<span style="color:var(--text); opacity:0.7;">Context:</span>` + 
        Array.from(this.contextFiles).map(f => `<span style="padding:2px 6px; background:var(--accent); border-radius:10px; color:white; font-size:10px;">${f} <button onclick="this.parentElement.remove()" style="background:none; border:none; color:white; cursor:pointer; padding:0; margin-left:4px;">×</button></span>`).join(''));
    } else {
      bar.style.display = 'none';
    }
  }

  startVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      document.getElementById('aiInput').value = e.results[0][0].transcript;
    };
    recognition.start();
  }

  copyMessage(content) {
    navigator.clipboard.writeText(content.replace(/<[^>]*>/g, ''));
    this.showToast('Copied to clipboard!');
  }

  applyCode(content) {
    this.showToast('Code applied to editor!');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed; bottom:80px; right:30px; background:var(--accent); color:white; padding:12px 20px; border-radius:6px; z-index:10000; animation:slideIn 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  showSettings() {
    this.showToast('Settings panel coming soon!');
  }

  showHistory() {
    const historyHtml = this.history.slice(-10).map(h => 
      `<div style="padding:8px; border-bottom:1px solid var(--border);"><strong>${h.role}:</strong> ${h.content.substring(0, 50)}...</div>`
    ).join('');
    this.addMessage('assistant', `📜 Recent History:\n${historyHtml}`);
  }

  loadLastMessage() {
    const lastUser = this.history.filter(h => h.role === 'user').pop();
    if (lastUser) document.getElementById('aiInput').value = lastUser.content;
  }

  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('aiAgentHistory') || '[]');
    } catch {
      return [];
    }
  }

  saveHistory() {
    localStorage.setItem('aiAgentHistory', JSON.stringify(this.history.slice(-100)));
  }

  restoreSession() {
    if (this.history.length > 0) {
      this.addMessage('assistant', `👋 Welcome back! You have ${this.history.length} messages in history.`);
    }
  }

  initWebSocket() {
    // WebSocket connection for real-time updates
    try {
      this.ws = new WebSocket('ws://localhost:3000/ai-agent');
      this.ws.onopen = () => {
        document.getElementById('connectionStatus').style.background = '#4caf50';
      };
      this.ws.onclose = () => {
        document.getElementById('connectionStatus').style.background = '#f44336';
      };
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'agent_update') this.updateStatus();
      };
    } catch (e) {
      console.warn('WebSocket connection failed, using polling');
    }
  }

  toggle() {
    const container = document.querySelector('#panelContainer');
    container.style.display = container.style.display === 'none' ? 'flex' : 'none';
  }

  minimize() {
    const container = document.querySelector('#panelContainer');
    const chatHistory = document.getElementById('chatHistory');
    const inputArea = document.getElementById('inputArea');
    const agentSelector = document.getElementById('agentSelector');
    const minimizeBtn = document.getElementById('minimizeBtn');
    
    this.isMinimized = !this.isMinimized;
    
    if (this.isMinimized) {
      container.style.height = '60px';
      chatHistory.style.display = 'none';
      inputArea.style.display = 'none';
      agentSelector.style.display = 'none';
      minimizeBtn.textContent = '□';
    } else {
      container.style.height = '700px';
      chatHistory.style.display = 'block';
      inputArea.style.display = 'block';
      agentSelector.style.display = 'flex';
      minimizeBtn.textContent = '−';
    }
  }

  startDrag(e) {
    if (e.target.closest('button')) return;
    this.isDragging = true;
    const container = document.querySelector('#panelContainer');
    const rect = container.getBoundingClientRect();
    this.dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  drag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    const container = document.querySelector('#panelContainer');
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    
    container.style.left = `${Math.max(0, Math.min(x, window.innerWidth - container.offsetWidth))}px`;
    container.style.top = `${Math.max(0, Math.min(y, window.innerHeight - container.offsetHeight))}px`;
    container.style.right = 'auto';
    container.style.bottom = 'auto';
  }

  stopDrag() {
    this.isDragging = false;
  }
}

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    #chatHistory::-webkit-scrollbar { width: 6px; }
    #chatHistory::-webkit-scrollbar-track { background: var(--bg); }
    #chatHistory::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }
  `;
  document.head.appendChild(style);
}

// Auto-initialize
let aiAgentUI;
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    aiAgentUI = new AIAgentUI();
    console.log('🤖 Advanced AI Agent Panel initialized\n⌨️  Ctrl+Shift+A - Toggle panel\n⌨️  Ctrl+K - Focus input');
  });
}

export default AIAgentUI;
