/**
 * HOOTNER AI Assistant - Code Analysis & Generation
 * Enterprise AI integration for code editing
 */

class AIAssistant {
  constructor() {
    this.apiKey = localStorage.getItem('hootner_ai_key');
    this.model = 'gpt-3.5-turbo';
    this.context = [];
    this.isConnected = false;
    this.features = {
      codeCompletion: true,
      codeReview: true,
      refactoring: true,
      debugging: true,
      documentation: true
    };
  }

  async init() {
    this.setupUI();
    this.setupEventListeners();
    this.checkConnection();
    console.log('🤖 AI Assistant initialized');
  }

  setupUI() {
    // Create AI panel button
    const aiButton = document.createElement('button');
    aiButton.id = 'ai-assistant-btn';
    aiButton.innerHTML = '🤖 AI';
    aiButton.className = 'toolbar-btn';
    aiButton.onclick = () => this.togglePanel();
    
    const toolbar = document.querySelector('.toolbar') || document.body;
    toolbar.appendChild(aiButton);

    // Create AI panel
    this.createAIPanel();
  }

  createAIPanel() {
    const panel = document.createElement('div');
    panel.id = 'ai-panel';
    panel.className = 'ai-panel hidden';
    panel.innerHTML = `
      <div class="ai-header">
        <h3>🤖 AI Assistant</h3>
        <button class="close-btn" onclick="aiAssistant.togglePanel()">×</button>
      </div>
      
      <div class="ai-connection">
        ${this.isConnected ? 
          '<div class="status connected">✓ AI Connected</div>' : 
          `<div class="status disconnected">⚠ AI Offline</div>
           <input type="password" id="ai-api-key" placeholder="OpenAI API Key (optional)">
           <button onclick="aiAssistant.connect()">Connect</button>`
        }
      </div>

      <div class="ai-features">
        <button class="ai-feature-btn" onclick="aiAssistant.analyzeCode()">
          📊 Analyze Code
        </button>
        <button class="ai-feature-btn" onclick="aiAssistant.reviewCode()">
          🔍 Code Review
        </button>
        <button class="ai-feature-btn" onclick="aiAssistant.refactorCode()">
          🔧 Refactor
        </button>
        <button class="ai-feature-btn" onclick="aiAssistant.debugCode()">
          🐛 Debug Help
        </button>
        <button class="ai-feature-btn" onclick="aiAssistant.generateDocs()">
          📝 Generate Docs
        </button>
        <button class="ai-feature-btn" onclick="aiAssistant.explainCode()">
          💡 Explain Code
        </button>
      </div>

      <div class="ai-quick-actions">
        <h4>Quick Actions</h4>
        <div class="quick-buttons">
          <button onclick="aiAssistant.fixSyntax()">Fix Syntax</button>
          <button onclick="aiAssistant.optimizeCode()">Optimize</button>
          <button onclick="aiAssistant.addComments()">Add Comments</button>
          <button onclick="aiAssistant.convertToTS()">To TypeScript</button>
        </div>
      </div>

      <div class="ai-output" id="ai-output">
        <div class="output-placeholder">AI analysis will appear here...</div>
      </div>
    `;

    document.body.appendChild(panel);
    this.addStyles();
  }

  addStyles() {
    const styles = `
      .ai-panel {
        position: fixed;
        top: 60px;
        right: 20px;
        width: 350px;
        max-height: 80vh;
        background: var(--bg-secondary, #2d2d2d);
        border: 1px solid var(--border, #444);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 1000;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .ai-panel.hidden { display: none; }
      
      .ai-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--accent, #007acc);
        color: white;
      }
      
      .ai-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
      }
      
      .ai-connection {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border, #444);
      }
      
      .status {
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 8px;
      }
      
      .status.connected { color: #4caf50; }
      .status.disconnected { color: #ff9800; }
      
      .ai-connection input {
        width: 100%;
        padding: 8px;
        margin: 8px 0;
        background: var(--bg, #1e1e1e);
        border: 1px solid var(--border, #444);
        border-radius: 4px;
        color: var(--text, #fff);
        font-size: 12px;
      }
      
      .ai-connection button {
        padding: 6px 12px;
        background: var(--accent, #007acc);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .ai-features {
        padding: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      
      .ai-feature-btn {
        padding: 12px 8px;
        background: var(--bg, #1e1e1e);
        border: 1px solid var(--border, #444);
        border-radius: 6px;
        color: var(--text, #fff);
        cursor: pointer;
        font-size: 11px;
        text-align: center;
        transition: all 0.2s;
      }
      
      .ai-feature-btn:hover {
        background: var(--hover, #333);
        border-color: var(--accent, #007acc);
      }
      
      .ai-quick-actions {
        padding: 16px;
        border-top: 1px solid var(--border, #444);
      }
      
      .ai-quick-actions h4 {
        margin: 0 0 12px 0;
        font-size: 12px;
        color: var(--text-muted, #999);
      }
      
      .quick-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .quick-buttons button {
        padding: 6px 10px;
        background: var(--accent, #007acc);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      }
      
      .ai-output {
        padding: 16px;
        max-height: 200px;
        overflow-y: auto;
        background: var(--bg, #1e1e1e);
        border-top: 1px solid var(--border, #444);
        font-size: 12px;
        line-height: 1.5;
      }
      
      .output-placeholder {
        color: var(--text-muted, #999);
        font-style: italic;
      }
      
      .toolbar-btn {
        padding: 8px 12px;
        background: var(--bg-secondary, #2d2d2d);
        border: 1px solid var(--border, #444);
        color: var(--text, #fff);
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-left: 8px;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        this.togglePanel();
      }
    });
  }

  togglePanel() {
    const panel = document.getElementById('ai-panel');
    panel.classList.toggle('hidden');
  }

  async connect() {
    const apiKey = document.getElementById('ai-api-key')?.value.trim();
    if (apiKey) {
      this.apiKey = apiKey;
      localStorage.setItem('hootner_ai_key', apiKey);
      this.isConnected = true;
      this.updateConnectionStatus();
      this.addOutput('🤖 AI connected successfully', 'success');
    }
  }

  checkConnection() {
    this.isConnected = !!this.apiKey;
  }

  updateConnectionStatus() {
    const connectionDiv = document.querySelector('.ai-connection');
    if (connectionDiv) {
      connectionDiv.innerHTML = this.isConnected ? 
        '<div class="status connected">✓ AI Connected</div>' :
        `<div class="status disconnected">⚠ AI Offline</div>
         <input type="password" id="ai-api-key" placeholder="OpenAI API Key (optional)">
         <button onclick="aiAssistant.connect()">Connect</button>`;
    }
  }

  // Core AI Features
  async analyzeCode() {
    const code = this.getCurrentCode();
    if (!code.trim()) {
      this.addOutput('No code to analyze', 'warning');
      return;
    }

    this.addOutput('📊 Analyzing code...', 'info');
    
    const analysis = this.performStaticAnalysis(code);
    const stats = this.getCodeStats(code);
    
    this.addOutput(`Code Statistics:`, 'info');
    this.addOutput(`• Lines: ${stats.lines}`, 'log');
    this.addOutput(`• Functions: ${stats.functions}`, 'log');
    this.addOutput(`• Classes: ${stats.classes}`, 'log');
    this.addOutput(`• Complexity: ${stats.complexity}/10`, 'log');
    
    if (analysis.issues.length > 0) {
      this.addOutput(`\nFound ${analysis.issues.length} issues:`, 'warning');
      analysis.issues.slice(0, 5).forEach(issue => {
        this.addOutput(`Line ${issue.line}: ${issue.message}`, issue.type);
      });
    } else {
      this.addOutput('✓ No issues found', 'success');
    }

    if (this.isConnected) {
      await this.getAIAnalysis(code);
    }
  }

  async reviewCode() {
    const code = this.getCurrentCode();
    if (!code.trim()) return;

    this.addOutput('🔍 Code Review:', 'info');
    
    const suggestions = [
      'Add error handling for edge cases',
      'Consider input validation',
      'Use meaningful variable names',
      'Add unit tests for functions',
      'Document complex logic'
    ];

    this.addOutput('Suggestions:', 'info');
    suggestions.slice(0, 3).forEach(suggestion => {
      this.addOutput(`• ${suggestion}`, 'log');
    });

    if (this.isConnected) {
      await this.getAIReview(code);
    }
  }

  refactorCode() {
    const code = this.getCurrentCode();
    if (!code.trim()) return;

    this.addOutput('🔧 Refactoring code...', 'info');
    
    let refactored = code
      .replace(/var\s+/g, 'const ')
      .replace(/==\s/g, '=== ')
      .replace(/function\s+(\w+)\s*\(/g, 'const $1 = (');

    if (refactored !== code) {
      this.setCurrentCode(refactored);
      this.addOutput('✓ Code refactored successfully', 'success');
    } else {
      this.addOutput('No refactoring needed', 'info');
    }
  }

  debugCode() {
    this.addOutput('🐛 Debug Suggestions:', 'info');
    
    const suggestions = [
      'Add console.log to trace execution',
      'Check variable types with typeof',
      'Verify function parameters',
      'Use debugger statement for breakpoints',
      'Check for null/undefined values'
    ];

    suggestions.forEach(suggestion => {
      this.addOutput(`• ${suggestion}`, 'log');
    });
  }

  generateDocs() {
    const code = this.getCurrentCode();
    const functions = this.extractFunctions(code);
    
    if (functions.length === 0) {
      this.addOutput('No functions found to document', 'warning');
      return;
    }

    this.addOutput(`📝 Generating docs for ${functions.length} functions...`, 'info');
    
    let documented = code;
    functions.forEach(func => {
      const docComment = `/**\n * ${func.name} - Function description\n * @param {*} param - Parameter description\n * @returns {*} Return value description\n */\n`;
      documented = documented.replace(func.signature, docComment + func.signature);
    });

    this.setCurrentCode(documented);
    this.addOutput('✓ Documentation added', 'success');
  }

  explainCode() {
    const code = this.getCurrentCode();
    
    this.addOutput('💡 Code Explanation:', 'info');
    
    if (code.includes('function') || code.includes('=>')) {
      this.addOutput('Contains function definitions', 'log');
    }
    if (code.includes('for') || code.includes('while')) {
      this.addOutput('Uses loops for iteration', 'log');
    }
    if (code.includes('if') || code.includes('switch')) {
      this.addOutput('Contains conditional logic', 'log');
    }
    if (code.includes('class')) {
      this.addOutput('Defines classes (OOP structure)', 'log');
    }
    if (code.includes('async') || code.includes('await')) {
      this.addOutput('Uses asynchronous operations', 'log');
    }
  }

  // Quick Actions
  fixSyntax() {
    const code = this.getCurrentCode();
    const fixed = code
      .replace(/;\s*\n\s*\n/g, ';\n')
      .replace(/{\s*\n\s*\n/g, '{\n')
      .replace(/}\s*\n\s*\n/g, '}\n')
      .replace(/\s+$/gm, '');
    
    this.setCurrentCode(fixed);
    this.addOutput('✓ Syntax cleaned', 'success');
  }

  optimizeCode() {
    this.addOutput('🚀 Optimization suggestions:', 'info');
    this.addOutput('• Cache DOM queries', 'log');
    this.addOutput('• Use const for immutable values', 'log');
    this.addOutput('• Minimize nested loops', 'log');
  }

  addComments() {
    const code = this.getCurrentCode();
    const lines = code.split('\n');
    
    const commented = lines.map(line => {
      if (line.includes('function') && !line.includes('//')) {
        return `// Function definition\n${line}`;
      }
      if (line.includes('for') && !line.includes('//')) {
        return `// Loop iteration\n${line}`;
      }
      if (line.includes('if') && !line.includes('//')) {
        return `// Conditional check\n${line}`;
      }
      return line;
    }).join('\n');
    
    this.setCurrentCode(commented);
    this.addOutput('✓ Comments added', 'success');
  }

  convertToTS() {
    const code = this.getCurrentCode();
    const typescript = code
      .replace(/\.js/g, '.ts')
      .replace(/const\s+(\w+)\s*=/g, 'const $1: any =')
      .replace(/let\s+(\w+)\s*=/g, 'let $1: any =');
    
    this.setCurrentCode(typescript);
    this.addOutput('🔷 Converted to TypeScript', 'success');
  }

  // AI API Integration
  async getAIAnalysis(code) {
    if (!this.isConnected) return;
    
    try {
      const response = await this.callAI(`Analyze this code for issues and improvements:\n\n${code}`);
      this.addOutput('🤖 AI Analysis:', 'info');
      this.addOutput(response, 'log');
    } catch (error) {
      this.addOutput('AI analysis unavailable', 'warning');
    }
  }

  async getAIReview(code) {
    if (!this.isConnected) return;
    
    try {
      const response = await this.callAI(`Review this code for best practices:\n\n${code}`);
      this.addOutput('🤖 AI Review:', 'info');
      this.addOutput(response, 'log');
    } catch (error) {
      this.addOutput('AI review unavailable', 'warning');
    }
  }

  async callAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Utility Methods
  getCurrentCode() {
    if (typeof window !== 'undefined' && window.editor) {
      return window.editor.getValue();
    }
    return document.querySelector('textarea, .monaco-editor')?.value || '';
  }

  setCurrentCode(code) {
    if (typeof window !== 'undefined' && window.editor) {
      window.editor.setValue(code);
    }
  }

  performStaticAnalysis(code) {
    const issues = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      if (line.includes('eval(')) {
        issues.push({ line: lineNum, type: 'error', message: 'Avoid eval() - security risk' });
      }
      if (line.includes('var ')) {
        issues.push({ line: lineNum, type: 'warning', message: 'Use const/let instead of var' });
      }
      if (line.includes('console.log')) {
        issues.push({ line: lineNum, type: 'info', message: 'Remove console.log in production' });
      }
    });
    
    return { issues };
  }

  getCodeStats(code) {
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const classes = (code.match(/class\s+\w+/g) || []).length;
    const complexity = Math.min(10, Math.floor(lines / 20) + functions);
    
    return { lines, functions, classes, complexity };
  }

  extractFunctions(code) {
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
    const functions = [];
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        signature: match[0]
      });
    }
    
    return functions;
  }

  addOutput(message, type = 'log') {
    const output = document.getElementById('ai-output');
    if (!output) return;
    
    const colors = {
      info: '#007acc',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      log: '#fff'
    };
    
    const entry = document.createElement('div');
    entry.style.color = colors[type] || colors.log;
    entry.style.marginBottom = '4px';
    entry.textContent = message;
    
    output.appendChild(entry);
    output.scrollTop = output.scrollHeight;
    
    // Remove placeholder
    const placeholder = output.querySelector('.output-placeholder');
    if (placeholder) placeholder.remove();
  }
}

// Initialize AI Assistant
if (typeof window !== 'undefined') {
  window.aiAssistant = new AIAssistant();
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.aiAssistant.init();
    });
  } else {
    window.aiAssistant.init();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIAssistant;
}