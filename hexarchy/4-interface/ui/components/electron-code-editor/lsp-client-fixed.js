/**
 * LSP Client for Monaco Editor
 * Provides Language Server Protocol integration
 */

class LSPClient {
  constructor() {
    this.connections = new Map();
    this.diagnostics = new Map();
    this.capabilities = {};
  }

  async connect(language, serverUrl) {
    try {
      const ws = new WebSocket(serverUrl);
      
      return new Promise((resolve, reject) => {
        ws.onopen = () => {
          this.connections.set(language, ws);
          this.initialize(language);
          resolve(ws);
        };

        ws.onerror = (error) => reject(new Error(`LSP connection failed: ${error.message}`));
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(language, message);
          } catch (error) {
            console.error('LSP message parse error:', error);
          }
        };
      });
    } catch (error) {
      console.error(`LSP connect error for ${language}:`, error);
      throw error;
    }
  }

  initialize(language) {
    const ws = this.connections.get(language);
    if (!ws) return;

    ws.send(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        processId: null,
        rootUri: 'file:///workspace',
        capabilities: {
          textDocument: {
            completion: { dynamicRegistration: true },
            hover: { dynamicRegistration: true },
            signatureHelp: { dynamicRegistration: true },
            definition: { dynamicRegistration: true },
            references: { dynamicRegistration: true },
            documentHighlight: { dynamicRegistration: true },
            documentSymbol: { dynamicRegistration: true },
            formatting: { dynamicRegistration: true },
            rangeFormatting: { dynamicRegistration: true },
            rename: { dynamicRegistration: true },
            publishDiagnostics: { relatedInformation: true }
          }
        }
      }
    }));
  }

  handleMessage(language, message) {
    try {
      if (message.method === 'textDocument/publishDiagnostics') {
        this.handleDiagnostics(message.params);
      } else if (message.id && message.result) {
        this.handleResponse(language, message);
      }
    } catch (error) {
      console.error('LSP message handling error:', error);
    }
  }

  handleDiagnostics(params) {
    const { uri, diagnostics } = params;
    this.diagnostics.set(uri, diagnostics);
    
    if (window.updateProblems) {
      window.updateProblems(diagnostics);
    }
  }

  handleResponse(language, message) {
    if (message.result && message.result.capabilities) {
      this.capabilities[language] = message.result.capabilities;
    }
  }

  async getCompletions(language, document, position) {
    const ws = this.connections.get(language);
    if (!ws) return [];

    try {
      return new Promise((resolve) => {
        const id = Date.now();
        const timeout = setTimeout(() => resolve([]), 5000);

        const handler = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.id === id) {
              clearTimeout(timeout);
              ws.removeEventListener('message', handler);
              resolve(msg.result?.items || []);
            }
          } catch (error) {
            console.error('Completion response error:', error);
            resolve([]);
          }
        };

        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id,
          method: 'textDocument/completion',
          params: { textDocument: { uri: document }, position }
        }));
      });
    } catch (error) {
      console.error('LSP completion error:', error);
      return [];
    }
  }

  async getHover(language, document, position) {
    const ws = this.connections.get(language);
    if (!ws) return null;

    try {
      return new Promise((resolve) => {
        const id = Date.now();
        const timeout = setTimeout(() => resolve(null), 5000);

        const handler = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.id === id) {
              clearTimeout(timeout);
              ws.removeEventListener('message', handler);
              resolve(msg.result);
            }
          } catch (error) {
            console.error('Hover response error:', error);
            resolve(null);
          }
        };

        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id,
          method: 'textDocument/hover',
          params: { textDocument: { uri: document }, position }
        }));
      });
    } catch (error) {
      console.error('LSP hover error:', error);
      return null;
    }
  }

  notifyDidOpen(language, document, text) {
    const ws = this.connections.get(language);
    if (!ws) return;

    try {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        method: 'textDocument/didOpen',
        params: {
          textDocument: {
            uri: document,
            languageId: language,
            version: 1,
            text
          }
        }
      }));
    } catch (error) {
      console.error('LSP didOpen error:', error);
    }
  }

  notifyDidChange(language, document, text, version) {
    const ws = this.connections.get(language);
    if (!ws) return;

    try {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        method: 'textDocument/didChange',
        params: {
          textDocument: { uri: document, version },
          contentChanges: [{ text }]
        }
      }));
    } catch (error) {
      console.error('LSP didChange error:', error);
    }
  }

  disconnect(language) {
    const ws = this.connections.get(language);
    if (ws) {
      try {
        ws.close();
        this.connections.delete(language);
      } catch (error) {
        console.error('LSP disconnect error:', error);
      }
    }
  }

  disconnectAll() {
    this.connections.forEach((ws, lang) => this.disconnect(lang));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LSPClient;
}