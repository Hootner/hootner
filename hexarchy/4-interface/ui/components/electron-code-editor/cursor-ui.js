import DOMPurify from 'dompurify';

class CursorUI {
  constructor(editor) {
    this.aiModes = new CursorAIModes(editor);
    this.editor = editor;
    this.activeMode = null;
    this.sessionToken = crypto.randomUUID();
    this.init();
  }

  init() {
    this.createModeSelector();
    this.createInlineChat();
    this.bindShortcuts();
  }

  createModeSelector() {
    const selector = document.createElement('div');
    selector.id = 'aiModeSelector';
    selector.innerHTML = DOMPurify.sanitize(`
      <div style="position:fixed; top:80px; right:20px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:8px; padding:12px; z-index:9998;">
        <div style="font-size:12px; color:var(--text); margin-bottom:8px; font-weight:bold;">AI MODE</div>
        <button data-mode="chat" class="ai-mode-btn" style="display:block; width:100%; padding:8px; margin:4px 0; background:var(--bg); border:1px solid var(--border); border-radius:4px; color:var(--text); cursor:pointer; text-align:left;">💬 Chat</button>
        <button data-mode="write" class="ai-mode-btn" style="display:block; width:100%; padding:8px; margin:4px 0; background:var(--bg); border:1px solid var(--border); border-radius:4px; color:var(--text); cursor:pointer; text-align:left;">✍️ Write</button>
        <button data-mode="refactor" class="ai-mode-btn" style="display:block; width:100%; padding:8px; margin:4px 0; background:var(--bg); border:1px solid var(--border); border-radius:4px; color:var(--text); cursor:pointer; text-align:left;">🔧 Refactor</button>
        <button data-mode="modernize" class="ai-mode-btn" style="display:block; width:100%; padding:8px; margin:4px 0; background:var(--bg); border:1px solid var(--border); border-radius:4px; color:var(--text); cursor:pointer; text-align:left;">🚀 Modernize</button>
      </div>
    `);
    
    // Add event listeners instead of inline onclick
    selector.querySelectorAll('.ai-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
    });
    
    document.body.appendChild(selector);
  }

  createInlineChat() {
    const chat = document.createElement('div');
    chat.id = 'inlineAIChat';
    chat.style.display = 'none';
    chat.innerHTML = DOMPurify.sanitize(`
      <div style="position:fixed; bottom:80px; left:50%; transform:translateX(-50%); width:600px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:8px; padding:16px; z-index:9999; box-shadow:0 8px 32px rgba(0,0,0,0.5);">
        <div style="display:flex; align-items:center; margin-bottom:12px;">
          <span id="modeIndicator" style="font-weight:bold; color:var(--accent); margin-right:12px;">💬 CHAT</span>
          <input type="text" id="aiPrompt" placeholder="Ask AI or give instructions..." style="flex:1; padding:10px; background:var(--bg); border:1px solid var(--border); border-radius:4px; color:var(--text); outline:none;">
          <button id="sendBtn" style="margin-left:8px; padding:10px 20px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer;">Send</button>
        </div>
        <div id="aiResponse" style="max-height:200px; overflow-y:auto; padding:12px; background:var(--bg); border-radius:4px; font-size:13px; line-height:1.6;"></div>
      </div>
    `);
    
    // Add event listener instead of inline onclick
    chat.querySelector('#sendBtn').addEventListener('click', () => this.execute());
    
    document.body.appendChild(chat);
  }

  setMode(mode) {
    this.activeMode = mode;
    document.querySelectorAll('.ai-mode-btn').forEach(btn => {
      btn.style.background = btn.dataset.mode === mode ? 'var(--accent)' : 'var(--bg)';
    });
    
    const icons = { chat: '💬', write: '✍️', refactor: '🔧', modernize: '🚀' };
    const labels = { chat: 'CHAT', write: 'WRITE', refactor: 'REFACTOR', modernize: 'MODERNIZE' };
    document.getElementById('modeIndicator').textContent = `${icons[mode]} ${labels[mode]}`;
    document.getElementById('inlineAIChat').style.display = 'block';
    document.getElementById('aiPrompt').focus();
  }

  async execute() {
    const prompt = document.getElementById('aiPrompt').value;
    if (!prompt || !this.activeMode) return;

    const response = document.getElementById('aiResponse');
    response.innerHTML = DOMPurify.sanitize('<div style="color:var(--accent);">⏳ Processing...</div>');
    
    try {
      let result;
      switch (this.activeMode) {
        case 'chat':
          result = await this.aiModes.chatMode(prompt);
          response.innerHTML = DOMPurify.sanitize(`<div>${result.response}</div>`);
          break;
        case 'write':
          result = await this.aiModes.writeMode(prompt);
          response.innerHTML = DOMPurify.sanitize('<div style="color:#4caf50;">✅ Code generated</div>');
          break;
        case 'refactor':
          result = await this.aiModes.refactorMode(prompt);
          response.innerHTML = DOMPurify.sanitize(`<div style="color:#4caf50;">✅ Refactored: ${result.type}</div>`);
          break;
        case 'modernize':
          result = await this.aiModes.modernize(prompt || 'typescript');
          response.innerHTML = DOMPurify.sanitize(`<div style="color:#4caf50;">✅ Modernized to ${result.target}</div>`);
          break;
      }
    } catch (error) {
      response.innerHTML = DOMPurify.sanitize(`<div style="color:#f44336;">❌ Error: ${error.message}</div>`);
    }

    document.getElementById('aiPrompt').value = '';
  }

  bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.setMode('chat');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        this.setMode('write');
      }
      if (e.key === 'Escape' && this.activeMode) {
        document.getElementById('inlineAIChat').style.display = 'none';
        this.activeMode = null;
      }
    });

    document.getElementById('aiPrompt').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.execute();
    });
  }
}

let cursorUI;
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (window.editor) {
      cursorUI = new CursorUI(window.editor);
      window.cursorUI = cursorUI;
    }
  });
}
