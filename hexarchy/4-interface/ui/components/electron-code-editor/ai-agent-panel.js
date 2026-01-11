import DOMPurify from 'dompurify';
/**
 * AI Agent Panel UI Integration
 */

class AIAgentUI {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.chatPanel = new AIChatPanel(this.orchestrator);
    this.init();
  }

  init() {
    this.createUI();
    this.bindEvents();
  }

  createUI() {
    const panel = document.createElement('div');
    panel.id = 'aiAgentPanel';
    panel.innerHTML = DOMPurify.sanitize(`
      <div style="position:fixed; right:20px; bottom:20px; width:400px; height:600px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.5); z-index:9999; display:flex; flex-direction:column;">
        <div style="padding:16px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; color:var(--accent);">🤖 AI Agents</h3>
          <button style="background:none; border:none; color:var(--text); cursor:pointer; font-size:20px;">×</button>
        </div>
        <div id="agentStatus" style="padding:12px; background:var(--bg); border-bottom:1px solid var(--border); font-size:12px;">
          <span id="statusText">Ready</span> | <span id="activeOps">0 active</span>
        </div>
        <div id="chatHistory" style="flex:1; overflow-y:auto; padding:16px;"></div>
        <div style="padding:16px; border-top:1px solid var(--border);">
          <input type="text" id="aiInput" placeholder="Ask AI to refactor, debug, optimize..." 
                 style="width:100%; padding:12px; background:var(--bg); border:1px solid var(--border); border-radius:6px; color:var(--text); outline:none;">
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button data-action="refactor" style="flex:1; padding:8px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">Refactor</button>
            <button data-action="debug" style="flex:1; padding:8px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">Debug</button>
            <button data-action="optimize" style="flex:1; padding:8px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">Optimize</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    
    // Add event listeners instead of inline onclick
    panel.querySelector('button').addEventListener('click', () => this.toggle());
    panel.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => this.quickAction(btn.dataset.action));
    });
  }

  bindEvents() {
    const input = document.getElementById('aiInput');
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage(e.target.value);
    });

    setInterval(() => this.updateStatus(), UI_CONSTANTS.ANIMATION_VERY_SLOW);
  }

  async sendMessage(message) {
    if (!message || typeof message !== 'string' || !message.trim()) return;
    
    // Sanitize message to prevent XSS
    const sanitizedMessage = DOMPurify.sanitize(message.trim());
    
    this.addMessage('user', sanitizedMessage);
    document.getElementById('aiInput').value = '';
    
    const response = await this.chatPanel.processCommand(message);
    this.addMessage('assistant', `🔄 Executing plan ${response.planId}...`);
    
    setTimeout(() => {
      const history = this.chatPanel.getHistory();
      const lastMsg = history[history.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.results) {
        this.addMessage('assistant', `✅ ${lastMsg.content}\n${lastMsg.results.length} operations completed`);
      }
    }, UI_CONSTANTS.TIMEOUT_SHORT);
  }

  addMessage(role, content) {
    const chat = document.getElementById('chatHistory');
    const msg = document.createElement('div');
    msg.style.cssText = `margin-bottom:12px; padding:12px; background:${role === 'user' ? 'var(--bg)' : 'var(--hover)'}; border-radius:8px; border-left:3px solid ${role === 'user' ? 'var(--accent)' : '#4caf50'};`;
    msg.innerHTML = DOMPurify.sanitize(`<strong>${role === 'user' ? 'You' : 'AI'}:</strong><br>${content}`);
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  quickAction(action) {
    const commands = {
      refactor: 'refactor current file for better readability',
      debug: 'debug and find issues in current code',
      optimize: 'optimize performance of current code'
    };
    this.sendMessage(commands[action]);
  }

  updateStatus() {
    const status = this.orchestrator.getStatus();
    document.getElementById('statusText').textContent = status.plans.length > 0 ? 'Working...' : 'Ready';
    document.getElementById('activeOps').textContent = `${status.activeOperations} active`;
  }

  toggle() {
    const panel = document.getElementById('aiAgentPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  }
}

// Auto-initialize
let aiAgentUI;
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    aiAgentUI = new AIAgentUI();
  });
}
