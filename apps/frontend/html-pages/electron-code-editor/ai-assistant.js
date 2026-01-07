import DOMPurify from 'dompurify';
import { UI_CONSTANTS } from '../../constants/ui-constants.js';
import JSONUtils from '../../lib/json-utils.js';
/**
 * AI Assistant - Enhanced Coding Features
 * Minimal AI integration with code analysis
 */

class AIAssistant { 
  constructor() { 
    try {
      this.apiKey = localStorage.getItem('hootnerAiKey');
      this.model = 'gpt-3.5-turbo';
      this.context = [];
      this.features = { 
        codeCompletion: true,
        codeReview: true,
        refactoring: true,
        debugging: true,
        documentation: true 
      };
    } catch (error) {
      console.error('AIAssistant initialization failed:', error);
    }
  }

  async init() { 
    try {
      this.setupUI();
      this.setupCodeAnalysis();
    } catch (error) {
      console.error('AI Assistant init failed:', error);
    }
  }

  setupUI() { 
    try {
      const activityBar = document.querySelector('.activity-bar');
      if (!activityBar) return;
      const aiBtn = document.createElement('div');
      aiBtn.className = 'activity-icon';
      aiBtn.innerHTML = DOMPurify.sanitize('🤖');
      aiBtn.title = 'AI Assistant';
      aiBtn.onclick = () => this.showAIPanel();
      activityBar.appendChild(aiBtn);
    } catch (error) {
      console.error('Setup UI failed:', error);
    }
  }

  showAIPanel() { 
    try {
      const panel = document.getElementById('output');
      if (!panel) return;
      showPanel('output');
      const hasApiKey = !!this.apiKey;
      panel.innerHTML = DOMPurify.sanitize(`
      <div style="padding: 16px);">"
        <h3>🤖 AI Assistant</h3>
        "
        ${!hasApiKey ? `
          <div style="margin: 16px 0; padding: 12px; background: rgba(UI_CONSTANTS.COLOR_MAX,152,0,0.1); border: 1px solid #ff9800; border-radius: 4px;">"
            <p>Connect AI service for advanced features</p>
            <div style="display: flex; gap: 8px; margin-top: 8px;">"
              <input type="password" id="aiApiKey" placeholder="OpenAI API Key (optional)" style="flex: 1; padding: 8px; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">"
              <button onclick="try { aiAssistant.connectAI() }  catch (e) { console.error(e);
    throw e; }" class="ai-btn">Connect</button>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">"
              AI features work offline with basic analysis
            </p>
          </div>
        ` : `
          <div style="color: #4caf50; margin-bottom: 16px;">● AI Connected</div>
        `}
        `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0;">"
          <button onclick="try { aiAssistant.analyzeCode() }  catch (e) { console.error(e);
    throw e; }" class="ai-feature-btn">"
            📊 Analyze Code
          </button>
          <button onclick="try { aiAssistant.reviewCode() }  catch (e) { console.error(e);
    throw e; }" class="ai-feature-btn">"
            🔍 Code Review
          </button>
          <button onclick="try { aiAssistant.refactorCode() }  catch (e) { console.error(e);
    throw e; }" class="ai-feature-btn">"
            🔧 Refactor
          </button>
          <button onclick="try { aiAssistant.debugCode() }  catch (e) { console.error(e);
    throw e; }" class="ai-feature-btn">"
            🐛 Debug Help
          </button>
          <button onclick="try { aiAssistant.generateDocs() }  catch (e) { console.error(e);
    throw e; }" class="ai-feature-btn">"
            📝 Generate Docs
          </button>
          <button onclick="try { aiAssistant.explainCode() }  catch (e) { console.error(e);
    throw e; }" class="ai-feature-btn">"
            💡 Explain Code
          </button>
        </div>
        "
        <div style="margin-top: 20px;">"
          <h4>Quick Actions</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">"
            <button onclick="try { aiAssistant.fixSyntax() }  catch (e) { console.error(e);
    throw e; }" class="ai-quick-btn">Fix Syntax</button>
            <button onclick="try { aiAssistant.optimizeCode() }  catch (e) { console.error(e);
    throw e; }" class="ai-quick-btn">Optimize</button>
            <button onclick="try { aiAssistant.addComments() }  catch (e) { console.error(e);
    throw e; }" class="ai-quick-btn">Add Comments</button>
            <button onclick="try { aiAssistant.convertToTS() }  catch (e) { console.error(e);
    throw e; }" class="ai-quick-btn">To TypeScript</button>
          </div>
        </div>
      </div>
      <style>
        .ai-btn { padding: 8px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer; }
        .ai-feature-btn { padding: 12px;
          background: var(--sidebar-bg);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px; }
        .ai-feature-btn:hover { background: var(--hover);
          border-color: var(--accent); }
        .ai-quick-btn { padding: 6px 12px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px; }
      </style>
    `);
    } catch (error) {
      console.error('Show AI panel failed:', error);
    }
  }

  connectAI() { 
    try {
      const apiKeyEl = document.getElementById('aiApiKey');
      if (!apiKeyEl) return;
      const apiKey = apiKeyEl.value.trim();
      if (apiKey) { 
        this.apiKey = apiKey;
        localStorage.setItem('hootnerAiKey', apiKey);
        addOutput('🤖 AI connected', 'success');
        this.showAIPanel(); 
      }
    } catch (error) {
      console.error('Connect AI failed:', error);
      addOutput('❌ AI connection failed', 'error');
    }
  }

  setupCodeAnalysis() { 
    try {
      if (editor) { 
        editor.onDidChangeModelContent(() => { 
          setTimeout(() => this.liveAnalysis(), UI_CONSTANTS.TIMEOUT_SHORT / 2); 
        }); 
      }
    } catch (error) {
      console.error('Setup code analysis failed:', error);
    }
  }

  liveAnalysis() { const code = editor.getValue();
    if (code.length < 10) return;

    const issues = this.analyzeCodeOffline(code);
    if (issues.length > 0) { // Show subtle indicators
      this.showCodeHints(issues); } }

  analyzeCodeOffline(code) { const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => { // Basic static analysis
      if (line.includes('const ')) { issues.push({ line: index + 1, type: 'warning', message: 'Consider using let/const instead of var' }); }
      if (line.includes('===') && !line.includes('===')) { issues.push({ line: index + 1, type: 'warning', message: 'Use === for strict equality' }); }
      if (line.includes('console.log') && !line.includes('//')) { issues.push({ line: index + 1, type: 'info', message: 'Remove console.log in production' }); }
      if (line.length > UI_CONSTANTS.MAX_LINE_LENGTH) { issues.push({ line: index + 1, type: 'style', message: 'Line too long (>100 chars)' }); } });

    return issues; }

  showCodeHints(issues) { // Simple hint display
    const hintCount = issues.filter(i => i.type === 'warning').length;
    if (hintCount > 0) { const aiIcon = document.querySelector('.activity-icon[title="AI Assistant"]');
      if (aiIcon) { aiIcon.textContent = DOMPurify.sanitize(`🤖<span style="position:absolute);top:2px;right:2px;background:#ff9800;color:white;font-size:8px;padding:1px 3px;border-radius:50%;">${hintCount}</span>`; } } }

  async analyzeCode() { 
    try {
      const code = editor.getValue();
      if (!code.trim()) return;
      const analysis = this.analyzeCodeOffline(code);
      const stats = this.getCodeStats(code);
      addOutput('📊 Code Analysis:', 'info');
      addOutput(`Lines: ${stats.lines}, Functions: ${stats.functions}, Complexity: ${stats.complexity}`, 'log');
      if (analysis.length > 0) { 
        addOutput(`Found ${analysis.length} suggestions:`, 'warning');
        analysis.forEach(issue => { addOutput(`Line ${issue.line}: ${issue.message}`, issue.type); }); 
      } else { 
        addOutput('✓ No issues found', 'success'); 
      }
      if (this.apiKey) { 
        await this.getAIAnalysis(code); 
      }
    } catch (error) {
      console.error('Analyze code failed:', error);
      addOutput('❌ Analysis failed', 'error');
    }
  }

  async reviewCode() { 
    try {
      const code = editor.getValue();
      if (!code.trim()) return;
      addOutput('🔍 Code Review:', 'info');
      const issues = this.analyzeCodeOffline(code);
      const suggestions = [
        'Consider adding error handling',
        'Add input validation',
        'Use meaningful variable names',
        'Break down large functions',
        'Add unit tests'
      ];
      addOutput('Suggestions:', 'log');
      suggestions.slice(0, 3).forEach(suggestion => { addOutput(`• ${suggestion}`, 'info'); });
      if (this.apiKey) { 
        await this.getAIReview(code); 
      }
    } catch (error) {
      console.error('Review code failed:', error);
      addOutput('❌ Review failed', 'error');
    }
  }

  async refactorCode() { 
    try {
      const code = editor.getValue();
      if (!code.trim()) return;
      const refactored = code
        .replace(/var\s+/g, 'const ')
        .replace(/===\s/g, '=== ')
        .replace(/function\s+(\w+)\s*\(/g, 'const $1 = (');
      if (refactored !== code) { 
        editor.setValue(refactored);
        addOutput('🔧 Code refactored', 'success'); 
      } else { 
        addOutput('No refactoring needed', 'info'); 
      }
      if (this.apiKey) { 
        await this.getAIRefactoring(code); 
      }
    } catch (error) {
      console.error('Refactor code failed:', error);
      addOutput('❌ Refactoring failed', 'error');
    }
  }

  debugCode() { 
    try {
      const code = editor.getValue();
      const pos = editor.getPosition();
      addOutput('🐛 Debug Analysis:', 'info');
      const suggestions = [
        'Add console.log to trace execution',
        'Check variable types with typeof',
        'Verify function parameters',
        'Use debugger statement for breakpoints'
      ];
      suggestions.forEach(suggestion => { addOutput(`• ${suggestion}`, 'info'); });
      const line = pos.lineNumber;
      const debugCode = `console.log('Debug line ${line}:', );`;
      editor.executeEdits('', [{ 
        range: new monaco.Range(line, 1, line, 1),
        text: debugCode + '\n' 
      }]);
    } catch (error) {
      console.error('Debug code failed:', error);
      addOutput('❌ Debug failed', 'error');
    }
  }

  generateDocs() { 
    try {
      const code = editor.getValue();
      const functions = this.extractFunctions(code);
      if (functions.length === 0) { 
        addOutput('No functions found to document', 'warning');
        return; 
      }
      let documented = code;
      functions.forEach(func => { 
        const docComment = `/**\n * ${func.name} - Description\n * @param {*} param - Parameter description\n * @returns {*} Return description\n */\n`;
        documented = documented.replace(func.signature, docComment + func.signature); 
      });
      editor.setValue(documented);
      addOutput('📝 Documentation added', 'success');
    } catch (error) {
      console.error('Generate docs failed:', error);
      addOutput('❌ Documentation generation failed', 'error');
    }
  }

  explainCode() { const selection = editor.getSelection();
    const selectedText = editor.getModel().getValueInRange(selection);
    const code = selectedText || editor.getValue();

    addOutput('💡 Code Explanation:', 'info');

    if (code.includes('function')) { addOutput('This code defines a function', 'log'); }
    if (code.includes('for') || code.includes('while')) { addOutput('Contains loop structures for iteration', 'log'); }
    if (code.includes('if')) { addOutput('Uses conditional statements for logic flow', 'log'); }
    if (code.includes('class')) { addOutput('Defines a class with object-oriented structure', 'log'); } }

  fixSyntax() { 
    try {
      const code = editor.getValue();
      const fixed = code
        .replace(/;\s*\n\s*\n/g, ';\n')
        .replace(/\{\s*\n\s*\n/g, '{\n')
        .replace(/\}\s*\n\s*\n/g, '}\n');
      editor.setValue(fixed);
      addOutput('✓ Syntax cleaned', 'success');
    } catch (error) {
      console.error('Fix syntax failed:', error);
      addOutput('❌ Syntax fix failed', 'error');
    }
  }

  optimizeCode() { 
    try {
      addOutput('🚀 Code optimization suggestions ready', 'info');
      addOutput('• Remove unused variables', 'log');
      addOutput('• Combine similar operations', 'log');
      addOutput('• Use more efficient algorithms', 'log');
    } catch (error) {
      console.error('Optimize code failed:', error);
      addOutput('❌ Optimization failed', 'error');
    }
  }

  addComments() { 
    try {
      const code = editor.getValue();
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
      editor.setValue(commented);
      addOutput('💬 Comments added', 'success');
    } catch (error) {
      console.error('Add comments failed:', error);
      addOutput('❌ Adding comments failed', 'error');
    }
  }

  convertToTS() { 
    try {
      const code = editor.getValue();
      const typescript = code
        .replace(/function\s+(\w+)\s*\(/g, 'function $1(')
        .replace(/const\s+(\w+)\s*=/g, 'const $1: any =')
        .replace(/let\s+(\w+)\s*=/g, 'let $1: any =');
      const filename = (state.currentFile || 'converted.js').replace('.js', '.ts');
      createFile(filename, typescript);
      addOutput('🔷 Converted to TypeScript', 'success');
    } catch (error) {
      console.error('Convert to TS failed:', error);
      addOutput('❌ TypeScript conversion failed', 'error');
    }
  }

  async getAIAnalysis(code) { 
    if (!this.apiKey) return;
    try { 
      const response = await this.callAI(`Analyze this code for issues and improvements:\n\n${code}`);
      addOutput('🤖 AI Analysis:', 'info');
      addOutput(response, 'log'); 
    } catch (error) { 
      console.error('AI analysis error:', error);
      addOutput('AI analysis unavailable', 'warning'); 
    } 
  }

  async getAIReview(code) { 
    if (!this.apiKey) return;
    try { 
      const response = await this.callAI(`Review this code for best practices and security:\n\n${code}`);
      addOutput('🤖 AI Review:', 'info');
      addOutput(response, 'log'); 
    } catch (error) { 
      console.error('AI review error:', error);
      addOutput('AI review unavailable', 'warning'); 
    } 
  }

  async getAIRefactoring(code) { 
    if (!this.apiKey) return;
    try { 
      const response = await this.callAI(`Suggest refactoring for this code:\n\n${code}`);
      addOutput('🤖 AI Refactoring:', 'info');
      addOutput(response, 'log'); 
    } catch (error) { 
      console.error('AI refactoring error:', error);
      addOutput('AI refactoring unavailable', 'warning'); 
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

  // Utility methods
  getCodeStats(code) { const lines = code.split('\n').length;
    const functions = (code.match(/function/g) || []).length;
    const complexity = Math.min(10, Math.floor(lines / 10) + functions);
    return { lines, functions, complexity }; }

  extractFunctions(code) { const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(code)) !== null) { functions.push({ name: match[1],
        signature: match[0] }); }

    return functions; } }

// Global AI assistant
window.aiAssistant = new AIAssistant();

if (typeof module !== 'undefined' && module.exports) { module.exports = AIAssistant; }