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

  connect(language, serverUrl) {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(serverUrl);

        ws.addEventListener("open", () => {
          this.connections.set(language, ws);
          try {
            this.initialize(language);
          } catch (err) {
            console.error("LSP initialize failed:", err);
          }
          resolve(ws);
        });

        ws.addEventListener("error", (err) => {
          reject(
            new Error(
              `LSP connection failed: ${err && err.message ? err.message : String(err)}`
            )
          );
        });

        ws.addEventListener("message", (event) => {
          let payload = null;
          try {
            payload = JSON.parse(event.data);
          } catch (err) {
            console.error("LSP message JSON parse error:", err);
          }
          this.handleMessage(language, payload);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  initialize(language) {
    const ws = this.connections.get(language);
    if (!ws) return;

    const initMsg = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        processId: null,
        rootUri: "file:///workspace",
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
            publishDiagnostics: { relatedInformation: true },
          },
        },
      },
    };

    try {
      ws.send(JSON.stringify(initMsg));
    } catch (err) {
      console.error("LSP initialize send failed:", err);
    }
  }

  handleMessage(language, message) {
    if (!message) return;
    try {
      if (message.method === "textDocument/publishDiagnostics") {
        this.handleDiagnostics(message.params);
      } else if (message.id && message.result) {
        this.handleResponse(language, message);
      }
    } catch (error) {
      console.error("LSP handleMessage error:", error);
    }
  }

  handleDiagnostics(params) {
    if (!params) return;
    const { uri, diagnostics } = params;
    if (!uri) return;
    this.diagnostics.set(uri, diagnostics || []);

    if (typeof window !== "undefined" && window.updateProblems) {
      try {
        window.updateProblems(diagnostics || []);
      } catch (err) {
        console.error("updateProblems failed:", err);
      }
    }
  }

  handleResponse(language, message) {
    if (!message || !message.result) return;
    const result = message.result;
    if (result.capabilities) {
      this.capabilities[language] = result.capabilities;
    }
  }

  getCompletions(language, document, position) {
    const ws = this.connections.get(language);
    if (!ws) return Promise.resolve([]);

    return new Promise((resolve) => {
      const id = Date.now();
      const timeoutMs =
        typeof UI_CONSTANTS !== "undefined" && UI_CONSTANTS.TIMEOUT_LONG
          ? UI_CONSTANTS.TIMEOUT_LONG
          : 5000;
      const timeout = setTimeout(() => {
        ws.removeEventListener("message", handler);
        resolve([]);
      }, timeoutMs);

      const handler = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id === id) {
            clearTimeout(timeout);
            ws.removeEventListener("message", handler);
            if (msg.result && Array.isArray(msg.result.items))
              return resolve(msg.result.items);
            return resolve(msg.result || []);
          }
        } catch (err) {
          console.error("LSP completion handler error:", err);
        }
      };

      ws.addEventListener("message", handler);

      try {
        ws.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            method: "textDocument/completion",
            params: { textDocument: { uri: document }, position },
          })
        );
      } catch (err) {
        clearTimeout(timeout);
        ws.removeEventListener("message", handler);
        console.error("LSP completion send failed:", err);
        resolve([]);
      }
    });
  }

  getHover(language, document, position) {
    const ws = this.connections.get(language);
    if (!ws) return Promise.resolve(null);

    return new Promise((resolve) => {
      const id = Date.now();
      const timeoutMs =
        typeof UI_CONSTANTS !== "undefined" && UI_CONSTANTS.DEFAULT_PORT
          ? UI_CONSTANTS.DEFAULT_PORT
          : 3000;
      const timeout = setTimeout(() => {
        ws.removeEventListener("message", handler);
        resolve(null);
      }, timeoutMs);

      const handler = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id === id) {
            clearTimeout(timeout);
            ws.removeEventListener("message", handler);
            resolve(msg.result || null);
          }
        } catch (err) {
          console.error("LSP hover handler error:", err);
        }
      };

      ws.addEventListener("message", handler);

      try {
        ws.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            method: "textDocument/hover",
            params: { textDocument: { uri: document }, position },
          })
        );
      } catch (err) {
        clearTimeout(timeout);
        ws.removeEventListener("message", handler);
        console.error("LSP hover send failed:", err);
        resolve(null);
      }
    });
  }

  notifyDidOpen(language, document, text) {
    const ws = this.connections.get(language);
    if (!ws) return;

    try {
      ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "textDocument/didOpen",
          params: {
            textDocument: {
              uri: document,
              languageId: language,
              version: 1,
              text,
            },
          },
        })
      );
    } catch (err) {
      console.error("LSP didOpen send failed:", err);
    }
  }

  notifyDidChange(language, document, text, version = 1) {
    const ws = this.connections.get(language);
    if (!ws) return;

    try {
      ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "textDocument/didChange",
          params: {
            textDocument: { uri: document, version },
            contentChanges: [{ text }],
          },
        })
      );
    } catch (err) {
      console.error("LSP didChange send failed:", err);
    }
  }

  disconnect(language) {
    const ws = this.connections.get(language);
    if (!ws) return;
    try {
      if (ws.close && typeof ws.close === "function") ws.close();
    } catch (err) {
      console.error("LSP disconnect error:", err);
    } finally {
      this.connections.delete(language);
    }
  }

  disconnectAll() {
    this.connections.forEach((ws, lang) => this.disconnect(lang));
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = LSPClient;
}
