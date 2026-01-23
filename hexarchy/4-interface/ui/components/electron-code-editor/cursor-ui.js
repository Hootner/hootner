/**
 * HOOTNER Cursor-Style UI - AI-Powered Code Editor Interface
 * Implements Cursor-like AI modes: Chat, Write, Refactor, Modernize
 */

class CursorAIModes {
  constructor(editor) {
    this.editor = editor
    this.activeMode = null
  }

  async chatMode(prompt) {
    const code = this.editor?.getValue() || ''
    const response = await this.processPrompt(prompt, code, 'chat')
    return { response }
  }

  async writeMode(prompt) {
    const generatedCode = await this.generateCode(prompt)
    if (this.editor) {
      const position = this.editor.getPosition()
      this.editor.executeEdits('ai-write', [
        {
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: generatedCode,
        },
      ])
    }
    return { code: generatedCode }
  }

  async refactorMode(prompt) {
    const code = this.editor?.getValue() || ''
    const refactoredCode = await this.refactorCode(code, prompt)
    if (this.editor && refactoredCode !== code) {
      this.editor.setValue(refactoredCode)
    }
    return { type: 'refactored', code: refactoredCode }
  }

  async modernize(target = 'typescript') {
    const code = this.editor?.getValue() || ''
    const modernizedCode = await this.modernizeCode(code, target)
    if (this.editor) {
      this.editor.setValue(modernizedCode)
    }
    return { target, code: modernizedCode }
  }

  async processPrompt(prompt, code, mode) {
    // Simulate AI processing
    const responses = {
      chat: `Based on your code, here are some suggestions:\n• Consider adding error handling\n• Use more descriptive variable names\n• Add unit tests for better coverage`,
      analysis: `Code analysis complete:\n• ${code.split('\n').length} lines of code\n• ${(code.match(/function/g) || []).length} functions detected\n• No major issues found`,
    }

    return responses[mode] || responses.chat
  }

  async generateCode(prompt) {
    // Simple code generation based on prompt
    const templates = {
      function: `function ${prompt.replace(/\s+/g, '')}() {\n  // TODO: Implement function logic\n  return null;\n}`,
      class: `class ${prompt.replace(/\s+/g, '')} {\n  constructor() {\n    // TODO: Initialize properties\n  }\n}`,
      api: `async function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('API Error:', error);\n    throw error;\n  }\n}`,
    }

    if (prompt.includes('function')) return templates.function
    if (prompt.includes('class')) return templates.class
    if (prompt.includes('api') || prompt.includes('fetch')) return templates.api

    return `// Generated code for: ${prompt}\nconsole.log('${prompt}');`
  }

  async refactorCode(code, type) {
    let refactored = code

    switch (type) {
      case 'modern':
        refactored = refactored
          .replace(/var\s+/g, 'const ')
          .replace(/function\s+(\w+)\s*\(/g, 'const $1 = (')
          .replace(/\.then\(/g, ' await ')
        break
      case 'clean':
        refactored = refactored
          .replace(/console\.log\([^)]*\);?\n?/g, '')
          .replace(/\n\s*\n\s*\n/g, '\n\n')
        break
      case 'optimize':
        refactored = refactored.replace(
          /document\.getElementById\(([^)]+)\)/g,
          'document.querySelector(`#${$1}`)'
        )
        break
    }

    return refactored
  }

  async modernizeCode(code, target) {
    switch (target) {
      case 'typescript':
        return code
          .replace(/\.js/g, '.ts')
          .replace(/const\s+(\w+)\s*=/g, 'const $1: any =')
          .replace(/function\s+(\w+)\s*\(/g, 'function $1(')
      case 'es6':
        return code
          .replace(/var\s+/g, 'const ')
          .replace(/function\s+(\w+)\s*\(/g, 'const $1 = (')
      default:
        return code
    }
  }
}

class CursorUI {
  constructor(editor) {
    this.aiModes = new CursorAIModes(editor)
    this.editor = editor
    this.activeMode = null
    this.sessionToken = crypto.randomUUID()
    this.init()
  }

  init() {
    this.createModeSelector()
    this.createInlineChat()
    this.bindShortcuts()
  }

  createModeSelector() {
    const selector = document.createElement('div')
    selector.id = 'aiModeSelector'
    selector.innerHTML = `
      <div class="ai-mode-selector">
        <div class="mode-title">AI MODE</div>
        <button data-mode="chat" class="ai-mode-btn">💬 Chat</button>
        <button data-mode="write" class="ai-mode-btn">✍️ Write</button>
        <button data-mode="refactor" class="ai-mode-btn">🔧 Refactor</button>
        <button data-mode="modernize" class="ai-mode-btn">🚀 Modernize</button>
      </div>
    `

    // Add event listeners
    selector.querySelectorAll('.ai-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.setMode(btn.dataset.mode))
    })

    document.body.appendChild(selector)
    this.addModeStyles()
  }

  createInlineChat() {
    const chat = document.createElement('div')
    chat.id = 'inlineAIChat'
    chat.className = 'inline-chat hidden'
    chat.innerHTML = `
      <div class="chat-container">
        <div class="chat-header">
          <span id="modeIndicator" class="mode-indicator">💬 CHAT</span>
          <button class="chat-close" onclick="cursorUI.hideChat()">×</button>
        </div>
        <div class="chat-input-container">
          <input type="text" id="aiPrompt" placeholder="Ask AI or give instructions..." class="chat-input">
          <button id="sendBtn" class="send-btn">Send</button>
        </div>
        <div id="aiResponse" class="chat-response"></div>
      </div>
    `

    // Add event listeners
    const sendBtn = chat.querySelector('#sendBtn')
    const promptInput = chat.querySelector('#aiPrompt')

    sendBtn.addEventListener('click', () => this.execute())
    promptInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.execute()
    })

    document.body.appendChild(chat)
  }

  addModeStyles() {
    const styles = `
      .ai-mode-selector {
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--bg-secondary, #2d2d2d);
        border: 2px solid var(--accent, #007acc);
        border-radius: 8px;
        padding: 12px;
        z-index: 9998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .mode-title {
        font-size: 12px;
        color: var(--text, #fff);
        margin-bottom: 8px;
        font-weight: bold;
        text-align: center;
      }
      
      .ai-mode-btn {
        display: block;
        width: 100%;
        padding: 8px 12px;
        margin: 4px 0;
        background: var(--bg, #1e1e1e);
        border: 1px solid var(--border, #444);
        border-radius: 4px;
        color: var(--text, #fff);
        cursor: pointer;
        text-align: left;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .ai-mode-btn:hover {
        background: var(--hover, #333);
        border-color: var(--accent, #007acc);
      }
      
      .ai-mode-btn.active {
        background: var(--accent, #007acc);
        color: white;
      }
      
      .inline-chat {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        max-width: 90vw;
        z-index: 9999;
      }
      
      .inline-chat.hidden {
        display: none;
      }
      
      .chat-container {
        background: var(--bg-secondary, #2d2d2d);
        border: 2px solid var(--accent, #007acc);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        overflow: hidden;
      }
      
      .chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--accent, #007acc);
        color: white;
      }
      
      .mode-indicator {
        font-weight: bold;
        font-size: 14px;
      }
      
      .chat-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
      }
      
      .chat-input-container {
        display: flex;
        padding: 16px;
        gap: 8px;
      }
      
      .chat-input {
        flex: 1;
        padding: 10px 12px;
        background: var(--bg, #1e1e1e);
        border: 1px solid var(--border, #444);
        border-radius: 4px;
        color: var(--text, #fff);
        outline: none;
        font-size: 14px;
      }
      
      .send-btn {
        padding: 10px 20px;
        background: var(--accent, #007acc);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }
      
      .chat-response {
        max-height: 200px;
        overflow-y: auto;
        padding: 16px;
        background: var(--bg, #1e1e1e);
        font-size: 13px;
        line-height: 1.6;
        color: var(--text, #fff);
      }
      
      .response-success {
        color: #4caf50;
      }
      
      .response-error {
        color: #f44336;
      }
      
      .response-info {
        color: var(--accent, #007acc);
      }
    `

    const styleSheet = document.createElement('style')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }

  setMode(mode) {
    this.activeMode = mode

    // Update button states
    document.querySelectorAll('.ai-mode-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === mode)
    })

    // Update mode indicator
    const icons = { chat: '💬', write: '✍️', refactor: '🔧', modernize: '🚀' }
    const labels = {
      chat: 'CHAT',
      write: 'WRITE',
      refactor: 'REFACTOR',
      modernize: 'MODERNIZE',
    }

    const indicator = document.getElementById('modeIndicator')
    if (indicator) {
      indicator.textContent = `${icons[mode]} ${labels[mode]}`
    }

    // Show chat interface
    this.showChat()

    // Focus input
    const input = document.getElementById('aiPrompt')
    if (input) {
      input.focus()
    }
  }

  showChat() {
    const chat = document.getElementById('inlineAIChat')
    if (chat) {
      chat.classList.remove('hidden')
    }
  }

  hideChat() {
    const chat = document.getElementById('inlineAIChat')
    if (chat) {
      chat.classList.add('hidden')
    }
    this.activeMode = null

    // Reset button states
    document.querySelectorAll('.ai-mode-btn').forEach((btn) => {
      btn.classList.remove('active')
    })
  }

  async execute() {
    const promptInput = document.getElementById('aiPrompt')
    const prompt = promptInput?.value.trim()

    if (!prompt || !this.activeMode) return

    const response = document.getElementById('aiResponse')
    if (response) {
      response.innerHTML = '<div class="response-info">⏳ Processing...</div>'
    }

    try {
      let result

      switch (this.activeMode) {
        case 'chat':
          result = await this.aiModes.chatMode(prompt)
          this.displayResponse(result.response, 'info')
          break

        case 'write':
          result = await this.aiModes.writeMode(prompt)
          this.displayResponse('✅ Code generated and inserted', 'success')
          break

        case 'refactor':
          result = await this.aiModes.refactorMode(prompt)
          this.displayResponse(`✅ Code refactored: ${result.type}`, 'success')
          break

        case 'modernize':
          result = await this.aiModes.modernize(prompt || 'typescript')
          this.displayResponse(`✅ Code modernized to ${result.target}`, 'success')
          break
      }
    } catch (error) {
      this.displayResponse(`❌ Error: ${error.message}`, 'error')
    }

    // Clear input
    if (promptInput) {
      promptInput.value = ''
    }
  }

  displayResponse(message, type = 'info') {
    const response = document.getElementById('aiResponse')
    if (!response) return

    const className = `response-${type}`
    response.innerHTML = `<div class="${className}">${message}</div>`
  }

  bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K for Chat mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        this.setMode('chat')
      }

      // Ctrl+L for Write mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        this.setMode('write')
      }

      // Escape to close
      if (e.key === 'Escape' && this.activeMode) {
        this.hideChat()
      }
    })
  }
}

// Initialize Cursor UI
let cursorUI

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (window.editor) {
      cursorUI = new CursorUI(window.editor)
      window.cursorUI = cursorUI
    } else {
      // Initialize without editor for standalone use
      cursorUI = new CursorUI(null)
      window.cursorUI = cursorUI
    }
  })
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CursorUI, CursorAIModes }
}
